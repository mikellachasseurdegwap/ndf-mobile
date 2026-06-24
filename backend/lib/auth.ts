import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export type JwtPayload = {
  userId: string
  role: string
  email: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function signResetToken(userId: string, email: string): string {
  return jwt.sign({ userId, email, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' })
}

export function verifyResetToken(token: string): { userId: string; email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (payload.type !== 'reset') return null
    return { userId: payload.userId, email: payload.email }
  } catch {
    return null
  }
}