import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' });

        let payload: any;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'meazha');
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (payload.type !== 'reset') {
            return res.status(400).json({ error: 'Invalid token type' });
        }

        const email = payload.email;
        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await pool.query('UPDATE internship_students SET password_hash = ? WHERE email = ?', [password_hash, email]);
        
        if ((result as any).affectedRows === 0) {
            return res.status(400).json({ error: 'Student not found' });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
