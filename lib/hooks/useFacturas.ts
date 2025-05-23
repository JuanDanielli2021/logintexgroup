"use client"

import { useSupabaseCrud } from "./useSupabaseCrud"
import { useState, useEffect } from "react"
import type { Cliente } from "./useClientes"
import type { Prefactura } from "./usePrefacturas"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Definir la interfaz para Factura
export interface Factura {
  id?: string
  tipo_comprobante: "A" | "B" | "C" | "M" | "E"
  punto_venta: string
  numero_comprobante: string
  fecha_emision: string | Date
  cliente_id: string
  prefactura_id: string
  condicion_venta: string
  cantidad: number
  valor_unitario: number
  subtotal: number
  iva: number
  total: number
  cae: string
  fecha_vencimiento_cae: string | Date
  observaciones?: string | null
  estado: "emitida" | "pagada" | "vencida" | "anulada"
  created_at?: string
  updated_at?: string
  // Campos virtuales
  cliente?: Cliente
  prefactura?: Prefactura
  // Campos para la interfaz (camelCase)
  tipoComprobante?: "A" | "B" | "C" | "M" | "E"
  puntoVenta?: string
  numeroComprobante?: string
  fechaEmision?: string | Date
  clienteId?: string
  prefacturaId?: string
  condicionVenta?: string
  valorUnitario?: number
  fechaVencimientoCae?: string | Date
  items?: any[]
}

