import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sign Up - Tes Tour",
  description: "Create your account and start checking our tours.",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">{children}</main>
  )
}
