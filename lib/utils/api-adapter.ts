import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export function handleRoute(handler: (req: any, res: any) => Promise<any>) {
  return async function (request: NextRequest, context?: any) {
    // 1. Prepare express-like request mock
    const req: any = {
      method: request.method,
      url: request.url,
      headers: {},
      cookies: {},
      query: {},
      params: {},
      body: {},
      file: null,
      get(name: string) {
        return request.headers.get(name) || undefined;
      }
    };

    // Populate headers
    request.headers.forEach((val, key) => {
      req.headers[key.toLowerCase()] = val;
    });

    // Populate cookies
    request.cookies.getAll().forEach(c => {
      req.cookies[c.name] = c.value;
    });

    // Populate query parameters
    request.nextUrl.searchParams.forEach((val, key) => {
      req.query[key] = val;
    });

    // Populate route params
    if (context?.params) {
      req.params = context.params instanceof Promise ? await context.params : context.params;
    }

    // Populate body and handle file upload if multipart
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          req.body = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          const formObj: Record<string, any> = {};
          formData.forEach((val, key) => {
            formObj[key] = val;
          });
          req.body = formObj;
        } else if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          const formObj: Record<string, any> = {};
          let fileObj: any = null;

          for (const [key, val] of formData.entries()) {
            if (val instanceof File) {
              const file = val;
              const fileBuffer = Buffer.from(await file.arrayBuffer());

              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
              const ext = path.extname(file.name) || '.bin';
              const filename = uniqueSuffix + ext;

              let finalPath = '';
              let destination = '';

              if (process.env.BLOB_READ_WRITE_TOKEN) {
                try {
                  const { put } = await import('@vercel/blob');
                  // Determine prefix path in Vercel Blob store
                  let blobFolder = 'profile';
                  const pathname = request.nextUrl.pathname;
                  if (pathname.includes('/tasks/') && pathname.includes('/submit')) {
                    blobFolder = 'submissions';
                  } else if (pathname.includes('/chat/messages')) {
                    blobFolder = 'chat';
                  }

                  const blob = await put(`${blobFolder}/${filename}`, fileBuffer, {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                  });
                  finalPath = blob.url;
                  destination = 'vercel-blob';
                } catch (blobError) {
                  console.error('Error uploading to Vercel Blob:', blobError);
                }
              }

              if (!finalPath) {
                // Determine upload directory based on request pathname
                let folder = 'uploads/profile';
                const pathname = request.nextUrl.pathname;
                if (pathname.includes('/tasks/') && pathname.includes('/submit')) {
                  folder = 'uploads/submissions';
                } else if (pathname.includes('/chat/messages')) {
                  folder = 'uploads/chat';
                }

                const uploadDir = path.join(process.cwd(), folder);
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }

                const absolutePath = path.join(uploadDir, filename);
                fs.writeFileSync(absolutePath, fileBuffer);
                finalPath = absolutePath;
                destination = uploadDir;
              }

              fileObj = {
                fieldname: key,
                originalname: file.name,
                encoding: '7bit',
                mimetype: file.type,
                size: file.size,
                filename: filename,
                path: finalPath,
                destination: destination
              };
            } else {
              formObj[key] = val;
            }
          }

          req.body = formObj;
          req.file = fileObj;
        }
      } catch (e) {
        // Fail silently or log if needed
      }
    }

    // 2. Prepare express-like response mock
    let responseStatus = 200;
    const responseHeaders: Record<string, string> = {};
    const responseCookies: Array<{ name: string; value: string; options?: any }> = [];

    let resolveResponse: (res: NextResponse) => void;
    const responsePromise = new Promise<NextResponse>((resolve) => {
      resolveResponse = resolve;
    });

    const res: any = {
      status(code: number) {
        responseStatus = code;
        return res;
      },
      setHeader(name: string, value: string) {
        responseHeaders[name.toLowerCase()] = value;
        return res;
      },
      type(typeStr: string) {
        responseHeaders['content-type'] = typeStr;
        return res;
      },
      cookie(name: string, value: string, options: any = {}) {
        const nextOptions: any = { ...options };
        if (options.maxAge) {
          nextOptions.maxAge = Math.floor(options.maxAge / 1000);
        }
        if (options.expires) {
          nextOptions.expires = options.expires;
        }
        nextOptions.path = options.path || '/';
        nextOptions.httpOnly = options.httpOnly !== undefined ? options.httpOnly : true;
        nextOptions.secure = options.secure !== undefined ? options.secure : process.env.NODE_ENV === 'production';
        nextOptions.sameSite = options.sameSite || 'lax';

        responseCookies.push({ name, value, options: nextOptions });
        return res;
      },
      clearCookie(name: string, options: any = {}) {
        responseCookies.push({
          name,
          value: '',
          options: { ...options, path: options.path || '/', maxAge: 0, expires: new Date(0) }
        });
        return res;
      },
      json(data: any) {
        const nextResponse = NextResponse.json(data, {
          status: responseStatus,
          headers: responseHeaders,
        });
        responseCookies.forEach(cookie => {
          nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });
        resolveResponse(nextResponse);
        return res;
      },
      send(data: any) {
        const headers = { ...responseHeaders };
        if (typeof data === 'string') {
          if (!headers['content-type']) headers['content-type'] = 'text/html';
        } else if (typeof data === 'object') {
          if (!headers['content-type']) headers['content-type'] = 'application/json';
          data = JSON.stringify(data);
        }
        const nextResponse = new NextResponse(data, {
          status: responseStatus,
          headers: headers,
        });
        responseCookies.forEach(cookie => {
          nextResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });
        resolveResponse(nextResponse);
        return res;
      }
    };

    // 3. Call original handler
    try {
      await handler(req, res);
    } catch (err) {
      console.error('API Adapter error:', err);
      const errResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
      resolveResponse(errResponse);
    }

    return responsePromise;
  };
}
