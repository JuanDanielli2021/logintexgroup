"use client"

import { useEffect, useState } from "react"

export default function CheckEnv() {
  const [envStatus, setEnvStatus] = useState<{
    url: string | null
    key: string | null
    valid: boolean
  }>({
    url: null,
    key: null,
    valid: false,
  })

  useEffect(() => {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvStatus({
      url: supabaseUrl || null,
      key: supabaseAnonKey ? "[REDACTED]" : null,
      valid: Boolean(supabaseUrl && supabaseAnonKey),
    })
  }, [])

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Environment Variables Check</h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
          {envStatus.url ? (
            <span className="text-green-600">{envStatus.url}</span>
          ) : (
            <span className="text-red-600">Missing</span>
          )}
        </div>
        <div>
          <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
          {envStatus.key ? (
            <span className="text-green-600">{envStatus.key}</span>
          ) : (
            <span className="text-red-600">Missing</span>
          )}
        </div>
        <div>
          <span className="font-medium">Status:</span>{" "}
          {envStatus.valid ? (
            <span className="text-green-600">Environment variables are set</span>
          ) : (
            <span className="text-red-600">Environment variables are missing</span>
          )}
        </div>
      </div>
    </div>
  )
}
