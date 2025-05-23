"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import CheckEnv from "@/lib/check-env"
import Link from "next/link"

export default function DebugPage() {
  const [testResult, setTestResult] = useState<{
    status: "idle" | "loading" | "success" | "error"
    message: string
    details?: string
  }>({
    status: "idle",
    message: "",
  })

  const testConnection = async () => {
    setTestResult({
      status: "loading",
      message: "Testing connection to Supabase...",
    })

    try {
      const response = await fetch("/api/debug/test-connection")
      const data = await response.json()

      if (data.success) {
        setTestResult({
          status: "success",
          message: "Successfully connected to Supabase!",
          details: JSON.stringify(data, null, 2),
        })
      } else {
        setTestResult({
          status: "error",
          message: "Failed to connect to Supabase",
          details: JSON.stringify(data, null, 2),
        })
      }
    } catch (error) {
      setTestResult({
        status: "error",
        message: "Error testing connection",
        details: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Supabase Connection Debugger</CardTitle>
          <CardDescription>Diagnose issues with your Supabase connection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CheckEnv />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Connection</h3>
            <Button onClick={testConnection} disabled={testResult.status === "loading"}>
              {testResult.status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Supabase Connection
            </Button>

            {testResult.status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">Success</AlertTitle>
                <AlertDescription className="text-green-600">
                  {testResult.message}
                  {testResult.details && (
                    <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">{testResult.details}</pre>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {testResult.status === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {testResult.message}
                  {testResult.details && (
                    <pre className="mt-2 p-2 bg-red-100 text-red-900 rounded text-xs overflow-auto">
                      {testResult.details}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/setup-check">Go to Setup Check</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
