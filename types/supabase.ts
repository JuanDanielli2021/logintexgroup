export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          tipo: string
          cuit: string
          razon_social: string
          condicion_iva: string
          domicilio: string
          razon_social_empresa: string | null
          domicilio_empresa: string | null
          localidad: string
          rubro: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tipo: string
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
        Update: {
          id?: string
          tipo?: string
          cuit?: string
          razon_social?: string
          condicion_iva?: string
          domicilio?: string
          razon_social_empresa?: string | null
          domicilio_empresa?: string | null
          localidad?: string
          rubro?: string
          created_at?: string
          updated_at?: string
        }
      }
      prefacturas: {
        Row: {
          id: string
          cliente_id: string
          fecha: string
          concepto: string
          descripcion: string
          cantidad: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          fecha: string
          concepto: string
          descripcion: string
          cantidad: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          fecha?: string
          concepto?: string
          descripcion?: string
          cantidad?: number
          created_at?: string
          updated_at?: string
        }
      }
      facturas: {
        Row: {
          id: string
          tipo_comprobante: string
          punto_venta: string
          numero_comprobante: string
          fecha_emision: string
          cliente_id: string
          prefactura_id: string
          condicion_venta: string
          cantidad: number
          valor_unitario: number
          subtotal: number
          iva: number
          total: number
          cae: string
          fecha_vencimiento_cae: string
          observaciones: string | null
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tipo_comprobante: string
          punto_venta: string
          numero_comprobante: string
          fecha_emision: string
          cliente_id: string
          prefactura_id: string
          condicion_venta: string
          cantidad: number
          valor_unitario: number
          subtotal: number
          iva: number
          total: number
          cae: string
          fecha_vencimiento_cae: string
          observaciones?: string | null
          estado: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tipo_comprobante?: string
          punto_venta?: string
          numero_comprobante?: string
          fecha_emision?: string
          cliente_id?: string
          prefactura_id?: string
          condicion_venta?: string
          cantidad?: number
          valor_unitario?: number
          subtotal?: number
          iva?: number
          total?: number
          cae?: string
          fecha_vencimiento_cae?: string
          observaciones?: string | null
          estado?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
