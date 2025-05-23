"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

interface OrderBy {
  column: string
  ascending: boolean
}

interface GetAllOptions {
  filters?: Record<string, any>
  joins?: string
  orderBy?: OrderBy
}

export function useSupabaseCrud<T extends Record<string, any>>(tableName: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener todos los registros
  const getAll = async (options: GetAllOptions = {}) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select(options.joins || "*")

      // Aplicar filtros si se proporcionan
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value)
          }
        })
      }

      // Aplicar ordenamiento si se proporciona
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending })
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        console.error(`Error al obtener registros de ${tableName}:`, supabaseError)
        setError(supabaseError.message)
        return []
      }

      return data || []
    } catch (err: any) {
      console.error(`Error inesperado al obtener registros de ${tableName}:`, err)
      setError(err.message || "Error inesperado")
      return []
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener un registro por ID
  const getById = async (id: string, joins?: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from(tableName)
        .select(joins || "*")
        .eq("id", id)
        .single()

      if (supabaseError) {
        console.error(`Error al obtener registro de ${tableName} con ID ${id}:`, supabaseError)
        setError(supabaseError.message)
        return null
      }

      return data
    } catch (err: any) {
      console.error(`Error inesperado al obtener registro de ${tableName} con ID ${id}:`, err)
      setError(err.message || "Error inesperado")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Función para crear un nuevo registro
  const create = async (data: Omit<T, "id">) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Creando registro en ${tableName} con datos:`, data)

      const { data: createdData, error: supabaseError } = await supabase.from(tableName).insert([data]).select()

      if (supabaseError) {
        console.error(`Error al crear registro en ${tableName}:`, supabaseError)
        setError(supabaseError.message)
        return null
      }

      return createdData?.[0] || null
    } catch (err: any) {
      console.error(`Error inesperado al crear registro en ${tableName}:`, err)
      setError(err.message || "Error inesperado")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar un registro existente
  const update = async (id: string, data: Partial<T>) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Actualizando registro en ${tableName} con ID ${id} y datos:`, data)

      const { data: updatedData, error: supabaseError } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select()

      if (supabaseError) {
        console.error(`Error al actualizar registro en ${tableName} con ID ${id}:`, supabaseError)
        setError(supabaseError.message)
        return null
      }

      return updatedData?.[0] || null
    } catch (err: any) {
      console.error(`Error inesperado al actualizar registro en ${tableName} con ID ${id}:`, err)
      setError(err.message || "Error inesperado")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar un registro
  const remove = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error: supabaseError } = await supabase.from(tableName).delete().eq("id", id)

      if (supabaseError) {
        console.error(`Error al eliminar registro de ${tableName} con ID ${id}:`, supabaseError)
        setError(supabaseError.message)
        return false
      }

      return true
    } catch (err: any) {
      console.error(`Error inesperado al eliminar registro de ${tableName} con ID ${id}:`, err)
      setError(err.message || "Error inesperado")
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
  }
}
