import LoginForm from "../../components/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  // Client guard to avoid showing when already logged in
  if (typeof window !== 'undefined') {
    // Fire and forget; UI remains while request resolves
    fetch('/api/auth/profile', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d?.authenticated) window.location.href = '/' })
      .catch(() => {})
  }
  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-600 to-emerald-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tes Tour</h1>
   <LoginForm />
        </div>

       

        
      </div>
    </div>
  )
}
