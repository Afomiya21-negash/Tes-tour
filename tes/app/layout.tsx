import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Adventure Tours - Explore the World",
  description:
    "Discover amazing destinations with our customizable tour packages, local pricing, and authentic experiences.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation bar component */}
        <Navbar />

        {/* Main content area */}
        <main className="min-h-screen">{children}</main>

        {/* Footer component */}
        <Footer />
      </body>
    </html>
  )
}
