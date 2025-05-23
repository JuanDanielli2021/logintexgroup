import type { Metadata } from "next"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActivityCard } from "@/components/dashboard/activity-card"
import { ChartCard } from "@/components/dashboard/chart-card"
import { WelcomeCard } from "@/components/dashboard/welcome-card"

export const metadata: Metadata = {
  title: "Panel de Control",
  description: "Vista general del panel de control",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeCard />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ingresos Totales"
          value="$45,231.89"
          description="+20.1% respecto al mes pasado"
          trend="up"
          icon="dollar"
        />
        <StatsCard
          title="Suscripciones"
          value="2,350"
          description="+180 respecto al mes pasado"
          trend="up"
          icon="users"
        />
        <StatsCard
          title="Usuarios Activos"
          value="1,893"
          description="-10 respecto a ayer"
          trend="down"
          icon="activity"
        />
        <StatsCard
          title="Tasa de Conversión"
          value="3.2%"
          description="+0.5% respecto a la semana pasada"
          trend="up"
          icon="percent"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard className="lg:col-span-4" />
        <ActivityCard className="lg:col-span-3" />
      </div>
    </div>
  )
}
