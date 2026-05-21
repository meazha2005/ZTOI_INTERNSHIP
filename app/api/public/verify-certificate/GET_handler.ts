import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const certNumber = (req.query.cert as string || '').trim();

        if (!certNumber) {
            return res.status(400).json({ valid: false, error: 'Certificate number is required.' });
        }

        const [certRows] = await pool.query<RowDataPacket[]>(`
            SELECT
                c.cert_number,
                c.student_id,
                UNIX_TIMESTAMP(c.issued_at) * 1000 AS issued_at_ms,
                s.name AS student_name,
                s.email AS student_email,
                d.name AS domain
            FROM internship_certificates c
            JOIN internship_students s ON s.id = c.student_id
            JOIN internship_domains d ON d.id = s.domain_id
            WHERE c.cert_number = ?
            LIMIT 1
        `, [certNumber]);

        if (certRows.length === 0) {
            return res.status(404).json({ valid: false, error: 'Certificate not found.' });
        }

        const cert = certRows[0];

        const formatDate = (ms: number) => {
            if (!ms) return null;
            const d = new Date(ms);
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };

        return res.status(200).json({
            valid: true,
            cert_number: cert.cert_number,
            student_name: cert.student_name,
            student_email: cert.student_email,
            domain: cert.domain,
            issued_at: formatDate(Number(cert.issued_at_ms)),
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        return res.status(500).json({ valid: false, error: 'Internal server error.' });
    }
}
