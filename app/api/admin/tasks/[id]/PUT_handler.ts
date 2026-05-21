import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        if (!title || !description) return res.status(400).json({ error: 'Missing fields' });

        await pool.query(
            'UPDATE internship_tasks SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );
        
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
