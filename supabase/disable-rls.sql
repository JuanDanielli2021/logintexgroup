-- Script para deshabilitar RLS en las tablas principales
-- IMPORTANTE: Esto elimina la protección de seguridad a nivel de fila
-- Solo debe usarse en entornos de desarrollo o cuando se comprenden las implicaciones

-- Deshabilitar RLS para la tabla clients
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla prefacturas
ALTER TABLE prefacturas DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla facturas
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'RLS deshabilitado para las tablas clients, prefacturas y facturas';
END $$;
