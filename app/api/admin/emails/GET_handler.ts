import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.phone, 
                s.status, 
                s.certificate_status AS certificateStatus, 
                s.completion_email_sent AS completionEmailSent, 
                s.tasks_completed AS tasksCompleted, 
                d.name AS domain,
                c.cert_number AS certificateNumber,
                (
                    SELECT GROUP_CONCAT(t.title SEPARATOR ', ') 
                    FROM internship_task_submissions sub 
                    JOIN internship_tasks t ON t.id = sub.task_id 
                    WHERE sub.student_id = s.id AND sub.status = 'accepted'
                ) AS completedProjects
            FROM internship_students s
            JOIN internship_domains d ON s.domain_id = d.id
            LEFT JOIN internship_certificates c ON c.student_id = s.id
            ORDER BY s.registered_at DESC
        `);

        return res.json({ students: rows });
    } catch (error) {
        console.error('Error fetching email status students:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
