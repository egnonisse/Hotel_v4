import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Room, RoomReservation } from '../../types';
import { format } from 'date-fns';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';

interface BookingCalendarProps {
  onDateSelect?: (start: Date, end: Date, room: Room) => void;
}

export default function BookingCalendar({ onDateSelect }: BookingCalendarProps) {
  const { profile } = useAuth();
  const [selectedRoom, setSelectedRoom] = React.useState<string>('all');

  const { data: rooms } = useQuery({
    queryKey: ['rooms', profile?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', profile?.hotel_id);
      
      if (error) throw error;
      return data as Room[];
    },
    enabled: !!profile?.hotel_id
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings', profile?.hotel_id, selectedRoom],
    queryFn: async () => {
      let query = supabase
        .from('room_reservations')
        .select(`
          *,
          room:rooms(*),
          customer:customers(*)
        `)
        .eq('room.hotel_id', profile?.hotel_id);

      if (selectedRoom !== 'all') {
        query = query.eq('room_id', selectedRoom);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (RoomReservation & { room: Room })[];
    },
    enabled: !!profile?.hotel_id
  });

  const events = React.useMemo(() => {
    if (!bookings) return [];
    
    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.room.name} - ${booking.customer?.name}`,
      start: booking.check_in_date,
      end: booking.check_out_date,
      backgroundColor: getStatusColor(booking.status),
      extendedProps: {
        room: booking.room,
        booking
      }
    }));
  }, [bookings]);

  const handleDateSelect = async (selectInfo: any) => {
    if (!selectedRoom || selectedRoom === 'all') {
      toast.error('Please select a specific room first');
      return;
    }

    const room = rooms?.find(r => r.id === selectedRoom);
    if (!room) return;

    // Check availability
    const { data: existingBookings } = await supabase
      .from('room_reservations')
      .select('*')
      .eq('room_id', selectedRoom)
      .overlaps('check_in_date', selectInfo.startStr, selectInfo.endStr)
      .not('status', 'eq', 'cancelled');

    if (existingBookings && existingBookings.length > 0) {
      toast.error('This room is not available for the selected dates');
      return;
    }

    onDateSelect?.(selectInfo.start, selectInfo.end, room);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          className="input"
        >
          <option value="all">All Rooms</option>
          {rooms?.map(room => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.room_number})
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventContent={renderEventContent}
          height="auto"
        />
      </div>
    </div>
  );
}

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  checked_in: 'bg-blue-500',
  checked_out: 'bg-gray-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500'
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return '#EAB308';
    case 'confirmed': return '#22C55E';
    case 'checked_in': return '#3B82F6';
    case 'checked_out': return '#6B7280';
    case 'cancelled': return '#EF4444';
    case 'no_show': return '#F97316';
    default: return '#6B7280';
  }
}

function renderEventContent(eventInfo: any) {
  return (
    <div className="p-1 text-xs">
      <div className="font-semibold truncate">{eventInfo.event.extendedProps.room.name}</div>
      <div className="truncate">{eventInfo.event.extendedProps.booking.customer?.name}</div>
    </div>
  );
}