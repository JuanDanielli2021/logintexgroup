"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { limpiarCUIT } from "@/lib/utils"

// Definir la interfaz para Cliente
export interface Cliente {
  id?: string
  tipo: "despachante" | "cliente"
  cuit: string
  razon_social: string
  condicion_iva: string
  domicilio: string
  razon_social_empresa?: string | null
  domicilio_empresa?: string | null
  localidad: string
  rubro: string
  created_at?: string
  updated_at?: string
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Crear cliente de Supabase
  const supabase = createClient()

  // Cargar clientes al inicializar el hook
  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.from("clients").select("*").order("razon_social", { ascending: true })

        if (error) {
          throw error
        }

        setClientes(data || [])
      } catch (err) {
        console.error("Error al cargar clientes:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    loadClientes()
  }, [])

  // Función para recargar los clientes
  const reloadClientes = async (filters?: Record<string, any>) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from("clients").select("*")

      // Aplicar filtros si existen
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value)
          }
        })
      }

      // Ordenar por razón social
      query = query.order("razon_social", { ascending: true })

      const { data, error } = await query

      if (error) {
        throw error
      }

      setClientes(data || [])
      return data
    } catch (err) {
      console.error("Error al recargar clientes:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return []
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener un cliente por ID
  const getCliente = async (id: string) => {
    try {
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error("Error al obtener cliente:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return null
    }
  }

  // Función para crear un cliente
  const createCliente = async (cliente: Omit<Cliente, "id">) => {
    try {
      // Asegurarse de que el CUIT no tenga guiones
      const clienteFormateado = {
        ...cliente,
        cuit: limpiarCUIT(cliente.cuit),
      }

      const { data, error } = await supabase.from("clients").insert([clienteFormateado]).select()

      if (error) {
        throw error
      }

      await reloadClientes()
      return data[0]
    } catch (err) {
      console.error("Error al crear cliente:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return null
    }
  }

  // Función para actualizar un cliente
  const updateCliente = async (id: string, cliente: Partial<Cliente>) => {
    try {
      // Si hay CUIT, asegurarse de que no tenga guiones
      const clienteFormateado = {
        ...cliente,
      }

      if (clienteFormateado.cuit) {
        clienteFormateado.cuit = limpiarCUIT(clienteFormateado.cuit)
      }

      const { data, error } = await supabase.from("clients").update(clienteFormateado).eq("id", id).select()

      if (error) {
        throw error
      }

      await reloadClientes()
      return data[0]
    } catch (err) {
      console.error("Error al actualizar cliente:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return null
    }
  }

  // Función para eliminar un cliente
  const removeCliente = async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id)

      if (error) {
        throw error
      }

      await reloadClientes()
      return true
    } catch (err) {
      console.error("Error al eliminar cliente:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      return false
    }
  }

  return {
    clientes,
    loading,
    error,
    getCliente,
    createCliente,
    updateCliente,
    removeCliente,
    reloadClientes,
  }
}
