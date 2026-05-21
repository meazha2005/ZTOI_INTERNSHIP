import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const [studentRows] = await pool.query<RowDataPacket[]>(
            'SELECT certificate_status, registered_at, d.name as domain_name FROM internship_students s JOIN internship_domains d ON s.domain_id = d.id WHERE s.id = ?', 
            [studentId]
        );
        const student = studentRows[0];

        const [taskRows] = await pool.query<RowDataPacket[]>(
            'SELECT status, COUNT(*) as count FROM internship_task_submissions WHERE student_id = ? GROUP BY status',
            [studentId]
        );

        let tasksAssigned = 0;
        let tasksCompleted = 0;
        let resubmissionCount = 0;

        for (const row of taskRows) {
            tasksAssigned += Number(row.count);
            if (row.status === 'accepted') tasksCompleted += Number(row.count);
            if (row.status === 'rejected') resubmissionCount += Number(row.count);
        }

        const tasksPending = tasksAssigned - tasksCompleted;

        const [chatRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as unreadCount FROM internship_chat_messages WHERE student_id = ? AND sender_role = 'admin' AND is_read = 0",
            [studentId]
        );
        const unreadCount = Number(chatRows[0].unreadCount);

        const [activitiesRows] = await pool.query<RowDataPacket[]>(`
            SELECT 'info' as type, CONCAT('You registered for ', ?, ' internship') as text, UNIX_TIMESTAMP(registered_at) * 1000 as timestamp_ms 
            FROM internship_students WHERE id = ?
            UNION ALL
            SELECT 'success' as type, CONCAT('Task "', t.title, '" was accepted') as text, UNIX_TIMESTAMP(sub.reviewed_at) * 1000 as timestamp_ms 
            FROM internship_task_submissions sub JOIN internship_tasks t ON t.id = sub.task_id 
            WHERE sub.student_id = ? AND sub.status = 'accepted' AND sub.reviewed_at IS NOT NULL
            UNION ALL
            SELECT 'error' as type, CONCAT('Task "', t.title, '" was rejected — please resubmit') as text, UNIX_TIMESTAMP(sub.reviewed_at) * 1000 as timestamp_ms 
            FROM internship_task_submissions sub JOIN internship_tasks t ON t.id = sub.task_id 
            WHERE sub.student_id = ? AND sub.status = 'rejected' AND sub.reviewed_at IS NOT NULL
            UNION ALL
            SELECT 'info' as type, 'New message from your mentor' as text, UNIX_TIMESTAMP(sent_at) * 1000 as timestamp_ms 
            FROM internship_chat_messages 
            WHERE student_id = ? AND sender_role = 'admin'
            ORDER BY timestamp_ms DESC
            LIMIT 5
        `, [student.domain_name, studentId, studentId, studentId, studentId]);

        const formatRelativeTime = (ms: number) => {
            if (!ms) return '';
            const d = new Date(ms);
            const diffMs = Date.now() - d.getTime();
            if (diffMs < 0) return 'Just now';
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) return `${Math.max(1, diffMins)} minutes ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hours ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays < 7) return `${diffDays} days ago`;
            return `${Math.floor(diffDays / 7)} weeks ago`;
        };

        const activities = activitiesRows.map(row => ({
            text: row.text,
            time: formatRelativeTime(Number(row.timestamp_ms)),
            type: row.type
        }));

        return res.json({
            stats: {
                tasksAssigned,
                tasksCompleted,
                tasksPending,
                certificateStatus: student.certificate_status
            },
            quickActions: {
                resubmissionCount,
                unreadCount
            },
            activities
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
