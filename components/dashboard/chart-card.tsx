"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

interface ChartCardProps {
  className?: string
}

export function ChartCard({ className }: ChartCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Chart configuration
    const data = {
      labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
      datasets: [
        {
          label: "Ingresos",
          data: [3000, 4500, 3500, 5000, 4800, 6000],
          color: "#0087ff",
          fillColor: "rgba(0, 135, 255, 0.1)",
        },
        {
          label: "Gastos",
          data: [2000, 2300, 2100, 2800, 2600, 3200],
          color: "#ef4444",
          fillColor: "rgba(239, 68, 68, 0.1)",
        },
      ],
    }

    // Chart dimensions
    const chartWidth = rect.width
    const chartHeight = rect.height
    const padding = 40
    const graphWidth = chartWidth - padding * 2
    const graphHeight = chartHeight - padding * 2

    // Clear canvas
    ctx.clearRect(0, 0, chartWidth, chartHeight)

    // Draw background grid
    ctx.beginPath()
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (graphHeight / gridLines) * i
      ctx.moveTo(padding, y)
      ctx.lineTo(chartWidth - padding, y)
    }
    ctx.strokeStyle = "rgba(0, 135, 255, 0.1)"
    ctx.stroke()

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, chartHeight - padding)
    ctx.lineTo(chartWidth - padding, chartHeight - padding)
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw labels
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#6b7280"
    ctx.textAlign = "center"

    // X-axis labels
    const xStep = graphWidth / (data.labels.length - 1)
    data.labels.forEach((label, i) => {
      const x = padding + i * xStep
      ctx.fillText(label, x, chartHeight - padding + 20)
    })

    // Y-axis labels
    const maxValue = Math.max(...data.datasets.flatMap((dataset) => dataset.data)) * 1.1
    const yStep = graphHeight / 4
    for (let i = 0; i <= 4; i++) {
      const y = chartHeight - padding - i * yStep
      const value = Math.round((maxValue * i) / 4)
      ctx.fillText(value.toString(), padding - 20, y + 4)
    }

    // Draw datasets with fill
    data.datasets.forEach((dataset) => {
      // Fill area under the line
      ctx.beginPath()
      dataset.data.forEach((value, i) => {
        const x = padding + i * xStep
        const y = chartHeight - padding - (value / maxValue) * graphHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      // Complete the path to create a closed shape for filling
      const lastX = padding + (data.labels.length - 1) * xStep
      const lastY = chartHeight - padding - (dataset.data[dataset.data.length - 1] / maxValue) * graphHeight
      ctx.lineTo(lastX, chartHeight - padding)
      ctx.lineTo(padding, chartHeight - padding)
      ctx.closePath()

      // Fill the area
      ctx.fillStyle = dataset.fillColor
      ctx.fill()

      // Draw the line
      ctx.beginPath()
      dataset.data.forEach((value, i) => {
        const x = padding + i * xStep
        const y = chartHeight - padding - (value / maxValue) * graphHeight
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = dataset.color
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      dataset.data.forEach((value, i) => {
        const x = padding + i * xStep
        const y = chartHeight - padding - (value / maxValue) * graphHeight
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = dataset.color
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      })
    })

    // Draw legend
    const legendX = chartWidth - padding - 150
    const legendY = padding + 20
    data.datasets.forEach((dataset, i) => {
      const y = legendY + i * 25

      // Draw legend color box
      ctx.fillStyle = dataset.color
      ctx.fillRect(legendX, y, 15, 15)

      // Draw legend text
      ctx.fillStyle = "#374151"
      ctx.textAlign = "left"
      ctx.fillText(dataset.label, legendX + 25, y + 12)
    })
  }, [isLoading])

  return (
    <Card className={cn("border-brand-blue-100 card-hover", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Rendimiento</CardTitle>
            <CardDescription>Ingresos vs Gastos</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-brand-blue-100 text-brand-blue-700 hover:bg-brand-blue-50"
              onClick={refreshData}
            >
              <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isLoading && "animate-spin")} />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-brand-blue-100 text-brand-blue-700 hover:bg-brand-blue-50"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <div className="flex items-center justify-between">
            <TabsList className="bg-brand-blue-50">
              <TabsTrigger
                value="chart"
                className="data-[state=active]:bg-white data-[state=active]:text-brand-blue-700 data-[state=active]:shadow-sm"
              >
                Gráfico
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:text-brand-blue-700 data-[state=active]:shadow-sm"
              >
                Resumen
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center">
              <Badge variant="outline" className="border-brand-blue-200 bg-brand-blue-50 text-brand-blue-700">
                Últimos 6 meses
              </Badge>
            </div>
          </div>
          <TabsContent value="chart" className="pt-4">
            <div className="h-[300px] w-full">
              <canvas ref={canvasRef} className="h-full w-full" style={{ display: "block" }} />
            </div>
          </TabsContent>
          <TabsContent value="overview" className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg border border-brand-blue-100 bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Ingresos Totales</div>
                  <div className="text-2xl font-bold text-brand-blue-700">$26,800</div>
                  <div className="mt-1 flex items-center text-xs text-green-600">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    +15% respecto al período anterior
                  </div>
                </div>
                <div className="rounded-lg border border-brand-blue-100 bg-white p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Gastos Totales</div>
                  <div className="text-2xl font-bold text-red-600">$15,000</div>
                  <div className="mt-1 flex items-center text-xs text-red-600">
                    <ArrowUp className="mr-1 h-3 w-3" />
                    +8% respecto al período anterior
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-brand-blue-100 bg-white p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Beneficio Neto</div>
                <div className="text-2xl font-bold text-green-600">$11,800</div>
                <div className="mt-1 flex items-center text-xs text-green-600">
                  <ArrowUp className="mr-1 h-3 w-3" />
                  +24% respecto al período anterior
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-brand-blue-500" style={{ width: "44%" }}></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Objetivo: $25,000</span>
                  <span>Actual: $11,800 (44%)</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ArrowUp(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  )
}
