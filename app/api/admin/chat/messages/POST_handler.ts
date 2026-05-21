import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const { content, student_id } = req.body;
        const file = req.file;

        let attachment_name = null;
        let attachment_path = null;

        if (file) {
            attachment_name = file.originalname;
            attachment_path = file.path.startsWith('http') ? file.path : `/uploads/chat/${file.filename}`;
        }

        await pool.query(
            'INSERT INTO internship_chat_messages (student_id, sender_role, sender_id, content, attachment_name, attachment_path) VALUES (?, "admin", ?, ?, ?, ?)',
            [student_id, adminId, content || '', attachment_name, attachment_path]
        );

        return res.json({ success: true });
    } catch (error) {
        console.error('Error sending admin chat message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
