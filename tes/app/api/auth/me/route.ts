import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 })
  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 200 })
  return NextResponse.json({ authenticated: true, user: payload }, { status: 200 })
}


