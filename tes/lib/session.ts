import { cookies } from 'next/headers'
import { verifyJwt } from '@/lib/auth'

export type SessionUser = {
  user_id: number
  role: string
}

export async function getSession(): Promise<{ authenticated: boolean; user?: SessionUser }>{
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || cookieStore.get('token')?.value
  if (!token) return { authenticated: false }
  const payload = verifyJwt(token)
  if (!payload || !payload.user_id) return { authenticated: false }
  return { authenticated: true, user: { user_id: Number(payload.user_id), role: String(payload.role || '') } }
}

export async function requireSession(allowedRoles?: string[]) {
  const session = await getSession()
  if (!session.authenticated) return { ok: false as const, status: 401 }
  if (allowedRoles && !allowedRoles.includes(session.user!.role)) return { ok: false as const, status: 403 }
  return { ok: true as const, session }
}


