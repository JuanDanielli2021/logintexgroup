-- Habilitar RLS en la tabla prefacturas
ALTER TABLE prefacturas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar prefacturas" ON prefacturas;

-- Crear políticas para permitir operaciones CRUD a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer prefacturas"
  ON prefacturas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar prefacturas"
  ON prefacturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar prefacturas"
  ON prefacturas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar prefacturas"
  ON prefacturas
  FOR DELETE
  TO authenticated
  USING (true);

-- Habilitar RLS en la tabla facturas
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar facturas" ON facturas;

-- Crear políticas para permitir operaciones CRUD a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer facturas"
  ON facturas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar facturas"
  ON facturas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar facturas"
  ON facturas
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar facturas"
  ON facturas
  FOR DELETE
  TO authenticated
  USING (true);
