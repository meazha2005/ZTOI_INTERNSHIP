import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const sessionId = req.cookies?.student_session;
        if (sessionId) {
            await pool.query('DELETE FROM internship_sessions WHERE id = ?', [sessionId]);
            res.clearCookie('student_session');
        }
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Student logout error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
