import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ActivityCardProps {
  className?: string
}

const activities = [
  {
    user: {
      name: "Juan Pérez",
      email: "juan@ejemplo.com",
      avatar: "/diverse-group-avatars.png",
      initials: "JP",
    },
    action: "creó un nuevo proyecto",
    target: "Rediseño de Sitio Web",
    time: "hace 2 horas",
    type: "create",
  },
  {
    user: {
      name: "Sara Martínez",
      email: "sara@ejemplo.com",
      avatar: "/diverse-group-avatars.png",
      initials: "SM",
    },
    action: "comentó en",
    target: "Planificación de Presupuesto",
    time: "hace 5 horas",
    type: "comment",
  },
  {
    user: {
      name: "Miguel Rodríguez",
      email: "miguel@ejemplo.com",
      avatar: "/diverse-group-avatars.png",
      initials: "MR",
    },
    action: "completó la tarea",
    target: "Informe Q1",
    time: "hace 1 día",
    type: "complete",
  },
  {
    user: {
      name: "Elena Jiménez",
      email: "elena@ejemplo.com",
      avatar: "/diverse-group-avatars.png",
      initials: "EJ",
    },
    action: "subió un archivo a",
    target: "Recursos de Marketing",
    time: "hace 2 días",
    type: "upload",
  },
]

export function ActivityCard({ className }: ActivityCardProps) {
  return (
    <Card className={cn("border-brand-blue-100 card-hover", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones de tu equipo</CardDescription>
          </div>
          <Badge variant="outline" className="border-brand-blue-200 text-brand-blue-700 hover:bg-brand-blue-50">
            Ver todas
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="border border-brand-blue-100">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  <AvatarFallback className="bg-brand-blue-100 text-brand-blue-700">
                    {activity.user.initials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white",
                    activity.type === "create" && "bg-green-500",
                    activity.type === "comment" && "bg-blue-500",
                    activity.type === "complete" && "bg-purple-500",
                    activity.type === "upload" && "bg-amber-500",
                  )}
                >
                  {activity.type === "create" && <PlusIcon className="h-3 w-3 text-white" />}
                  {activity.type === "comment" && <MessageIcon className="h-3 w-3 text-white" />}
                  {activity.type === "complete" && <CheckIcon className="h-3 w-3 text-white" />}
                  {activity.type === "upload" && <UploadIcon className="h-3 w-3 text-white" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-gray-800">
                  <span className="font-semibold">{activity.user.name}</span> {activity.action}{" "}
                  <span className="font-semibold text-brand-blue-700">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}
