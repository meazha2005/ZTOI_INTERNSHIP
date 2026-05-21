import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const { student_id } = req.body;
        
        await pool.query(`UPDATE internship_chat_messages SET is_read = 1 WHERE student_id = ? AND sender_role = 'student' AND is_read = 0`, [student_id]);

        return res.json({ success: true });
    } catch (error) {
        console.error('Error marking chat as read:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
