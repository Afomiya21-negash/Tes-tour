"use client"
import React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

type Props = {
  children: React.ReactNode
}

export default function LayoutShell({ children }: Props) {
  const pathname = usePathname()
  const hideChrome = pathname === "/login" || pathname === "/signup" || pathname === "/admin" || pathname === "/tourguide" || pathname === "/employee" || pathname === "/change-password"

  return (
    <>
      {!hideChrome && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <Footer />}
    </>
  )
}


