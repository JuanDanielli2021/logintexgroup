import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"

export function WelcomeCard() {
  return (
    <Card className="bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white border-none shadow-lg overflow-hidden relative mb-6">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">¡Bienvenido a LogintexGroup!</h1>
            <p className="text-blue-100 max-w-2xl">
              Aquí tienes un resumen de tu cuenta y actividad reciente. Explora las diferentes secciones para gestionar
              tus operaciones de comercio exterior de manera eficiente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Operación
            </Button>
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
              Ver Tutorial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
