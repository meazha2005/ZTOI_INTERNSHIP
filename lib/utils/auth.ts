import { Request } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export async function getStudentId(req: Request): Promise<number | null> {
    const sessionId = req.cookies?.student_session;
    if (!sessionId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM internship_sessions WHERE id = ? AND user_type = "student" AND expires_at > NOW()',
        [sessionId]
    );
    if (rows.length === 0) return null;
    return rows[0].user_id as number;
}

export async function getAdminId(req: Request): Promise<number | null> {
    const sessionId = req.cookies?.admin_session;
    if (!sessionId) return null;
    const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT user_id FROM internship_sessions WHERE id = ? AND user_type = "admin" AND expires_at > NOW()',
        [sessionId]
    );
    if (rows.length === 0) return null;
    return rows[0].user_id as number;
}
