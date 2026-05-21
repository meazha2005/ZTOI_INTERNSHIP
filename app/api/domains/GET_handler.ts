import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(`
            SELECT d.id, d.name, d.description, COUNT(s.id) as student_count 
            FROM internship_domains d
            LEFT JOIN internship_students s ON d.id = s.domain_id
            WHERE d.is_active = 1 
            GROUP BY d.id
            ORDER BY d.created_at ASC
        `);
        return res.status(200).json({ domains: rows });
    } catch (error) {
        console.error('Fetch domains error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
