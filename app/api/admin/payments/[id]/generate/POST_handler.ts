import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const paymentId = req.params.id;

        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, student_id, status FROM internship_payments WHERE id = ?`,
            [paymentId]
        );
        if (paymentRows.length === 0) return res.status(404).json({ error: 'Payment not found' });

        const payment = paymentRows[0];
        if (payment.status === 'rejected') {
            return res.status(400).json({ error: 'Cannot generate certificate for a rejected payment.' });
        }

        // Check if certificate already exists
        const [existingCert] = await pool.query<RowDataPacket[]>(
            `SELECT id FROM internship_certificates WHERE payment_id = ? OR student_id = ?`,
            [paymentId, payment.student_id]
        );
        if (existingCert.length > 0) {
            return res.status(400).json({ error: 'Certificate already generated for this student.' });
        }

        // Generate a unique certificate number: ZTOI-YYYY-NNNNNN
        const year = new Date().getFullYear();
        const uniquePart = Math.floor(100000 + Math.random() * 900000).toString();
        const certNumber = `ZTOI-${year}-${uniquePart}`;

        // Insert certificate record
        await pool.query(
            `INSERT INTO internship_certificates (student_id, payment_id, issued_by, cert_number)
             VALUES (?, ?, ?, ?)`,
            [payment.student_id, paymentId, adminId, certNumber]
        );

        // Update payment as certificate_generated
        await pool.query(
            `UPDATE internship_payments SET certificate_generated = 1, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
            [adminId, paymentId]
        );

        // Update student certificate_status to 'issued'
        await pool.query(
            `UPDATE internship_students SET certificate_status = 'issued' WHERE id = ?`,
            [payment.student_id]
        );

        return res.status(200).json({ success: true, certNumber });
    } catch (error) {
        console.error('Error generating certificate:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
