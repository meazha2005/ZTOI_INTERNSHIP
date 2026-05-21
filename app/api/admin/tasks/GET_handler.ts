import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT t.id, t.domain_id, t.title, t.description, t.sort_order, t.is_active, d.name as domain_name 
             FROM internship_tasks t
             JOIN internship_domains d ON t.domain_id = d.id
             WHERE t.is_active = 1`
        );
        return res.status(200).json({ tasks: rows });
    } catch (error) {
        console.error('Fetch tasks error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
