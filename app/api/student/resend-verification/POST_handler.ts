import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';
import nodemailer from 'nodemailer';

export default async function (req: Request, res: Response) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM internship_students WHERE email = ?', [email]);
        const student = rows[0];

        if (!student || student.email_verified === 1) {
            // Return success even if verified or not found to prevent email enumeration
            return res.status(200).json({ success: true });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'meazha', { expiresIn: '1d' });
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
        const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER || '"ZTOI Tech" <noreply@ztoitech.com>',
                to: email,
                subject: 'Verify your ZTOI Tech Internship account',
                html: `<p>Hello ${student.name},</p>
                       <p>Please click the link below to verify your email address:</p>
                       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`
            });
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
