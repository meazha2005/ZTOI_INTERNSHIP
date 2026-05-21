import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Referral code is required' });
        }

        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT name FROM internship_students WHERE referral_code = ?`,
            [code.trim().toUpperCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Invalid referral code' });
        }

        return res.status(200).json({ name: rows[0].name });
    } catch (error) {
        console.error('Verify referral error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
