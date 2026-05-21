import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';

export default async function (req: Request, res: Response) {
    try {
        const studentId = await getStudentId(req);
        if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

        const taskId = req.params.id;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'Submission file is required' });

        const filePath = file.path.startsWith('http') ? file.path : `uploads/submissions/${file.filename}`;

        await pool.query(
            'UPDATE internship_task_submissions SET status = "submitted", file_path = ?, submitted_at = NOW() WHERE student_id = ? AND task_id = ?',
            [filePath, studentId, taskId]
        );

        return res.status(200).json({ success: true, filePath });
    } catch (error) {
        console.error('Error submitting task:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
