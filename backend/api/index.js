import 'dotenv/config';

import app from '../src/app.js';
import { connectDb } from '../src/lib/db.js';

// Routes that never touch Mongo — skip the DB connect wait for these so a
// cold Lambda doesn't pay the Atlas handshake cost on requests that don't need it
// (e.g. the S3 presigned-upload-url endpoint, which was making admin uploads slow).
const NO_DB_PATHS = new Set(['/health', '/api/admin/upload-url']);

export default async function handler(req, res) {
  const path = req.url?.split('?')[0];
  if (!NO_DB_PATHS.has(path)) {
    await connectDb();
  }
  return app(req, res);
}
