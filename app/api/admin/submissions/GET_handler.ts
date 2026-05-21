import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';
import { formatDateWithTime } from '@/lib/utils/date';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                sub.id,
                s.name as studentName,
                s.email as studentEmail,
                d.name as domain,
                t.title as taskTitle,
                sub.status,
                sub.file_path as filePath,
                sub.rejection_reason as rejectionReason,
                UNIX_TIMESTAMP(sub.submitted_at) * 1000 as submittedAtMs
            FROM internship_task_submissions sub
            JOIN internship_students s ON s.id = sub.student_id
            JOIN internship_domains d ON d.id = s.domain_id
            JOIN internship_tasks t ON t.id = sub.task_id
            WHERE sub.status != 'pending'
            ORDER BY sub.submitted_at DESC
        `);

        const submissions = rows.map(r => ({
            ...r,
            submittedAt: formatDateWithTime(Number(r.submittedAtMs))
        }));

        return res.status(200).json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
