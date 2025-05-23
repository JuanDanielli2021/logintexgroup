"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { useAuth } from "@/lib/hooks/useAuth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Cargar el estado del sidebar desde localStorage
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (!mounted || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center dashboard-gradient">
        <div className="animate-pulse text-lg font-medium text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen dashboard-gradient">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} pathname={pathname} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader onMenuButtonClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
