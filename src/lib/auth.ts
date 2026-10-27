import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ielts-vocab-mastery-secret-2026-key';
const JWT_EXPIRATION_DAYS = 60;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('base64url');
  const N = 32768;
  const r = 8;
  const p = 1;
  const keylen = 64;
  const derived = crypto.scryptSync(password, salt, keylen, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt:${N}:${r}:${p}$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;

  try {
    if (storedHash.startsWith('scrypt:')) {
      const parts = storedHash.split('$');
      if (parts.length !== 3) return false;
      const header = parts[0].replace('scrypt:', '');
      const [N, r, p] = header.split(':').map(Number);
      const salt = parts[1];
      const hashHex = parts[2];
      const keylen = Buffer.from(hashHex, 'hex').length;
      const derived = crypto.scryptSync(password, salt, keylen, { N, r, p, maxmem: 128 * N * r * 2 });
      return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), derived);
    }

    if (storedHash.startsWith('pbkdf2:sha256:')) {
      const parts = storedHash.split('$');
      const rounds = parseInt(parts[0].split(':')[2], 10) || 600000;
      const salt = parts[1];
      const hashHex = parts[2];
      const keylen = Buffer.from(hashHex, 'hex').length;
      const derived = crypto.pbkdf2Sync(password, salt, rounds, keylen, 'sha256');
      return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), derived);
    }

    // Direct constant-time string comparison as fallback
    const bufA = Buffer.from(password);
    const bufB = Buffer.from(storedHash);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function createToken(userId: number, username: string): string {
  const payload = {
    user_id: userId,
    username: username,
  };
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${JWT_EXPIRATION_DAYS}d`,
  });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as {
      user_id: number;
      username: string;
    };
    if (decoded && decoded.user_id && decoded.username) {
      return {
        userId: decoded.user_id,
        username: decoded.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: Request): { userId: number; username: string } | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return verifyToken(token);
}
