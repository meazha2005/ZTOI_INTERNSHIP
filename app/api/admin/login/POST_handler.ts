import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM internship_admins WHERE email = ?', [email]);
        const admin = rows[0];

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, admin.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

        await pool.query(
            'INSERT INTO internship_sessions (id, user_type, user_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [sessionId, 'admin', admin.id, req.ip || '', req.headers['user-agent'] || '', expiresAt]
        );

        res.cookie('admin_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        return res.status(200).json({
            message: 'Logged in successfully',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
