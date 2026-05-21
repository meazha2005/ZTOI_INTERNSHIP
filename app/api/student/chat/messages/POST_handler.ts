import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const { content } = req.body;
        const file = req.file;

        let attachment_name = null;
        let attachment_path = null;

        if (file) {
            attachment_name = file.originalname;
            attachment_path = file.path.startsWith('http') ? file.path : `/uploads/chat/${file.filename}`;
        }

        if (!content && !file) return res.status(400).json({ error: 'Content or attachment is required' });

        await pool.query(
            'INSERT INTO internship_chat_messages (student_id, sender_role, sender_id, content, attachment_name, attachment_path) VALUES (?, "student", ?, ?, ?, ?)',
            [studentId, studentId, content || '', attachment_name, attachment_path]
        );

        return res.json({ success: true });
    } catch (error) {
        console.error('Error sending chat message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
