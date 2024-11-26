export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  type: string;
  base_price: number;
  capacity: number;
  max_capacity: number;
  floor_number: number | null;
  room_number: string;
  size_sqm: number | null;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_order';
  description: string | null;
  photos: string[];
  smoking_allowed: boolean;
  pet_friendly: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomFeature {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: 'amenity' | 'furniture' | 'technology' | 'accessibility' | 'view';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomReservation {
  id: string;
  room_id: string;
  customer_id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  total_price: number;
  deposit_amount: number | null;
  guest_count: number;
  special_requests: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash';
  payment_phone: string;
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}