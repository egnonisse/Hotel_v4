import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, User, CreditCard, Plus, Filter, Search, CalendarRange } from 'lucide-react';
import { format } from 'date-fns';
import BookingForm from '../components/bookings/BookingForm';
import BookingCard from '../components/bookings/BookingCard';
import BookingCalendar from '../components/bookings/BookingCalendar';
import { useAuth } from '../lib/auth';
import { Room } from '../types';
import toast from 'react-hot-toast';

export default function Bookings() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [isAddingBooking, setIsAddingBooking] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list');
  const [selectedDates, setSelectedDates] = React.useState<{
    start: Date | null;
    end: Date | null;
    room: Room | null;
  }>({ start: null, end: null, room: null });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', profile?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_reservations')
        .select(`
          *,
          room:rooms(*),
          customer:customers(*)
        `)
        .eq('room.hotel_id', profile?.hotel_id)
        .order('check_in_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.hotel_id
  });

  const { data: rooms } = useQuery({
    queryKey: ['available-rooms', profile?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', profile?.hotel_id)
        .eq('status', 'available');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.hotel_id
  });

  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      // First, create or update customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert([
          {
            email: bookingData.customer.email,
            name: bookingData.customer.name,
            phone: bookingData.customer.phone
          }
        ])
        .select()
        .single();

      if (customerError) throw customerError;

      // Then create the reservation
      const { data: reservation, error: reservationError } = await supabase
        .from('room_reservations')
        .insert([
          {
            room_id: bookingData.room_id,
            customer_id: customer.id,
            check_in_date: bookingData.check_in_date,
            check_out_date: bookingData.check_out_date,
            guest_count: bookingData.guest_count,
            total_price: bookingData.total_price,
            special_requests: bookingData.special_requests,
            status: 'confirmed',
            payment_method: bookingData.payment_method,
            payment_phone: bookingData.payment_phone
          }
        ])
        .select()
        .single();

      if (reservationError) throw reservationError;

      return reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setIsAddingBooking(false);
      setSelectedDates({ start: null, end: null, room: null });
      toast.success('Booking created successfully');
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast.error('Failed to create booking');
    }
  });

  const handleDateSelect = (start: Date, end: Date, room: Room) => {
    setSelectedDates({ start, end, room });
    setIsAddingBooking(true);
  };

  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    return bookings.filter(booking => {
      const matchesSearch = 
        searchTerm === '' ||
        booking.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  if (!profile?.hotel_id) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No hotel selected. Please contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded ${
                viewMode === 'calendar'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <CalendarRange className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsAddingBooking(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {isAddingBooking && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">New Booking</h2>
              <button
                onClick={() => {
                  setIsAddingBooking(false);
                  setSelectedDates({ start: null, end: null, room: null });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <BookingForm 
              rooms={rooms || []}
              onSubmit={createBooking.mutate}
              initialDates={selectedDates}
            />
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <BookingCalendar onDateSelect={handleDateSelect} />
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            {isLoading ? (
              <div className="animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking: any) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={(status) => {
                    // Handle status update
                  }}
                />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No bookings match your search criteria'
                  : 'No bookings found'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}