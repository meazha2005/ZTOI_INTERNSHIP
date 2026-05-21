import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentSession = req.cookies?.student_session;
        const adminSession = req.cookies?.admin_session;

        if (studentSession) {
            const [sessions] = await pool.query<RowDataPacket[]>(
                'SELECT user_id FROM internship_sessions WHERE id = ? AND user_type = "student" AND expires_at > NOW()',
                [studentSession]
            );
            if (sessions.length > 0) {
                const [students] = await pool.query<RowDataPacket[]>(
                    `SELECT s.id, s.name, s.email, d.name as domain_name, s.photo_path 
                     FROM internship_students s 
                     JOIN internship_domains d ON d.id = s.domain_id 
                     WHERE s.id = ?`,
                    [sessions[0].user_id]
                );
                if (students.length > 0) {
                    const student = students[0];
                    return res.json({
                        user: {
                            id: student.id.toString(),
                            name: student.name,
                            email: student.email,
                            role: 'student',
                            domain: student.domain_name,
                            photo: student.photo_path
                        }
                    });
                }
            }
        }

        if (adminSession) {
            const [sessions] = await pool.query<RowDataPacket[]>(
                'SELECT user_id FROM internship_sessions WHERE id = ? AND user_type = "admin" AND expires_at > NOW()',
                [adminSession]
            );
            if (sessions.length > 0) {
                const [admins] = await pool.query<RowDataPacket[]>(
                    'SELECT id, name, email FROM internship_admins WHERE id = ?',
                    [sessions[0].user_id]
                );
                if (admins.length > 0) {
                    const admin = admins[0];
                    return res.json({
                        user: {
                            id: admin.id.toString(),
                            name: admin.name,
                            email: admin.email,
                            role: 'admin'
                        }
                    });
                }
            }
        }

        return res.json({ user: null });
    } catch (error) {
        console.error('Error fetching me:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
