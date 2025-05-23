"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function EnvChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])

  useEffect(() => {
    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missing = requiredVars.filter((varName) => !process.env[varName])
    setMissingVars(missing)
  }, [])

  if (missingVars.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error de configuración</AlertTitle>
      <AlertDescription>
        <p>Faltan las siguientes variables de entorno:</p>
        <ul className="list-disc pl-5 mt-2">
          {missingVars.map((varName) => (
            <li key={varName}>{varName}</li>
          ))}
        </ul>
        <p className="mt-2">
          Por favor, asegúrate de que estas variables estén definidas en tu archivo .env.local o en la configuración de
          tu entorno.
        </p>
      </AlertDescription>
    </Alert>
  )
}
