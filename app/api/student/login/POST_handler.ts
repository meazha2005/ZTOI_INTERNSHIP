import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT s.*, d.name as domain_name 
             FROM internship_students s 
             JOIN internship_domains d ON s.domain_id = d.id 
             WHERE s.email = ?`, 
            [email]
        );
        const student = rows[0];

        if (!student) return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, student.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        if (student.email_verified === 0) {
            // Automatically send verification email
            const token = jwt.sign({ email }, process.env.JWT_SECRET || 'meazha', { expiresIn: '1d' });
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || '',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_PORT === '465',
                auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' }
            });
            const siteUrl = `http://${req.get('host')}`;
            const verifyUrl = `${siteUrl}/verify-email?token=${token}`;
            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || process.env.SMTP_USER || '"ZTOI Tech" <noreply@ztoitech.com>',
                    to: email,
                    subject: 'Verify your ZTOI Tech Internship account',
                    html: `<p>Hello ${student.name},</p><p>Please click the link below to verify your email address:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
                });
            } catch (emailErr) {
                console.error('Failed to send verification email:', emailErr);
            }
            return res.status(403).json({ error: 'unverified', email: student.email });
        }
        if (student.status === 'blocked') return res.status(403).json({ error: 'Your account has been blocked' });

        const sessionId = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

        await pool.query(
            'INSERT INTO internship_sessions (id, user_type, user_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [sessionId, 'student', student.id, req.ip || '', req.headers['user-agent'] || '', expiresAt]
        );

        res.cookie('student_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Logged in successfully',
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                domain_id: student.domain_id,
                domain_name: student.domain_name,
                photo_path: student.photo_path
            }
        });
    } catch (error) {
        console.error('Student login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
