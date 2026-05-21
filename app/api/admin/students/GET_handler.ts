import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';
import { formatShortDate } from '@/lib/utils/date';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query(`
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.phone, 
                s.dob, 
                s.college, 
                s.address, 
                s.photo_path as photo, 
                s.status, 
                s.certificate_status as certificateStatus, 
                UNIX_TIMESTAMP(s.registered_at) * 1000 as registeredAtMs,
                d.name as domain,
                (SELECT COUNT(*) FROM internship_task_submissions WHERE student_id = s.id AND status = 'accepted') as tasksCompleted
            FROM internship_students s
            JOIN internship_domains d ON s.domain_id = d.id
            ORDER BY s.registered_at DESC
        `);

        const students = (rows as RowDataPacket[]).map(r => ({
            ...r,
            registeredAt: formatShortDate(Number(r.registeredAtMs)) // the frontend expects string Date
        }));

        return res.json({ students });
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
