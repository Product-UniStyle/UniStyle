import jwt from 'jsonwebtoken';

/**
 * Guards admin-only bulk-import endpoints. Accepts either the shared
 * "x-import-key" header (Postman/CLI use) or a Bearer admin JWT from
 * POST /api/admin/login (admin panel CSV upload).
 */
export function requireImportKey(req, res, next) {
  const key = process.env.IMPORT_API_KEY;
  if (req.headers['x-import-key'] && req.headers['x-import-key'] === key) {
    return next();
  }

  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      if (payload.role === 'admin') return next();
    } catch {
      // fall through to the error response below
    }
  }

  return res.status(401).json({ error: 'Missing or invalid x-import-key header or admin token' });
}
