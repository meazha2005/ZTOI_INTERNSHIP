import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';
import nodemailer from 'nodemailer';

export default async function (req: Request, res: Response) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM internship_students WHERE email = ?', [email]);
        
        // Don't leak whether email exists or not for security reasons, just return success if not found
        // But for UX, we might want to tell them. Let's return success regardless.
        if (rows.length === 0) {
            return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a reset link.' });
        }

        const student = rows[0];
        
        // Generate a 1-hour expiration token
        const token = jwt.sign({ email, type: 'reset' }, process.env.JWT_SECRET || 'meazha', { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        });

        const siteUrl = `http://${req.get('host')}`;
        const resetUrl = `${siteUrl}/reset-password?token=${token}`;

        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER || '"ZTOI Tech" <noreply@ztoitech.com>',
                to: email,
                subject: 'Reset Your ZTOI Tech Password',
                html: `<p>Hello ${student.name},</p>
                       <p>We received a request to reset your password. Click the link below to set a new password:</p>
                       <p><a href="${resetUrl}">${resetUrl}</a></p>
                       <p>If you did not request this, you can safely ignore this email. The link expires in 1 hour.</p>`
            });
        } catch (emailErr) {
            console.error('Failed to send reset email:', emailErr);
            return res.status(500).json({ error: 'Failed to send reset email. Please try again later.' });
        }

        return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a reset link.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
