import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';

export default async function (req: Request, res: Response) {
    try {
        const id = req.params.id;
        await pool.query('UPDATE internship_tasks SET is_active = 0 WHERE id = ?', [id]);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
