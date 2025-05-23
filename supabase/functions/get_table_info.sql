-- Crear función para obtener información de las tablas
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
  FROM 
    information_schema.columns
  WHERE 
    table_name = $1
    AND table_schema = 'public'
  ORDER BY 
    ordinal_position;
$$;
