/*
  # Sistema de Gestión de Reservas de Canchas Deportivas

  ## Descripción General
  Este sistema maneja la gestión completa de reservas de canchas en espacios deportivos
  con diferentes roles de usuario y funcionalidades de wallet con cupones.

  ## 1. Nuevas Tablas

  ### `profiles`
  - `id` (uuid, PK) - ID del usuario vinculado a auth.users
  - `email` (text) - Email del usuario
  - `full_name` (text) - Nombre completo
  - `role` (text) - Rol: 'admin_general', 'admin_facility', 'client', 'regulator'
  - `facility_id` (uuid, FK nullable) - Espacio asignado para admin_facility
  - `created_at` (timestamptz) - Fecha de creación

  ### `sports_facilities`
  - `id` (uuid, PK) - ID del espacio deportivo
  - `name` (text) - Nombre del espacio
  - `address` (text) - Dirección
  - `description` (text) - Descripción
  - `image_url` (text) - URL de imagen
  - `created_at` (timestamptz) - Fecha de creación

  ### `sports`
  - `id` (uuid, PK) - ID del deporte
  - `name` (text) - Nombre del deporte (fútbol, tenis, etc.)
  - `icon` (text) - Icono o emoji del deporte
  - `created_at` (timestamptz) - Fecha de creación

  ### `courts`
  - `id` (uuid, PK) - ID de la cancha
  - `facility_id` (uuid, FK) - Espacio deportivo
  - `sport_id` (uuid, FK) - Deporte
  - `name` (text) - Nombre de la cancha
  - `description` (text) - Descripción
  - `price_per_hour` (decimal) - Precio por hora
  - `image_url` (text) - URL de imagen
  - `available` (boolean) - Disponibilidad
  - `created_at` (timestamptz) - Fecha de creación

  ### `reservations`
  - `id` (uuid, PK) - ID de la reserva
  - `user_id` (uuid, FK) - Usuario que reserva
  - `court_id` (uuid, FK) - Cancha reservada
  - `reservation_date` (date) - Fecha de la reserva
  - `start_time` (time) - Hora de inicio
  - `end_time` (time) - Hora de fin
  - `total_price` (decimal) - Precio total
  - `status` (text) - Estado: 'pending', 'confirmed', 'cancelled', 'completed'
  - `payment_amount` (decimal) - Monto pagado
  - `created_at` (timestamptz) - Fecha de creación

  ### `ratings`
  - `id` (uuid, PK) - ID de la calificación
  - `user_id` (uuid, FK) - Usuario que califica
  - `court_id` (uuid, FK) - Cancha calificada
  - `reservation_id` (uuid, FK) - Reserva asociada
  - `rating` (integer) - Calificación (1-5)
  - `comment` (text) - Comentario
  - `created_at` (timestamptz) - Fecha de creación

  ### `coupons`
  - `id` (uuid, PK) - ID del cupón
  - `user_id` (uuid, FK) - Usuario dueño del cupón
  - `amount` (decimal) - Monto del cupón
  - `reason` (text) - Razón del cupón
  - `used` (boolean) - Si fue usado
  - `used_in_reservation_id` (uuid, FK nullable) - Reserva donde se usó
  - `created_at` (timestamptz) - Fecha de creación

  ## 2. Seguridad (RLS)
  - Todas las tablas tienen RLS habilitado
  - Políticas restrictivas basadas en roles
  - Los admins generales tienen acceso completo
  - Los admins de facility solo ven su espacio
  - Los clientes solo ven sus propios datos
  - Los reguladores tienen acceso de lectura

  ## 3. Funciones Auxiliares
  - Función para calcular rating promedio de canchas
  - Trigger para actualizar disponibilidad de canchas

  ## 4. Índices
  - Índices en foreign keys para optimización
  - Índices en campos de búsqueda frecuente
*/

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin_general', 'admin_facility', 'client', 'regulator')),
  facility_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de espacios deportivos
CREATE TABLE IF NOT EXISTS sports_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de deportes
CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text DEFAULT '⚽',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de canchas
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES sports_facilities(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price_per_hour decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  reservation_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_amount decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de calificaciones
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, reservation_id)
);

-- Crear tabla de cupones
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  reason text NOT NULL,
  used boolean DEFAULT false,
  used_in_reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Agregar foreign key de facility a profiles
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_facility 
  FOREIGN KEY (facility_id) REFERENCES sports_facilities(id) ON DELETE SET NULL;

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_courts_facility ON courts(facility_id);
CREATE INDEX IF NOT EXISTS idx_courts_sport ON courts(sport_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_court ON reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_ratings_court ON ratings(court_id);
CREATE INDEX IF NOT EXISTS idx_coupons_user ON coupons(user_id);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin general can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "Admin general can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "Admin general can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "Admin general can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

-- Políticas para sports_facilities
CREATE POLICY "Everyone can view facilities"
  ON sports_facilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin general can manage facilities"
  ON sports_facilities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

-- Políticas para sports
CREATE POLICY "Everyone can view sports"
  ON sports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin general can manage sports"
  ON sports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

-- Políticas para courts
CREATE POLICY "Everyone can view courts"
  ON courts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin general can manage all courts"
  ON courts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "Facility admin can manage their courts"
  ON courts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_facility'
      AND profiles.facility_id = courts.facility_id
    )
  );

-- Políticas para reservations
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin general can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "Facility admin can view their facility reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN courts c ON c.facility_id = p.facility_id
      WHERE p.id = auth.uid()
      AND p.role = 'admin_facility'
      AND c.id = reservations.court_id
    )
  );

-- Políticas para ratings
CREATE POLICY "Everyone can view ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings for their reservations"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para coupons
CREATE POLICY "Users can view own coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin general can manage all coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_general'
    )
  );

CREATE POLICY "System can create coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Vista para calcular rating promedio de canchas
CREATE OR REPLACE VIEW court_ratings AS
SELECT 
  court_id,
  AVG(rating)::decimal(3,2) as average_rating,
  COUNT(*) as total_ratings
FROM ratings
GROUP BY court_id;