export function useFacturas() {
  const { toast } = useToast()
  const { loading, error, getAll, getById, create, update, remove } = useSupabaseCrud<Factura>("facturas")
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loadingFacturas, setLoadingFacturas] = useState(true)

  // Cargar facturas al inicializar el hook
  useEffect(() => {
    loadFacturas()
  }, [])

  // Función para cargar facturas directamente con Supabase
  const loadFacturas = async () => {
    try {
      setLoadingFacturas(true)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("facturas")
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
          ),
          prefacturas:prefactura_id (
            id,
            concepto,
            descripcion
          )
        `)
        .order("fecha_emision", { ascending: false })

      if (supabaseError) {
        console.error("Error al cargar facturas:", supabaseError)
        toast({
          title: "Error al cargar facturas",
          description: supabaseError.message,
          variant: "destructive",
        })
        setFacturas([])
        return
      }

      console.log("Facturas cargadas:", data)

      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData = data.map((item) => ({
        ...item,
        cliente: item.clients as unknown as Cliente,
        prefactura: item.prefacturas as unknown as Prefactura,
        clients: undefined,
        prefacturas: undefined,
      }))

      setFacturas(transformedData)
    } catch (err) {
      console.error("Error inesperado al cargar facturas:", err)
      toast({
        title: "Error al cargar facturas",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      setFacturas([])
    } finally {
      setLoadingFacturas(false)
    }
  }

  // Función para recargar las facturas
  const reloadFacturas = async (filters?: Record<string, any>) => {
    try {
      setLoadingFacturas(true)

      // Construir la consulta base
      let query = supabase.from("facturas").select(`
          *,
          clients:cliente_id (
            id, 
            tipo, 
            cuit, 
            razon_social, 
            condicion_iva, 
            razon_social_empresa, 
            domicilio_empresa
          ),
          prefacturas:prefactura_id (
            id,
            concepto,
            descripcion
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
      query = query.order("fecha_emision", { ascending: false })

      // Ejecutar la consulta
      const { data, error: supabaseError } = await query

      if (supabaseError) {
        console.error("Error al recargar facturas:", supabaseError)
        toast({
          title: "Error al recargar facturas",
          description: supabaseError.message,
          variant: "destructive",
        })
        return []
      }

      console.log("Facturas recargadas:", data)

      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData = data.map((item) => ({
        ...item,
        cliente: item.clients as unknown as Cliente,
        prefactura: item.prefacturas as unknown as Prefactura,
        clients: undefined,
        prefacturas: undefined,
      }))

      setFacturas(transformedData)
      return transformedData
    } catch (err) {
      console.error("Error inesperado al recargar facturas:", err)
      toast({
        title: "Error al recargar facturas",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return []
    } finally {
      setLoadingFacturas(false)
    }
  }

  // Función para formatear los datos de la factura antes de enviarlos a la base de datos
  const formatFacturaData = (factura: Partial<Factura>): Partial<Factura> => {
    const formattedData: any = {}

    // Mapeo explícito de propiedades camelCase a snake_case
    if (factura.tipoComprobante !== undefined) formattedData.tipo_comprobante = factura.tipoComprobante
    if (factura.puntoVenta !== undefined) formattedData.punto_venta = factura.puntoVenta
    if (factura.numeroComprobante !== undefined) formattedData.numero_comprobante = factura.numeroComprobante
    if (factura.fechaEmision !== undefined) formattedData.fecha_emision = factura.fechaEmision
    if (factura.condicionVenta !== undefined) formattedData.condicion_venta = factura.condicionVenta
    if (factura.fechaVencimientoCae !== undefined) formattedData.fecha_vencimiento_cae = factura.fechaVencimientoCae
    if (factura.valorUnitario !== undefined) formattedData.valor_unitario = factura.valorUnitario

    // Propiedades que no necesitan conversión
    if (factura.cliente_id !== undefined) formattedData.cliente_id = factura.cliente_id
    if (factura.prefactura_id !== undefined) formattedData.prefactura_id = factura.prefactura_id
    if (factura.cantidad !== undefined) formattedData.cantidad = factura.cantidad
    if (factura.subtotal !== undefined) formattedData.subtotal = factura.subtotal
    if (factura.iva !== undefined) formattedData.iva = factura.iva
    if (factura.total !== undefined) formattedData.total = factura.total
    if (factura.cae !== undefined) formattedData.cae = factura.cae
    if (factura.observaciones !== undefined) formattedData.observaciones = factura.observaciones
    if (factura.estado !== undefined) formattedData.estado = factura.estado

    // Asegurarse de que cliente_id y prefactura_id estén establecidos correctamente
    if (factura.cliente) {
      formattedData.cliente_id = factura.cliente.id!
    } else if (factura.clienteId) {
      formattedData.cliente_id = factura.clienteId
    }

    if (factura.prefactura) {
      formattedData.prefactura_id = factura.prefactura.id!
    } else if (factura.prefacturaId) {
      formattedData.prefactura_id = factura.prefacturaId
    }

    // Manejar los ítems de factura
    if (factura.items && factura.items.length > 0) {
      // Usar el primer ítem para los campos principales
      const primerItem = factura.items[0]

      // Asegurarse de que los campos obligatorios estén presentes
      formattedData.cantidad = Number(primerItem.cantidad) || 1
      formattedData.valor_unitario = Number(primerItem.valorUnitario) || 0
      formattedData.subtotal = Number(primerItem.subtotal) || 0
      formattedData.iva = Number(primerItem.iva) || 0
      formattedData.total = Number(primerItem.total) || 0

      // Guardar la descripción del ítem en las observaciones si no hay observaciones
      if (!formattedData.observaciones && primerItem.descripcion) {
        formattedData.observaciones = primerItem.descripcion
      }

      // Nota: Eliminamos la línea que intentaba guardar los ítems como JSON
      // ya que la columna 'items_json' no existe en la tabla 'facturas'
    }

    // Formatear las fechas correctamente
    if (formattedData.fecha_emision) {
      if (formattedData.fecha_emision instanceof Date) {
        formattedData.fecha_emision = formattedData.fecha_emision.toISOString().split("T")[0]
      } else if (typeof formattedData.fecha_emision === "string" && formattedData.fecha_emision.includes("T")) {
        // Si es un string ISO, extraer solo la parte de la fecha
        formattedData.fecha_emision = formattedData.fecha_emision.split("T")[0]
      }
    }
    if (formattedData.fecha_vencimiento_cae) {
      if (formattedData.fecha_vencimiento_cae instanceof Date) {
        formattedData.fecha_vencimiento_cae = formattedData.fecha_vencimiento_cae.toISOString().split("T")[0]
      } else if (
        typeof formattedData.fecha_vencimiento_cae === "string" &&
        formattedData.fecha_vencimiento_cae.includes("T")
      ) {
        // Si es un string ISO, extraer solo la parte de la fecha
        formattedData.fecha_vencimiento_cae = formattedData.fecha_vencimiento_cae.split("T")[0]
      }
    }

    // Asegurarse de que los campos numéricos sean números
    if (formattedData.cantidad !== undefined) {
      if (typeof formattedData.cantidad === "string") {
        formattedData.cantidad = Number.parseInt(formattedData.cantidad.replace(/[^\d.-]/g, "")) || 1
      }
    } else {
      // Si no hay cantidad, establecer un valor predeterminado
      formattedData.cantidad = 1
    }

    if (formattedData.valor_unitario !== undefined) {
      if (typeof formattedData.valor_unitario === "string") {
        formattedData.valor_unitario = Number.parseFloat(formattedData.valor_unitario.replace(/[^\d.-]/g, "")) || 0
      }
    } else {
      // Si no hay valor unitario, establecer un valor predeterminado
      formattedData.valor_unitario = 0
    }

    if (formattedData.subtotal !== undefined) {
      if (typeof formattedData.subtotal === "string") {
        formattedData.subtotal = Number.parseFloat(formattedData.subtotal.replace(/[^\d.-]/g, "")) || 0
      }
    } else {
      // Si no hay subtotal, calcularlo
      formattedData.subtotal = (formattedData.cantidad || 1) * (formattedData.valor_unitario || 0)
    }

    if (formattedData.iva !== undefined) {
      if (typeof formattedData.iva === "string") {
        formattedData.iva = Number.parseFloat(formattedData.iva.replace(/[^\d.-]/g, "")) || 0
      }
    } else {
      // Si no hay IVA, calcularlo
      formattedData.iva = formattedData.subtotal * 0.21
    }

    if (formattedData.total !== undefined) {
      if (typeof formattedData.total === "string") {
        formattedData.total = Number.parseFloat(formattedData.total.replace(/[^\d.-]/g, "")) || 0
      }
    } else {
      // Si no hay total, calcularlo
      formattedData.total = formattedData.subtotal + formattedData.iva
    }

    // Asegurarse de que tipo_comprobante sea uno de los valores permitidos
    if (formattedData.tipo_comprobante && !["A", "B", "C", "M", "E"].includes(formattedData.tipo_comprobante)) {
      formattedData.tipo_comprobante = "A" // Valor por defecto
    }

    // Asegurarse de que estado sea uno de los valores permitidos
    if (formattedData.estado && !["emitida", "pagada", "vencida", "anulada"].includes(formattedData.estado)) {
      formattedData.estado = "emitida" // Valor por defecto
    }

    console.log("Datos formateados:", formattedData)
    return formattedData
  }

  // Función para crear una factura y actualizar la lista
  const createFactura = async (factura: Omit<Factura, "id">) => {
    try {
      console.log("Datos originales para crear factura:", factura)

      // Formatear los datos antes de enviarlos
      const formattedData = formatFacturaData(factura)

      console.log("Datos formateados para crear factura:", formattedData)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase.from("facturas").insert([formattedData]).select()

      if (supabaseError) {
        console.error("Error al crear factura:", supabaseError)
        toast({
          title: "Error al crear factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        throw supabaseError
      }

      const newFactura = data?.[0]

      if (newFactura) {
        toast({
          title: "Factura creada",
          description: "La factura ha sido creada exitosamente.",
        })
        await reloadFacturas()
      }

      return newFactura
    } catch (err) {
      console.error("Error inesperado al crear factura:", err)
      toast({
        title: "Error al crear factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Función para actualizar una factura y actualizar la lista
  const updateFactura = async (id: string, factura: Partial<Factura>) => {
    try {
      console.log("Datos originales para actualizar factura:", factura)

      // Formatear los datos antes de enviarlos
      const formattedData = formatFacturaData(factura)

      console.log("Datos formateados para actualizar factura:", formattedData)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase.from("facturas").update(formattedData).eq("id", id).select()

      if (supabaseError) {
        console.error("Error al actualizar factura:", supabaseError)
        toast({
          title: "Error al actualizar factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        throw supabaseError
      }

      const updatedFactura = data?.[0]

      if (updatedFactura) {
        toast({
          title: "Factura actualizada",
          description: "La factura ha sido actualizada exitosamente.",
        })
        await reloadFacturas()
      }

      return updatedFactura
    } catch (err) {
      console.error("Error inesperado al actualizar factura:", err)
      toast({
        title: "Error al actualizar factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      throw err
    }
  }

  // Función para eliminar una factura y actualizar la lista
  const removeFactura = async (id: string) => {
    try {
      // Usar directamente el cliente de Supabase para mayor control
      const { error: supabaseError } = await supabase.from("facturas").delete().eq("id", id)

      if (supabaseError) {
        console.error("Error al eliminar factura:", supabaseError)
        toast({
          title: "Error al eliminar factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Factura eliminada",
        description: "La factura ha sido eliminada exitosamente.",
      })
      await reloadFacturas()

      return true
    } catch (err) {
      console.error("Error inesperado al eliminar factura:", err)
      toast({
        title: "Error al eliminar factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return false
    }
  }

  // Función para obtener una factura por ID con información del cliente y prefactura
  const getFacturaWithRelations = async (id: string) => {
    try {
      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("facturas")
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
          ),
          prefacturas:prefactura_id (
            id,
            concepto,
            descripcion
          )
        `)
        .eq("id", id)
        .single()

      if (supabaseError) {
        console.error("Error al obtener factura:", supabaseError)
        toast({
          title: "Error al obtener factura",
          description: supabaseError.message,
          variant: "destructive",
        })
        return null
      }

      return {
        ...data,
        cliente: data.clients as unknown as Cliente,
        prefactura: data.prefacturas as unknown as Prefactura,
        clients: undefined,
        prefacturas: undefined,
      }
    } catch (err) {
      console.error("Error inesperado al obtener factura:", err)
      toast({
        title: "Error al obtener factura",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    facturas,
    loadingFacturas,
    error,
    getFactura: getFacturaWithRelations,
    createFactura,
    updateFactura,
    removeFactura,
    reloadFacturas,
    loadFacturas,
  }
}
