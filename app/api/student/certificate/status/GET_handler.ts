import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        // Fetch student details including certificate status, task progress, and referral info
        const [studentRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                s.id,
                s.name,
                s.email,
                s.phone,
                s.tasks_completed,
                s.certificate_status,
                s.referral_code,
                s.referred_by_id,
                (SELECT COUNT(*) FROM internship_students WHERE referred_by_id = s.id AND email_verified = 1) AS verified_referrals_count,
                d.name AS domain
            FROM internship_students s
            JOIN internship_domains d ON d.id = s.domain_id
            WHERE s.id = ?
        `, [studentId]);

        if (studentRows.length === 0) return res.status(404).json({ error: 'Student not found' });
        const student = studentRows[0];

        // Fetch assigned tasks and their statuses
        const [taskRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id,
                t.title,
                sub.status
            FROM internship_task_submissions sub
            JOIN internship_tasks t ON t.id = sub.task_id
            WHERE sub.student_id = ?
        `, [studentId]);

        // Fetch latest payment info if any
        const [paymentRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                p.id,
                p.amount,
                p.razorpay_order_id,
                p.razorpay_payment_id,
                p.status,
                p.certificate_generated,
                UNIX_TIMESTAMP(p.submitted_at) * 1000 AS submitted_at_ms
            FROM internship_payments p
            WHERE p.student_id = ?
            ORDER BY p.submitted_at DESC
            LIMIT 1
        `, [studentId]);

        // Fetch certificate if issued
        const [certRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                c.cert_number,
                UNIX_TIMESTAMP(c.issued_at) * 1000 AS issued_at_ms
            FROM internship_certificates c
            WHERE c.student_id = ?
            LIMIT 1
        `, [studentId]);

        const formatShortDate = (ms: number) => {
            if (!ms) return null;
            const d = new Date(ms);
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${months[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
        };

        let payment = paymentRows.length > 0 ? paymentRows[0] : null;
        if (payment) payment.submitted_at = formatShortDate(Number(payment.submitted_at_ms));

        let certificate = certRows.length > 0 ? certRows[0] : null;
        if (certificate) certificate.issued_at = formatShortDate(Number(certificate.issued_at_ms));

        return res.status(200).json({
            student: {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone,
                domain: student.domain,
                tasksCompleted: student.tasks_completed,
                certificateStatus: student.certificate_status,
                referralCode: student.referral_code,
                referredById: student.referred_by_id,
                verifiedReferralsCount: student.verified_referrals_count,
            },
            tasks: taskRows,
            payment,
            certificate,
        });
    } catch (error) {
        console.error('Error fetching certificate status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
