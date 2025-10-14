import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export function signJwt(payload: object): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  } as const
}


