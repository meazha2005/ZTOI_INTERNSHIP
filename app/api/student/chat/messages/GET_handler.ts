import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT id, sender_role as senderRole, sender_id as senderId, content, attachment_name, attachment_path, UNIX_TIMESTAMP(sent_at) * 1000 as timestamp_ms
            FROM internship_chat_messages
            WHERE student_id = ?
            ORDER BY sent_at ASC
        `, [studentId]);

        const messages = rows.map(r => ({
            id: r.id.toString(),
            senderId: r.senderId.toString(),
            senderName: r.senderRole === 'student' ? 'You' : 'ZTOI Mentor',
            senderRole: r.senderRole,
            content: r.content,
            timestamp: new Date(r.timestamp_ms).toISOString(),
            attachment: r.attachment_name ? { name: r.attachment_name, url: r.attachment_path } : undefined
        }));

        await pool.query(`UPDATE internship_chat_messages SET is_read = 1 WHERE student_id = ? AND sender_role = 'admin' AND is_read = 0`, [studentId]);

        return res.json({ messages });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
