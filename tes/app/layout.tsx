import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import LayoutShell from "@/components/LayoutShell"

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
    <>
    <html lang="en">
      <body className={inter.className}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
    </>
    
  )
}
