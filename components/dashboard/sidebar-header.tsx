import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface SidebarHeaderProps {
  className?: string
  collapsed?: boolean
}

export function SidebarHeader({ className, collapsed = false }: SidebarHeaderProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Link href="/" className="flex items-center gap-2 font-semibold text-brand-blue-700">
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
            <Image src="/logintex-logo.png" alt="LogintexGroup" width={30} height={20} className="object-contain" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white">
              <Image src="/logintex-logo.png" alt="LogintexGroup" width={30} height={20} className="object-contain" />
            </div>
            <span className="text-lg font-bold text-[#0091d5]">LogintexGroup</span>
          </div>
        )}
      </Link>
    </div>
  )
}
