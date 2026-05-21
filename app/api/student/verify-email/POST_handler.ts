import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        let payload: any;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'meazha');
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const email = payload.email;
        const [result] = await pool.query('UPDATE internship_students SET email_verified = 1 WHERE email = ?', [email]);
        
        if ((result as any).affectedRows === 0) {
            return res.status(400).json({ error: 'Student not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Verify email error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
