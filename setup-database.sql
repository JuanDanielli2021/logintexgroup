-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('despachante', 'cliente')),
  cuit TEXT NOT NULL UNIQUE,
  razon_social TEXT NOT NULL,
  condicion_iva TEXT NOT NULL,
  domicilio TEXT NOT NULL,
  razon_social_empresa TEXT,
  domicilio_empresa TEXT,
  localidad TEXT NOT NULL,
  rubro TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create prefacturas table
CREATE TABLE IF NOT EXISTS public.prefacturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  concepto TEXT NOT NULL CHECK (concepto IN ('importacion', 'exportacion')),
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(15, 2) NOT NULL CHECK (cantidad > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create facturas table
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_comprobante TEXT NOT NULL CHECK (tipo_comprobante IN ('A', 'B', 'C', 'M', 'E')),
  punto_venta TEXT NOT NULL,
  numero_comprobante TEXT NOT NULL,
  fecha_emision DATE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  prefactura_id UUID NOT NULL REFERENCES public.prefacturas(id) ON DELETE RESTRICT,
  condicion_venta TEXT NOT NULL,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  valor_unitario DECIMAL(15, 2) NOT NULL CHECK (valor_unitario >= 0),
  subtotal DECIMAL(15, 2) NOT NULL CHECK (subtotal >= 0),
  iva DECIMAL(15, 2) NOT NULL CHECK (iva >= 0),
  total DECIMAL(15, 2) NOT NULL CHECK (total >= 0),
  cae TEXT NOT NULL,
  fecha_vencimiento_cae DATE NOT NULL,
  observaciones TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('emitida', 'pagada', 'vencida', 'anulada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tipo_comprobante, punto_venta, numero_comprobante)
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_prefacturas_updated_at BEFORE UPDATE ON public.prefacturas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON public.facturas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create a function to calculate invoice values
CREATE OR REPLACE FUNCTION calculate_invoice_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate subtotal
  NEW.subtotal = NEW.valor_unitario * NEW.cantidad;
  
  -- Calculate IVA (21%)
  NEW.iva = NEW.subtotal * 0.21;
  
  -- Calculate total
  NEW.total = NEW.subtotal + NEW.iva;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the calculation trigger to facturas table
CREATE TRIGGER calculate_invoice_values_trigger
BEFORE INSERT OR UPDATE OF valor_unitario, cantidad ON public.facturas
FOR EACH ROW EXECUTE PROCEDURE calculate_invoice_values();

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prefacturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for clients table
CREATE POLICY "Authenticated users can view all clients" ON public.clients
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can insert clients" ON public.clients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can delete clients" ON public.clients
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for prefacturas table
CREATE POLICY "Authenticated users can view all prefacturas" ON public.prefacturas
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can insert prefacturas" ON public.prefacturas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can update prefacturas" ON public.prefacturas
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can delete prefacturas" ON public.prefacturas
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for facturas table
CREATE POLICY "Authenticated users can view all facturas" ON public.facturas
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can insert facturas" ON public.facturas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can update facturas" ON public.facturas
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Authenticated users can delete facturas" ON public.facturas
  FOR DELETE USING (auth.role() = 'authenticated');
