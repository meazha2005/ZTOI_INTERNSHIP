import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const submissionId = req.params.id;

        await pool.query(
            'UPDATE internship_task_submissions SET status = "accepted", reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
            [adminId, submissionId]
        );

        const [rows] = await pool.query<RowDataPacket[]>('SELECT student_id FROM internship_task_submissions WHERE id = ?', [submissionId]);
        if (rows.length > 0) {
            const studentId = rows[0].student_id;
            await pool.query(
                `UPDATE internship_students SET tasks_completed = (
                    SELECT COUNT(*) FROM internship_task_submissions WHERE student_id = ? AND status = 'accepted'
                ) WHERE id = ?`,
                [studentId, studentId]
            );
            // Unlock certificate if tasks completed >= 2 and it's currently locked
            await pool.query(`
                UPDATE internship_students 
                SET certificate_status = 'payment_pending' 
                WHERE id = ? AND tasks_completed >= 2 AND certificate_status = 'locked'
            `, [studentId]);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error accepting submission:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
