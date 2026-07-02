import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/client';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Extract session cookie manually
        const cookieHeader = request.headers.get('cookie') || '';
        const sessionId = cookieHeader
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('admin_session='))
          ?.split('=')[1];

        if (!sessionId) {
          throw new Error('Unauthorized: Session not found');
        }

        // Validate admin session in database
        const [rows] = await pool.query<RowDataPacket[]>(
          'SELECT user_id FROM internship_sessions WHERE id = ? AND user_type = "admin" AND expires_at > NOW()',
          [sessionId]
        );

        if (rows.length === 0) {
          throw new Error('Unauthorized: Invalid or expired session');
        }

        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/zip', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          ],
          tokenPayload: JSON.stringify({
            adminId: rows[0].user_id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Run on server after upload finishes
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error('Error generating Vercel Blob client token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate upload' },
      { status: 400 }
    );
  }
}
