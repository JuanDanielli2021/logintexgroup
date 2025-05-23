"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function SetupCheckPage() {
  const [checks, setChecks] = useState({
    envVars: { status: "pending", message: "" },
    connection: { status: "pending", message: "" },
    database: { status: "pending", message: "" },
  })

  useEffect(() => {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setChecks((prev) => ({
        ...prev,
        envVars: {
          status: "error",
          message: "Missing Supabase environment variables. Check your .env.local file or Vercel project settings.",
        },
      }))
    } else {
      setChecks((prev) => ({
        ...prev,
        envVars: {
          status: "success",
          message: "Environment variables found.",
        },
      }))
    }

    // Simple check for connection - we'll just verify if we can make a request
    const checkConnection = async () => {
      try {
        // Simple fetch to check if we can make requests
        const response = await fetch("/api/health-check")

        if (response.ok) {
          setChecks((prev) => ({
            ...prev,
            connection: {
              status: "success",
              message: "API endpoint is accessible.",
            },
          }))
        } else {
          setChecks((prev) => ({
            ...prev,
            connection: {
              status: "error",
              message: "API endpoint returned an error.",
            },
          }))
        }
      } catch (err) {
        setChecks((prev) => ({
          ...prev,
          connection: {
            status: "error",
            message: "Failed to connect to API endpoint.",
          },
        }))
      }
    }

    checkConnection()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Supabase Setup Check</CardTitle>
          <CardDescription>Verifying your Supabase configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CheckItem title="Environment Variables" status={checks.envVars.status} message={checks.envVars.message} />
          <CheckItem title="API Connection" status={checks.connection.status} message={checks.connection.message} />

          <Alert className="bg-amber-50 border-amber-200">
            <AlertTitle className="text-amber-700">Database Setup</AlertTitle>
            <AlertDescription className="text-amber-600">
              To set up your database tables, visit the SQL Editor in your Supabase dashboard and run the migration
              script.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function CheckItem({
  title,
  status,
  message,
}: {
  title: string
  status: "pending" | "success" | "error"
  message: string
}) {
  return (
    <div className="space-y-2">
      <div className="font-medium">{title}</div>
      {status === "pending" && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          Checking...
        </div>
      )}

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
