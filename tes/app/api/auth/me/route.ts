import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 })
  const payload = verifyJwt(token)
  if (!payload) return NextResponse.json({ authenticated: false }, { status: 200 })
  
  // TASK 1 FIX: For employees, check if they have HR access using the isHR method
  if (payload.role === 'employee') {
    try {
      const isHR = await Employee.isHR(payload.user_id)
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          ...payload,
          isHR: isHR  // Add isHR flag to the response
        }
      }, { status: 200 })
    } catch (e) {
      console.error('Error checking HR status:', e)
      // Return with isHR: false if check fails
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          ...payload,
          isHR: false
        }
      }, { status: 200 })
    }
  }
  
  return NextResponse.json({ authenticated: true, user: payload }, { status: 200 })
}



