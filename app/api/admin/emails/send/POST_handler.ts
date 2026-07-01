import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import nodemailer from 'nodemailer';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const { studentId, emailSubject, emailBody } = req.body;

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        if (!emailSubject || !emailBody) {
            return res.status(400).json({ error: 'Subject and Body are required' });
        }

        // Retrieve student email
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT email, name FROM internship_students WHERE id = ?',
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = rows[0];

        // Configure Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || '',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        });

        const fromAddress = process.env.SMTP_USER || 'ztoitech@gmail.com';
        
        // Handle optional file attachments
        const attachments = [];
        const uploadedFile = (req as any).file;
        if (uploadedFile) {
            attachments.push({
                filename: uploadedFile.originalname,
                path: uploadedFile.path
            });
        }

        try {
            await transporter.sendMail({
                from: `"ZTOI TECH" <${fromAddress}>`,
                to: student.email,
                subject: emailSubject,
                html: emailBody,
                attachments: attachments.length > 0 ? attachments : undefined
            });
        } catch (emailErr) {
            console.error('Failed to send completion email:', emailErr);
            return res.status(500).json({ error: 'Failed to send email. Please verify SMTP configurations.' });
        }

        // Update database to mark completion email as sent
        await pool.query(
            'UPDATE internship_students SET completion_email_sent = 1 WHERE id = ?',
            [studentId]
        );

        return res.json({ success: true });
    } catch (error) {
        console.error('Error in send email handler:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
