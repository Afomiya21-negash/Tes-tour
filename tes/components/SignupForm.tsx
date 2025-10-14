"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const validatePassword = (password: string) => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("At least 8 characters")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter")
    }
    if (!/\d/.test(password)) {
      errors.push("One number")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("One special character")
    }

    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "username") setUsername(value)
    if (name === "email") setEmail(value)
    if (name === "password") {
      setPassword(value)
      setPasswordErrors(validatePassword(value))
      setPasswordMatch(confirmPassword === "" || confirmPassword === value)
    }
    if (name === "confirmPassword") {
      setConfirmPassword(value)
      setPasswordMatch(value === password)
    }
  }

  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
         
        </div>

        <form onSubmit={async (e) => {
          e.preventDefault()
          if (passwordErrors.length > 0 || !passwordMatch) return
          try {
            setIsLoading(true)
            const res = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password })
            })
            if (res.ok) {
              router.push('/')
            } else {
              const data = await res.json().catch(() => ({}))
              alert(data.message || 'Signup failed')
            }
          } finally {
            setIsLoading(false)
          }
        }} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
              placeholder="Choose a username"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
              placeholder="Enter your email"
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
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors ${passwordErrors.length > 0 ? "border-red-500" : "border-gray-300"}`}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                <p className="font-medium">Password must include:</p>
                <ul className="list-disc list-inside space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors ${!passwordMatch ? "border-red-500" : "border-gray-300"}`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!passwordMatch && confirmPassword && <p className="mt-2 text-sm text-red-600">Passwords do not match</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || passwordErrors.length > 0 || !passwordMatch}
            className="w-full bg-[#002F63] hover:bg-[#002856] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-[#002F63] hover:text-[#002856] font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
