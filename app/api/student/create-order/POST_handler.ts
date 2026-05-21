import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import 'dotenv/config';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        // Check student is eligible (all tasks accepted) and hasn't already paid
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT s.certificate_status, s.name, s.email
            FROM internship_students s
            WHERE s.id = ?
        `, [studentId]);

        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        const student = rows[0];

        if (student.certificate_status === 'locked') {
            return res.status(403).json({ error: 'Complete all tasks first to unlock payment.' });
        }
        if (student.certificate_status === 'under_review' || student.certificate_status === 'issued') {
            return res.status(400).json({ error: 'Payment already submitted or certificate already issued.' });
        }

        // Check if there's already a pending/verified payment to avoid duplicates
        const [existingPayments] = await pool.query<RowDataPacket[]>(
            `SELECT id, razorpay_order_id, status FROM internship_payments WHERE student_id = ? AND status IN ('pending', 'verified') ORDER BY submitted_at DESC LIMIT 1`,
            [studentId]
        );
        if (existingPayments.length > 0 && existingPayments[0].status === 'verified') {
            return res.status(400).json({ error: 'Payment already verified. Certificate will be issued soon.' });
        }

        // Fetch referral info to calculate discount dynamically
        const [referralRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                referred_by_id,
                (SELECT COUNT(*) FROM internship_students WHERE referred_by_id = s.id AND email_verified = 1) AS verified_referrals_count
             FROM internship_students s
             WHERE s.id = ?`,
            [studentId]
        );

        let discount = 0;
        if (referralRows.length > 0) {
            const { referred_by_id, verified_referrals_count } = referralRows[0];
            if (referred_by_id !== null) {
                discount += 30; // 30 rs referee discount
            }
            const verifiedRefCount = Math.min(5, verified_referrals_count || 0);
            discount += verifiedRefCount * 30; // 30 rs per verified referral (up to max 5 = 150 rs)
        }

        const baseAmount = 499;
        const finalAmountRs = Math.max(0, baseAmount - discount);
        const amountPaise = finalAmountRs * 100;

        // Create Razorpay order
        const receipt = `intern_${studentId}_${Date.now()}`;
        
        const rzp = new Razorpay({
            key_id: process.env.VITE_RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });

        const order = await rzp.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: {
                student_id: studentId.toString(),
                student_name: student.name,
                student_email: student.email,
            },
        });

        // Insert payment record in DB as 'pending'
        await pool.query(
            `INSERT INTO internship_payments 
                (student_id, amount, razorpay_order_id, status) 
             VALUES (?, ?, ?, 'pending')
             ON DUPLICATE KEY UPDATE amount = VALUES(amount), razorpay_order_id = VALUES(razorpay_order_id), submitted_at = NOW()`,
            [studentId, finalAmountRs, order.id]
        );

        return res.status(200).json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.VITE_RAZORPAY_KEY_ID,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ error: error.message || 'Failed to create payment order. Please try again.' });
    }
}
