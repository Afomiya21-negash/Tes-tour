"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/ToastContainer"

export default function LoginForm() {
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()



  return (
    <div className="w-full max-w-md mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form
  onSubmit={async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: email, password })
      })
      if (res.ok) {
        const data = await res.json()
        const role = data?.role
        const dest =
          role === 'admin' ? '/admin' :
          role === 'employee' ? '/employee' :
          role === 'tourguide' ? '/tourguide' :
          role === 'driver' ? '/driver' :
          '/'
        router.push(dest)
      } else {
        const data = await res.json().catch(() => ({}))
        showError(data.message || 'Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }}
  className="space-y-6"
>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
                placeholder="Enter your password"
                required
              />
              <button
  type="button" // must be type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
>
  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
</button>

            </div>
          </div>

          <button
            
            disabled={isLoading}
            className="w-full bg-[#002F63] hover:bg-[#002856] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#002F63] hover:text-[#002856] font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
