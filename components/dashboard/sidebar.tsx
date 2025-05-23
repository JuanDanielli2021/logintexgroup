"use client"

import Link from "next/link"
import {
  Users,
  Settings,
  HelpCircle,
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { SidebarHeader } from "@/components/dashboard/sidebar-header"
import { SidebarSection } from "@/components/dashboard/sidebar-section"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DashboardSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
}

const sidebarNavItems = [
  {
    title: "Panel de Control",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Pre-Facturas",
    href: "/dashboard/prefacturas",
    icon: FileText,
  },
  {
    title: "Facturación",
    href: "/dashboard/facturacion",
    icon: Receipt,
  },
  {
    title: "Ayuda",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed"

export function DashboardSidebar({ open, onOpenChange, pathname }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Cargar el estado del sidebar desde localStorage al iniciar
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (savedState !== null) {
      setCollapsed(savedState === "true")
    }
  }, [])

  // Guardar el estado del sidebar en localStorage cuando cambia
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState))
  }

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0 border-r border-brand-blue-100">
          <div className="p-4">
            <SidebarHeader />
          </div>
          <ScrollArea className="h-[calc(100vh-80px)] py-4">
            <SidebarSection title="Navegación">
              <nav className="grid gap-3 px-4">
                {sidebarNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-brand-blue-100 text-brand-blue-700"
                        : "text-gray-600 hover:bg-brand-blue-50 hover:text-brand-blue-700",
                    )}
                  >
                    <item.icon
                      className={cn("h-5 w-5", pathname === item.href ? "text-brand-blue-600" : "text-gray-500")}
                    />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SidebarSection>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden border-r border-brand-blue-100 bg-white transition-all duration-300 ease-in-out md:flex md:flex-col",
          collapsed ? "md:w-[70px]" : "md:w-64",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-blue-100 px-4">
          <SidebarHeader collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8 rounded-full hover:bg-brand-blue-50"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <div className={cn("flex flex-col", collapsed ? "px-2" : "px-4")}>
            <TooltipProvider delayDuration={0}>
              <nav className="grid gap-3">
                {sidebarNavItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={collapsed ? 300 : 9999999}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg transition-colors",
                          collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
                          pathname === item.href
                            ? "bg-brand-blue-100 text-brand-blue-700"
                            : "text-gray-600 hover:bg-brand-blue-50 hover:text-brand-blue-700",
                        )}
                      >
                        <item.icon
                          className={cn("h-5 w-5", pathname === item.href ? "text-brand-blue-600" : "text-gray-500")}
                        />
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
                ))}
              </nav>
            </TooltipProvider>
          </div>
        </ScrollArea>
      </div>

      {/* Botón flotante para mostrar/ocultar sidebar en móvil */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full border border-brand-blue-200 bg-white shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
