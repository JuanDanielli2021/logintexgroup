-- Función para ejecutar SQL dinámicamente
-- NOTA: Esta función es potencialmente peligrosa y solo debe usarse en entornos controlados
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
