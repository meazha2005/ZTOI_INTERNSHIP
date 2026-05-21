import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const paymentId = req.params.id;

        // Get the payment to ensure it exists and is in a rejectable state
        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, student_id, status FROM internship_payments WHERE id = ?`,
            [paymentId]
        );
        if (paymentRows.length === 0) return res.status(404).json({ error: 'Payment not found' });
        if (paymentRows[0].status === 'rejected') {
            return res.status(400).json({ error: 'Payment already rejected.' });
        }

        const { reason } = req.body;

        await pool.query(
            `UPDATE internship_payments 
             SET status = 'rejected', rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
             WHERE id = ?`,
            [reason || null, adminId, paymentId]
        );

        // Revert student certificate_status back to payment_pending so they can retry
        const studentId = paymentRows[0].student_id;
        await pool.query(
            `UPDATE internship_students SET certificate_status = 'payment_pending' WHERE id = ?`,
            [studentId]
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
