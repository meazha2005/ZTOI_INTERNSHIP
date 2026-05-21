import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '@/lib/db/client';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import nodemailer from 'nodemailer';

export default async function (req: Request, res: Response) {
    try {
        const { name, email, phone, dob, college, address, domain, password, referral_code } = req.body;
        const photo = req.file;

        if (!name || !email || !phone || !dob || !college || !address || !domain || !password || !photo) {
            return res.status(400).json({ error: 'All fields and photo are required' });
        }

        const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM internship_students WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const [domains] = await pool.query<RowDataPacket[]>('SELECT id FROM internship_domains WHERE name = ?', [domain]);
        if (domains.length === 0) {
            return res.status(400).json({ error: 'Invalid domain' });
        }
        const domain_id = domains[0].id;

        // Check if referral code is valid
        let referred_by_id: number | null = null;
        if (referral_code && typeof referral_code === 'string' && referral_code.trim()) {
            const [referrers] = await pool.query<RowDataPacket[]>(
                'SELECT id FROM internship_students WHERE referral_code = ?',
                [referral_code.trim().toUpperCase()]
            );
            if (referrers.length > 0) {
                referred_by_id = referrers[0].id;
            }
        }

        // Generate a unique referral code for the new student
        let new_referral_code = '';
        let isUnique = false;
        while (!isUnique) {
            new_referral_code = 'ZTOI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const [check] = await pool.query<RowDataPacket[]>('SELECT id FROM internship_students WHERE referral_code = ?', [new_referral_code]);
            if (check.length === 0) {
                isUnique = true;
            }
        }

        const password_hash = await bcrypt.hash(password, 10);
        const photo_path = photo.path.startsWith('http') ? photo.path : `/uploads/profile/${photo.filename}`;

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO internship_students 
             (domain_id, name, email, phone, dob, college, address, photo_path, password_hash, email_verified, status, referral_code, referred_by_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', ?, ?)`,
            [domain_id, name, email, phone, dob, college, address, photo_path, password_hash, new_referral_code, referred_by_id]
        );
        const student_id = result.insertId;

        const [tasks] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM internship_tasks WHERE domain_id = ? AND is_active = 1 ORDER BY RAND() LIMIT 2',
            [domain_id]
        );
        for (const task of tasks) {
            await pool.query('INSERT INTO internship_student_tasks (student_id, task_id) VALUES (?, ?)', [student_id, task.id]);
            await pool.query('INSERT INTO internship_task_submissions (student_id, task_id, status) VALUES (?, ?, ?)', [student_id, task.id, 'pending']);
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
                html: `<p>Hello ${name},</p>
                       <p>Please click the link below to verify your email address:</p>
                       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`
            });
        } catch (emailErr) {
            console.error('Failed to send verification email:', emailErr);
        }

        return res.status(201).json({ success: true, message: 'Registration successful. Please verify email.' });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
