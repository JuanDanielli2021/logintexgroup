"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useSupabaseData<T>(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
    single?: boolean
  },
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Start building the query
        let query = supabase.from(table).select(options?.select || "*")

        // Apply filters if provided
        if (options?.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }

        // Apply ordering if provided
        if (options?.order) {
          query = query.order(options.order.column, {
            ascending: options.order.ascending ?? true,
          })
        }

        // Apply limit if provided
        if (options?.limit) {
          query = query.limit(options.limit)
        }

        // Execute the query
        const { data: result, error } = options?.single ? await query.single() : await query

        if (error) throw error

        setData(result as T)
        setError(null)
      } catch (err) {
        console.error(`Error fetching data from ${table}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table, options?.select, options?.limit, options?.single])

  return { data, loading, error }
}
