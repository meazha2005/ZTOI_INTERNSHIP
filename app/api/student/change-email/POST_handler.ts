import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';
import nodemailer from 'nodemailer';

export default async function (req: Request, res: Response) {
    try {
        const { currentEmail, password, newEmail } = req.body;

        if (!currentEmail || !password || !newEmail) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM internship_students WHERE email = ?', [currentEmail]);
        const student = rows[0];

        if (!student) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, student.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM internship_students WHERE email = ? AND id != ?', [newEmail, student.id]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        await pool.query('UPDATE internship_students SET email = ?, email_verified = 0 WHERE id = ?', [newEmail, student.id]);

        const token = jwt.sign({ email: newEmail }, process.env.JWT_SECRET || 'meazha', { expiresIn: '1d' });
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
                to: newEmail,
                subject: 'Verify your new ZTOI Tech Internship account email',
                html: `<p>Hello ${student.name},</p>
                       <p>You recently changed your email. Please click the link below to verify your new email address:</p>
                       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`
            });
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
        }

        return res.status(200).json({ success: true, email: newEmail });
    } catch (error) {
        console.error('Change email error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
