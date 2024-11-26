import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    // Create demo hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .insert([
        {
          name: 'Grand Hotel Demo',
          description: 'A luxury hotel in the heart of the city'
        }
      ])
      .select()
      .single();

    if (hotelError) throw hotelError;

    // Create room features
    const features = [
      { name: 'Wi-Fi', category: 'technology', icon: 'wifi' },
      { name: 'Air Conditioning', category: 'amenity', icon: 'wind' },
      { name: 'Ocean View', category: 'view', icon: 'waves' },
      { name: 'King Bed', category: 'furniture', icon: 'bed' },
      { name: 'Wheelchair Access', category: 'accessibility', icon: 'wheelchair' }
    ];

    const { error: featuresError } = await supabase
      .from('room_features')
      .insert(features);

    if (featuresError) throw featuresError;

    // Create rooms
    const rooms = [
      {
        hotel_id: hotel.id,
        name: 'Deluxe Ocean View',
        type: 'deluxe',
        base_price: 299.99,
        capacity: 2,
        max_capacity: 3,
        floor_number: 4,
        room_number: '401',
        size_sqm: 45,
        description: 'Spacious room with stunning ocean views',
        smoking_allowed: false,
        pet_friendly: false,
        status: 'available'
      },
      {
        hotel_id: hotel.id,
        name: 'Executive Suite',
        type: 'suite',
        base_price: 499.99,
        capacity: 2,
        max_capacity: 4,
        floor_number: 5,
        room_number: '501',
        size_sqm: 65,
        description: 'Luxury suite with separate living area',
        smoking_allowed: false,
        pet_friendly: true,
        status: 'available'
      },
      {
        hotel_id: hotel.id,
        name: 'Standard Twin',
        type: 'standard',
        base_price: 199.99,
        capacity: 2,
        max_capacity: 2,
        floor_number: 2,
        room_number: '201',
        size_sqm: 30,
        description: 'Comfortable room with twin beds',
        smoking_allowed: false,
        pet_friendly: false,
        status: 'available'
      }
    ];

    const { error: roomsError } = await supabase
      .from('rooms')
      .insert(rooms);

    if (roomsError) throw roomsError;

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();