import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [studentsRows] = await pool.query<RowDataPacket[]>(`
            SELECT s.id, s.name, s.photo_path, d.name as domain
            FROM internship_students s
            JOIN internship_domains d ON s.domain_id = d.id
        `);

        const students = studentsRows.map(s => ({
            id: s.id.toString(),
            name: s.name,
            photo: s.photo_path,
            domain: s.domain
        }));

        const [messagesRows] = await pool.query<RowDataPacket[]>(`
            SELECT id, student_id, sender_role, sender_id, content, attachment_name, attachment_path, UNIX_TIMESTAMP(sent_at) * 1000 as timestamp_ms, is_read
            FROM internship_chat_messages
            ORDER BY sent_at ASC
        `);

        const conversations: Record<string, any[]> = {};
        for (const r of messagesRows) {
            const sId = r.student_id.toString();
            if (!conversations[sId]) conversations[sId] = [];
            
            conversations[sId].push({
                id: r.id.toString(),
                senderId: r.sender_id.toString(),
                senderName: r.sender_role === 'admin' ? 'ZTOI Mentor' : 'Student',
                senderRole: r.sender_role,
                content: r.content,
                timestamp: new Date(r.timestamp_ms).toISOString(),
                attachment: r.attachment_name ? { name: r.attachment_name, url: r.attachment_path } : undefined,
                is_read: r.is_read
            });
        }

        return res.json({ students, conversations });
    } catch (error) {
        console.error('Error syncing admin chat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
