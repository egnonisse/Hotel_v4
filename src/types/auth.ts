import { User } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'hotel_admin' | 'staff' | 'guest' | 'support';

export interface Profile {
  id: string;
  role: UserRole;
  hotel_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffPermissions {
  id: string;
  profile_id: string;
  can_manage_rooms: boolean;
  can_manage_bookings: boolean;
  can_view_reports: boolean;
  can_manage_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  permissions: StaffPermissions | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}