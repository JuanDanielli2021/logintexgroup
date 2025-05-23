"use client"

import { useSupabaseCrud } from "./useSupabaseCrud"
import { useState, useEffect } from "react"
import type { Cliente } from "./useClientes"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Definir la interfaz para Prefactura
export interface Prefactura {
  id?: string
  cliente_id: string
  fecha: string | Date
  concepto: "importacion" | "exportacion"
  descripcion: string
  cantidad: number
  created_at?: string
  updated_at?: string
  // Campo virtual para el cliente
  cliente?: Cliente
}

export function usePrefacturas() {
  const { toast } = useToast()
  const { loading, error, getAll, getById, create, update, remove } = useSupabaseCrud<Prefactura>("prefacturas")
  const [prefacturas, setPrefacturas] = useState<Prefactura[]>([])
  const [loadingPrefacturas, setLoadingPrefacturas] = useState(true)

  // Cargar prefacturas al inicializar el hook
  useEffect(() => {
    loadPrefacturas()
  }, [])

  // Función para cargar prefacturas directamente con Supabase
  const loadPrefacturas = async () => {
    try {
      setLoadingPrefacturas(true)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("prefacturas")
        .select(`
          *,
          clients:cliente_id (
            id, 
            tipo, 
            cuit, 
            razon_social, 
            condicion_iva, 
            razon_social_empresa, 
            domicilio_empresa
          )
        `)
        .order("fecha", { ascending: false })

      if (supabaseError) {
        console.error("Error al cargar prefacturas:", supabaseError)
        toast({
          title: "Error al cargar prefacturas",
          description: supabaseError.message,
          variant: "destructive",
        })
        setPrefacturas([])
        return
      }

      console.log("Prefacturas cargadas:", data)

      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData = data.map((item) => ({
        ...item,
        cliente: item.clients as unknown as Cliente,
        clients: undefined,
      }))

      setPrefacturas(transformedData)
    } catch (err) {
      console.error("Error inesperado al cargar prefacturas:", err)
      toast({
        title: "Error al cargar prefacturas",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      setPrefacturas([])
    } finally {
      setLoadingPrefacturas(false)
    }
  }

  // Función para recargar las prefacturas
  const reloadPrefacturas = async (filters?: Record<string, any>) => {
    try {
      setLoadingPrefacturas(true)

      // Construir la consulta base
      let query = supabase.from("prefacturas").select(`
          *,
          clients:cliente_id (
            id, 
            tipo, 
            cuit, 
            razon_social, 
            condicion_iva, 
            razon_social_empresa, 
            domicilio_empresa
          )
        `)

      // Aplicar filtros si se proporcionan
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value)
          }
        })
      }

      // Ordenar los resultados
      query = query.order("fecha", { ascending: false })

      // Ejecutar la consulta
      const { data, error: supabaseError } = await query

      if (supabaseError) {
        console.error("Error al recargar prefacturas:", supabaseError)
        toast({
          title: "Error al recargar prefacturas",
          description: supabaseError.message,
          variant: "destructive",
        })
        return []
      }

      console.log("Prefacturas recargadas:", data)

      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData = data.map((item) => ({
        ...item,
        cliente: item.clients as unknown as Cliente,
        clients: undefined,
      }))

      setPrefacturas(transformedData)
      return transformedData
    } catch (err) {
      console.error("Error inesperado al recargar prefacturas:", err)
      toast({
        title: "Error al recargar prefacturas",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return []
    } finally {
      setLoadingPrefacturas(false)
    }
  }

  // Función para formatear los datos de la prefactura antes de enviarlos a la base de datos
  const formatPrefacturaData = (prefactura: Partial<Prefactura>): Partial<Prefactura> => {
    const formattedData = { ...prefactura }

    // Asegurarse de que cliente_id esté establecido correctamente
    if (formattedData.cliente) {
      formattedData.cliente_id = formattedData.cliente.id!
      delete formattedData.cliente
    }

    // Formatear la fecha correctamente
    if (formattedData.fecha) {
      if (formattedData.fecha instanceof Date) {
        formattedData.fecha = formattedData.fecha.toISOString().split("T")[0]
      } else if (typeof formattedData.fecha === "string" && formattedData.fecha.includes("T")) {
        // Si es un string ISO, extraer solo la parte de la fecha
        formattedData.fecha = formattedData.fecha.split("T")[0]
      }
    }

    // Asegurarse de que cantidad sea un número
    if (formattedData.cantidad !== undefined) {
      if (typeof formattedData.cantidad === "string") {
        // Convertir a número, manteniendo decimales si existen
        formattedData.cantidad = Number.parseFloat(formattedData.cantidad)

        // Si es NaN (por ejemplo, si el string está vacío), establecer a 0
        if (isNaN(formattedData.cantidad)) {
          formattedData.cantidad = 0
        }
      }
    }

    // Asegurarse de que concepto sea uno de los valores permitidos
    if (formattedData.concepto && !["importacion", "exportacion"].includes(formattedData.concepto)) {
      formattedData.concepto = "importacion" // Valor por defecto
    }

    return formattedData
  }

  // Función para crear una prefactura y actualizar la lista
  const createPrefactura = async (prefactura: Omit<Prefactura, "id">) => {
    try {
      // Formatear los datos antes de enviarlos
      const formattedData = formatPrefacturaData(prefactura)

      console.log("Datos formateados para crear prefactura:", formattedData)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase.from("prefacturas").insert([formattedData]).select()

      if (supabaseError) {
        console.error("Error al crear prefactura:", supabaseError)
        toast({
          title: "Error al crear pre-factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        throw supabaseError
      }

      const newPrefactura = data?.[0]

      if (newPrefactura) {
        toast({
          title: "Pre-factura creada",
          description: "La pre-factura ha sido creada exitosamente.",
        })
        await reloadPrefacturas()
      }

      return newPrefactura
    } catch (err) {
      console.error("Error inesperado al crear prefactura:", err)
      toast({
        title: "Error al crear pre-factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Función para actualizar una prefactura y actualizar la lista
  const updatePrefactura = async (id: string, prefactura: Partial<Prefactura>) => {
    try {
      // Formatear los datos antes de enviarlos
      const formattedData = formatPrefacturaData(prefactura)

      console.log("Datos formateados para actualizar prefactura:", formattedData)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("prefacturas")
        .update(formattedData)
        .eq("id", id)
        .select()

      if (supabaseError) {
        console.error("Error al actualizar prefactura:", supabaseError)
        toast({
          title: "Error al actualizar pre-factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        throw supabaseError
      }

      const updatedPrefactura = data?.[0]

      if (updatedPrefactura) {
        toast({
          title: "Pre-factura actualizada",
          description: "La pre-factura ha sido actualizada exitosamente.",
        })
        await reloadPrefacturas()
      }

      return updatedPrefactura
    } catch (err) {
      console.error("Error inesperado al actualizar prefactura:", err)
      toast({
        title: "Error al actualizar pre-factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Función para eliminar una prefactura y actualizar la lista
  const removePrefactura = async (id: string) => {
    try {
      // Usar directamente el cliente de Supabase para mayor control
      const { error: supabaseError } = await supabase.from("prefacturas").delete().eq("id", id)

      if (supabaseError) {
        console.error("Error al eliminar prefactura:", supabaseError)
        toast({
          title: "Error al eliminar pre-factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Pre-factura eliminada",
        description: "La pre-factura ha sido eliminada exitosamente.",
      })
      await reloadPrefacturas()

      return true
    } catch (err) {
      console.error("Error inesperado al eliminar prefactura:", err)
      toast({
        title: "Error al eliminar pre-factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return false
    }
  }

  // Función para obtener una prefactura por ID con información del cliente
  const getPrefacturaWithCliente = async (id: string) => {
    try {
      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("prefacturas")
        .select(`
          *,
          clients:cliente_id (
            id, 
            tipo, 
            cuit, 
            razon_social, 
            condicion_iva, 
            razon_social_empresa, 
            domicilio_empresa
          )
        `)
        .eq("id", id)
        .single()

      if (supabaseError) {
        console.error("Error al obtener prefactura:", supabaseError)
        toast({
          title: "Error al obtener pre-factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        return null
      }

      return {
        ...data,
        cliente: data.clients as unknown as Cliente,
        clients: undefined,
      }
    } catch (err) {
      console.error("Error inesperado al obtener prefactura:", err)
      toast({
        title: "Error al obtener pre-factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    prefacturas,
    loadingPrefacturas,
    error,
    getPrefactura: getPrefacturaWithCliente,
    createPrefactura,
    updatePrefactura,
    removePrefactura,
    reloadPrefacturas,
    loadPrefacturas,
  }
}
