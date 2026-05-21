import { Request, Response } from 'express';
import { pool } from '@/lib/db/client';
import { getStudentId } from '@/lib/utils/auth';
import fs from 'fs';
import path from 'path';

export default async function (req: Request, res: Response) {
  try {
    const studentId = await getStudentId(req);
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    // Validate file type (only images)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      // Delete uploaded file
      if (file.path.startsWith('http')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(file.path, { token: process.env.BLOB_READ_WRITE_TOKEN });
        } catch (delErr) {
          console.error('Error deleting blob:', delErr);
        }
      } else {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' });
    }

    // Get the old photo path
    const [rows] = await pool.query<any[]>(
      'SELECT photo_path FROM internship_students WHERE id = ?',
      [studentId]
    );

    const student = rows[0];
    const oldPhotoPath = student?.photo_path;

    // Update database
    const newPhotoPath = file.path.startsWith('http') ? file.path : `/uploads/profile/${file.filename}`;
    await pool.query(
      'UPDATE internship_students SET photo_path = ?, updated_at = NOW() WHERE id = ?',
      [newPhotoPath, studentId]
    );

    // Delete old photo if it exists
    if (oldPhotoPath && !oldPhotoPath.startsWith('http')) {
      const oldFilePath = path.join(process.cwd(), oldPhotoPath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } else if (oldPhotoPath && oldPhotoPath.startsWith('http')) {
      try {
        const { del } = await import('@vercel/blob');
        await del(oldPhotoPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (delErr) {
        console.error('Failed to delete old blob:', delErr);
      }
    }

    res.status(200).json({
      message: 'Profile photo updated successfully',
      photo_path: newPhotoPath,
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    // Clean up uploaded file in case of error
    if (req.file) {
      if (req.file.path.startsWith('http')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(req.file.path, { token: process.env.BLOB_READ_WRITE_TOKEN });
        } catch (e) {
          console.error('Error deleting uploaded blob:', e);
        }
      } else {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error('Error deleting uploaded file:', e);
        }
      }
    }
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
}
