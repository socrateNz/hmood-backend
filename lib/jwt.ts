// /lib/jwt.ts
import jwt from 'jsonwebtoken';

export function signJwt(payload: object) {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
    expiresIn: '24h',
  });
}
