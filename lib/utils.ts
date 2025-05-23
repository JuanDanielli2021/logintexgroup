import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearFecha(fecha: Date): string {
  return format(new Date(fecha), "dd/MM/yyyy", { locale: es })
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(valor)
}

export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

// Función para formatear CUIT para visualización (XX-XXXXXXXX-X)
export function formatearCUIT(cuit: string): string {
  // Eliminar caracteres no numéricos
  const soloNumeros = cuit.replace(/[^0-9]/g, "")

  // Si no tiene suficientes dígitos, devolver el valor original
  if (soloNumeros.length < 11) return cuit

  // Formatear como XX-XXXXXXXX-X
  return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 10)}-${soloNumeros.slice(10, 11)}`
}

// Función para eliminar formato de CUIT (solo números)
export function limpiarCUIT(cuit: string): string {
  return cuit.replace(/[^0-9]/g, "")
}
