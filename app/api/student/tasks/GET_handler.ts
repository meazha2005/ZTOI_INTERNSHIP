import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';
import { formatShortDate } from '@/lib/utils/date';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                sub.task_id as id, 
                t.title as taskTitle, 
                t.description as taskDescription,
                sub.status, 
                sub.rejection_reason as rejectionReason, 
                UNIX_TIMESTAMP(sub.submitted_at) * 1000 as submittedAtMs
            FROM internship_task_submissions sub
            JOIN internship_tasks t ON t.id = sub.task_id
            WHERE sub.student_id = ?
        `, [studentId]);

        const tasks = rows.map(r => ({
            ...r,
            submittedAt: formatShortDate(Number(r.submittedAtMs))
        }));

        return res.status(200).json({ tasks });
    } catch (error) {
        console.error('Error fetching student tasks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
