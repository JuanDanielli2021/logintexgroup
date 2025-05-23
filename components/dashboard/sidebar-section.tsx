"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function SidebarSection({ title, children, defaultOpen = true, className }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn("py-2", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-500 hover:text-brand-blue-700"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  )
}
