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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [ageError, setAgeError] = useState("")
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
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

  const validateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return ""

    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 18 ? "You must be at least 18 years old to register" : ""
    }

    return age < 18 ? "You must be at least 18 years old to register" : ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "username") setUsername(value)
    if (name === "email") setEmail(value)
    if (name === "firstName") setFirstName(value)
    if (name === "lastName") setLastName(value)
    if (name === "phoneNo") setPhoneNo(value)
    if (name === "address") setAddress(value)
    if (name === "dateOfBirth") {
      setDateOfBirth(value)
      setAgeError(validateAge(value))
    }
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

        {showVerificationMessage ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-4">
              A verification email has been sent to your email address. Please check your inbox (and spam folder) for the verification link.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={async (e) => {
          e.preventDefault()
          if (passwordErrors.length > 0 || !passwordMatch || ageError) return
          try {
            setIsLoading(true)
            const res = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username,
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                phoneNo,
                address,
                DOB: dateOfBirth
              })
            })
            if (res.ok) {
              setShowVerificationMessage(true)
              // Don't redirect immediately - show verification message
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={dateOfBirth}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors ${ageError ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {ageError && <p className="mt-2 text-sm text-red-600">{ageError}</p>}
          </div>

          <div>
            <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNo"
              name="phoneNo"
              value={phoneNo}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F63] focus:border-transparent transition-colors"
              placeholder="Enter your address"
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
            disabled={isLoading || passwordErrors.length > 0 || !passwordMatch || !!ageError}
            className="w-full bg-[#002F63] hover:bg-[#002856] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        )}

        {!showVerificationMessage && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-[#002F63] hover:text-[#002856] font-medium transition-colors">
                Sign in
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
