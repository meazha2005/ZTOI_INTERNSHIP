import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const { id } = req.params;
        const { status } = req.body;

        if (status !== 'active' && status !== 'blocked') {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await pool.query('UPDATE internship_students SET status = ? WHERE id = ?', [status, id]);

        return res.json({ success: true });
    } catch (error) {
        console.error('Error updating student status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
