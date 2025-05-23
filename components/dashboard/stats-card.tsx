import { ArrowDown, ArrowUp, DollarSign, Users, Activity, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  description: string
  trend: "up" | "down" | "neutral"
  icon: "dollar" | "users" | "activity" | "percent"
  className?: string
}

export function StatsCard({ title, value, description, trend, icon, className }: StatsCardProps) {
  const IconComponent = {
    dollar: DollarSign,
    users: Users,
    activity: Activity,
    percent: Percent,
  }[icon]

  return (
    <Card className={cn("border-brand-blue-100 overflow-hidden card-hover", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            icon === "dollar" && "bg-green-100",
            icon === "users" && "bg-blue-100",
            icon === "activity" && "bg-purple-100",
            icon === "percent" && "bg-amber-100",
          )}
        >
          <IconComponent
            className={cn(
              "h-4 w-4",
              icon === "dollar" && "text-green-600",
              icon === "users" && "text-blue-600",
              icon === "activity" && "text-purple-600",
              icon === "percent" && "text-amber-600",
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <p className="mt-1 flex items-center text-xs text-muted-foreground">
          {trend === "up" && <ArrowUp className="mr-1 h-4 w-4 text-green-500" />}
          {trend === "down" && <ArrowDown className="mr-1 h-4 w-4 text-red-500" />}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
