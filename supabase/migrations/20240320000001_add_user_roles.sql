-- Create role types
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'hotel_admin',
  'staff',
  'guest',
  'support'
);

-- Create profiles table with role information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'guest',
  hotel_id UUID REFERENCES hotels(id),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create staff_permissions table for granular access control
CREATE TABLE staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  can_manage_rooms BOOLEAN DEFAULT FALSE,
  can_manage_bookings BOOLEAN DEFAULT FALSE,
  can_view_reports BOOLEAN DEFAULT FALSE,
  can_manage_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Update RLS policies

-- Profiles: Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Hotels: Allow hotel admins to manage their hotels
CREATE POLICY "Hotel admins can manage their hotels"
  ON hotels
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.hotel_id = hotels.id
      AND profiles.role = 'hotel_admin'
    )
  );

-- Rooms: Allow hotel staff to manage rooms
CREATE POLICY "Staff can manage rooms"
  ON rooms
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN staff_permissions ON staff_permissions.profile_id = profiles.id
      WHERE profiles.id = auth.uid()
      AND profiles.hotel_id = rooms.hotel_id
      AND (profiles.role = 'hotel_admin' OR (profiles.role = 'staff' AND staff_permissions.can_manage_rooms))
    )
  );

-- Reservations: Allow staff to manage bookings
CREATE POLICY "Staff can manage reservations"
  ON room_reservations
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN staff_permissions ON staff_permissions.profile_id = profiles.id
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'hotel_admin' OR (profiles.role = 'staff' AND staff_permissions.can_manage_bookings))
    )
  );

-- Super admin has access to everything
CREATE POLICY "Super admins have full access"
  ON profiles
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_permissions_updated_at
  BEFORE UPDATE ON staff_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();