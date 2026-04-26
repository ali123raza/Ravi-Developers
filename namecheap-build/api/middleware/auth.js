import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../lib/db.js';

export function verifyToken(authHeader) {
  try {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const auth = verifyToken(req.headers.authorization);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = auth;
  next();
}

export function requireAdmin(req, res, next) {
  const auth = verifyToken(req.headers.authorization);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }
  req.user = auth;
  next();
}
