import { Request, Response } from 'express';
import crypto from 'crypto';
import 'dotenv/config';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment verification fields.' });
        }

        // Verify signature using HMAC-SHA256
        const keySecret = process.env.RAZORPAY_KEY_SECRET!;
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment signature verification failed.' });
        }

        // Check the payment exists in DB and belongs to this student
        const [paymentRows] = await pool.query<RowDataPacket[]>(
            `SELECT id, status FROM internship_payments WHERE razorpay_order_id = ? AND student_id = ?`,
            [razorpay_order_id, studentId]
        );
        if (paymentRows.length === 0) {
            return res.status(404).json({ error: 'Payment record not found.' });
        }
        if (paymentRows[0].status === 'verified') {
            return res.status(200).json({ success: true, message: 'Payment already verified.' });
        }

        const paymentDbId = paymentRows[0].id;

        // Update payment record with Razorpay payment ID, signature, and mark as verified
        await pool.query(
            `UPDATE internship_payments 
             SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'verified', reviewed_at = NOW()
             WHERE id = ?`,
            [razorpay_payment_id, razorpay_signature, paymentDbId]
        );

        // Update student certificate_status to 'under_review' (admin will then generate cert)
        await pool.query(
            `UPDATE internship_students SET certificate_status = 'under_review' WHERE id = ?`,
            [studentId]
        );

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully. Your certificate will be issued within 24 hours.',
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({ error: 'Internal server error during payment verification.' });
    }
}
