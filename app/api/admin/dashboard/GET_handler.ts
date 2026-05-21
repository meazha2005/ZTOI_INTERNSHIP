import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getAdminId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';
import { formatShortDate } from '@/lib/utils/date';

export default async function (req: Request, res: Response) {
    try {
        const adminId = await getAdminId(req);
        if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

        const [studentStatsRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                COUNT(*) as totalStudents,
                CAST(SUM(status = 'active') AS UNSIGNED) as activeStudents,
                CAST(SUM(certificate_status = 'issued') AS UNSIGNED) as certIssued
            FROM internship_students
        `);
        const totalStudents = studentStatsRows[0].totalStudents || 0;
        const activeStudents = studentStatsRows[0].activeStudents || 0;
        const certIssued = studentStatsRows[0].certIssued || 0;

        const [paymentStatsRows] = await pool.query<RowDataPacket[]>(`
            SELECT COUNT(*) as pendingPayments FROM internship_payments WHERE status = 'pending'
        `);
        const pendingPayments = paymentStatsRows[0].pendingPayments || 0;

        const [domainRows] = await pool.query<RowDataPacket[]>(`
            SELECT d.name as domain, COUNT(s.id) as count
            FROM internship_domains d
            LEFT JOIN internship_students s ON s.domain_id = d.id
            GROUP BY d.id
        `);
        const domainCounts = domainRows.reduce((acc, row) => {
            acc[row.domain] = row.count;
            return acc;
        }, {} as Record<string, number>);

        const [taskRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                CAST(SUM(status = 'accepted') AS UNSIGNED) as acceptedTasks,
                CAST(SUM(status = 'submitted') AS UNSIGNED) as pendingTasks,
                CAST(SUM(status = 'rejected') AS UNSIGNED) as rejectedTasks
            FROM internship_task_submissions
        `);
        const acceptedTasks = taskRows[0].acceptedTasks || 0;
        const pendingTasks = taskRows[0].pendingTasks || 0;
        const rejectedTasks = taskRows[0].rejectedTasks || 0;

        const [recentPayments] = await pool.query<RowDataPacket[]>(`
            SELECT p.id, s.name as studentName, p.amount, p.status, UNIX_TIMESTAMP(p.submitted_at) * 1000 as submittedAtMs
            FROM internship_payments p
            JOIN internship_students s ON p.student_id = s.id
            ORDER BY p.submitted_at DESC
            LIMIT 3
        `);

        const [recentStudents] = await pool.query<RowDataPacket[]>(`
            SELECT s.id, s.name, s.email, s.photo_path as photo, d.name as domain, s.status, UNIX_TIMESTAMP(s.registered_at) * 1000 as registeredAtMs
            FROM internship_students s
            JOIN internship_domains d ON s.domain_id = d.id
            ORDER BY s.registered_at DESC
            LIMIT 5
        `);

        const formattedRecentPayments = recentPayments.map(p => ({
            ...p,
            submittedAt: formatShortDate(Number(p.submittedAtMs))
        }));

        const formattedRecentStudents = recentStudents.map(s => ({
            ...s,
            registeredAt: formatShortDate(Number(s.registeredAtMs))
        }));

        return res.json({
            stats: {
                totalStudents,
                activeStudents,
                certIssued,
                pendingPayments
            },
            domainCounts,
            taskStats: {
                acceptedTasks,
                pendingTasks,
                rejectedTasks
            },
            recentPayments: formattedRecentPayments,
            recentStudents: formattedRecentStudents
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
