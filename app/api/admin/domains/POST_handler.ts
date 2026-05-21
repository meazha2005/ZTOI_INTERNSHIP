import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { ResultSetHeader } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const { name, description } = req.body;
        if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO internship_domains (name, description, is_active) VALUES (?, ?, 1)',
            [name, description]
        );
        
        return res.status(201).json({ domain: { id: result.insertId.toString(), name, description } });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Domain name already exists' });
        console.error('Add domain error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
