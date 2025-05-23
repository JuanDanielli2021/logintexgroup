import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-brand-blue-500">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Página no encontrada</h2>
        <p className="mt-2 text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <div className="mt-6">
          <Button asChild className="bg-brand-blue-500 hover:bg-brand-blue-600">
            <Link href="/login">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
