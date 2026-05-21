import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import { RowDataPacket } from 'mysql2';

export default async function (req: Request, res: Response) {
  try {
    const studentId = await getStudentId(req);
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id,
        name,
        email,
        phone,
        dob,
        college,
        address,
        photo_path,
        domain_id,
        certificate_status,
        status,
        referral_code,
        registered_at,
        updated_at
      FROM internship_students 
      WHERE id = ?`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = rows[0];

    // Format DOB to display
    const dob = new Date(student.dob);
    const dobFormatted = dob.toISOString().split('T')[0];

    // Lazy initialization of referral code if not already set (defensive seeding)
    let referral_code = student.referral_code;
    if (!referral_code) {
      let isUnique = false;
      while (!isUnique) {
        referral_code = 'ZTOI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const [check] = await pool.query<RowDataPacket[]>('SELECT id FROM internship_students WHERE referral_code = ?', [referral_code]);
        if (check.length === 0) {
          isUnique = true;
        }
      }
      await pool.query('UPDATE internship_students SET referral_code = ? WHERE id = ?', [referral_code, studentId]);
    }

    // Fetch referred list
    const [referralsRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        name, 
        email, 
        email_verified, 
        registered_at 
       FROM internship_students 
       WHERE referred_by_id = ? 
       ORDER BY registered_at DESC`,
      [studentId]
    );

    res.status(200).json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        dob: dobFormatted,
        college: student.college,
        address: student.address,
        photo_path: student.photo_path,
        domain_id: student.domain_id,
        certificate_status: student.certificate_status,
        status: student.status,
        registered_at: student.registered_at,
        referral_code: referral_code,
      },
      referrals: referralsRows,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}
