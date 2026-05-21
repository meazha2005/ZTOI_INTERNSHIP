import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';
import { formatDateWithTime, formatShortDate } from '@/lib/utils/date';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                p.id,
                p.student_id,
                s.name AS student_name,
                s.email AS student_email,
                s.photo_path,
                d.name AS domain,
                p.amount,
                p.razorpay_order_id,
                p.razorpay_payment_id,
                p.status,
                p.certificate_generated,
                p.rejection_reason,
                UNIX_TIMESTAMP(p.submitted_at) * 1000 AS submitted_at_ms,
                UNIX_TIMESTAMP(p.reviewed_at) * 1000 AS reviewed_at_ms,
                c.cert_number,
                UNIX_TIMESTAMP(c.issued_at) * 1000 AS cert_issued_at_ms
            FROM internship_payments p
            JOIN internship_students s ON s.id = p.student_id
            JOIN internship_domains d ON d.id = s.domain_id
            LEFT JOIN internship_certificates c ON c.payment_id = p.id
            ORDER BY p.submitted_at DESC
        `);

        const payments = rows.map(r => ({
            ...r,
            submitted_at: formatDateWithTime(Number(r.submitted_at_ms)),
            reviewed_at: formatDateWithTime(Number(r.reviewed_at_ms)),
            cert_issued_at: formatShortDate(Number(r.cert_issued_at_ms))
        }));

        return res.status(200).json({ payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
