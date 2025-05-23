-- Script para actualizar la tabla "facturas" con las columnas necesarias

-- Verificar si existe la columna condicion_venta
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'facturas'
        AND column_name = 'condicion_venta'
    ) THEN
        ALTER TABLE facturas ADD COLUMN condicion_venta text NOT NULL DEFAULT 'Contado';
    END IF;
END $$;

-- Verificar si existe la columna observaciones
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'facturas'
        AND column_name = 'observaciones'
    ) THEN
        ALTER TABLE facturas ADD COLUMN observaciones text;
    END IF;
END $$;

-- Verificar si existe la columna estado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'facturas'
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE facturas ADD COLUMN estado text NOT NULL DEFAULT 'emitida';
    END IF;
END $$;

-- Verificar si existe la columna items_data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'facturas'
        AND column_name = 'items_data'
    ) THEN
        ALTER TABLE facturas ADD COLUMN items_data jsonb;
    END IF;
END $$;

-- Actualizar las políticas RLS para la tabla facturas
DROP POLICY IF EXISTS "Permitir acceso a facturas para usuarios autenticados" ON facturas;
CREATE POLICY "Permitir acceso a facturas para usuarios autenticados" ON facturas
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
