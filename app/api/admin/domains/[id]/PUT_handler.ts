import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        if (!name || !description) return res.status(400).json({ error: 'Name and description are required' });

        await pool.query(
            'UPDATE internship_domains SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
        
        return res.status(200).json({ success: true });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Domain name already exists' });
        console.error('Update domain error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
