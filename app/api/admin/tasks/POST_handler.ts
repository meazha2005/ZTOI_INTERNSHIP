import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { ResultSetHeader } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const { domain_id, title, description } = req.body;
        if (!domain_id || !title || !description) return res.status(400).json({ error: 'Missing fields' });

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO internship_tasks (domain_id, title, description, is_active) VALUES (?, ?, ?, 1)',
            [domain_id, title, description]
        );
        
        return res.status(201).json({ task: { id: result.insertId.toString(), domain_id, title, description } });
    } catch (error) {
        console.error('Add task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
