import { NextRequest, NextResponse } from 'next/server'
import { Admin } from '@/lib/domain'

// Test endpoint to register an employee without authentication (for debugging)
export async function POST(request: NextRequest) {
  try {
    function genUsername(name: string, email: string) {
      const baseFromName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
      const baseFromEmail = (email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '.')
      const base = baseFromName || baseFromEmail || 'user'
      const suffix = Math.random().toString(36).slice(2, 6)
      return `${base}.${suffix}`
    }

    function genTempPassword() {
      const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
      const lower = 'abcdefghijkmnopqrstuvwxyz'
      const digits = '23456789'
      const specials = '!@#$%^&*()_+[]{}~'
      const all = upper + lower + digits + specials
      const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
      const ensure = [pick(upper), pick(lower), pick(digits), pick(specials)]
      const rest: string[] = []
      for (let i = 0; i < 8; i++) rest.push(pick(all))
      const raw = [...ensure, ...rest]
      // shuffle
      for (let i = raw.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[raw[i], raw[j]] = [raw[j], raw[i]]
      }
      return raw.join('')
    }

    const name = 'Test Employee'
    const email = 'test.employee@example.com'
    const role = 'tourguide'
    const licenseNo = 'TG123456'
    const experience = 5
    
    const username = genUsername(name, email)
    const tempPassword = genTempPassword()

    // Use admin user ID 1 (assuming it exists)
    const created = await Admin.registerEmployee(1, {
      role: 'tourguide',
      username,
      password: tempPassword,
      email,
      name,
      phoneNo: '+251911123456',
      address: 'Test Address',
      licenseNo,
      experience: Number(experience),
      specialization: 'Cultural Tours',
    } as any)

    return NextResponse.json({
      success: true,
      user_id: created.user_id,
      role: created.role,
      username,
      temp_password: tempPassword,
      name,
      email,
      message: 'Test employee created successfully'
    })
    
  } catch (error) {
    console.error('Test register employee error:', error)
    return NextResponse.json(
      { error: 'Failed to register test employee', details: error.message },
      { status: 500 }
    )
  }
}
