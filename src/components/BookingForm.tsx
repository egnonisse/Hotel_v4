import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Room } from '../types';
import { Calendar, Users, Mail, User } from 'lucide-react';

const bookingSchema = z.object({
  room_id: z.string().uuid('Please select a room'),
  check_in_date: z.date().min(new Date(), 'Check-in date must be in the future'),
  check_out_date: z.date(),
  guest_count: z.number().min(1, 'At least one guest is required'),
  customer: z.object({
    name: z.string().min(1, 'Guest name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
  }),
  special_requests: z.string().optional(),
}).refine((data) => data.check_out_date > data.check_in_date, {
  message: "Check-out date must be after check-in date",
  path: ["check_out_date"]
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  rooms: Room[];
  onSubmit: (data: BookingFormData) => void;
}

export default function BookingForm({ rooms, onSubmit }: BookingFormProps) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  });

  const selectedRoomId = watch('room_id');
  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Room</label>
        <select {...register('room_id')} className="input mt-1">
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} - ${room.base_price}/night
            </option>
          ))}
        </select>
        {errors.room_id && (
          <p className="mt-1 text-sm text-red-600">{errors.room_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
          <div className="mt-1 relative">
            <Controller
              control={control}
              name="check_in_date"
              render={({ field }) => (
                <div className="relative">
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="input pl-10"
                    minDate={new Date()}
                    placeholderText="Select date"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              )}
            />
          </div>
          {errors.check_in_date && (
            <p className="mt-1 text-sm text-red-600">{errors.check_in_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
          <div className="mt-1 relative">
            <Controller
              control={control}
              name="check_out_date"
              render={({ field }) => (
                <div className="relative">
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="input pl-10"
                    minDate={new Date()}
                    placeholderText="Select date"
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              )}
            />
          </div>
          {errors.check_out_date && (
            <p className="mt-1 text-sm text-red-600">{errors.check_out_date.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
        <div className="mt-1 relative">
          <input
            type="number"
            {...register('guest_count', { valueAsNumber: true })}
            className="input pl-10"
            min={1}
            max={selectedRoom?.max_capacity}
          />
          <Users className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        {errors.guest_count && (
          <p className="mt-1 text-sm text-red-600">{errors.guest_count.message}</p>
        )}
        {selectedRoom && (
          <p className="mt-1 text-sm text-gray-500">
            Maximum capacity: {selectedRoom.max_capacity} guests
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Guest Name</label>
          <div className="mt-1 relative">
            <input
              type="text"
              {...register('customer.name')}
              className="input pl-10"
              placeholder="John Doe"
            />
            <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.customer?.name && (
            <p className="mt-1 text-sm text-red-600">{errors.customer.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative">
            <input
              type="email"
              {...register('customer.email')}
              className="input pl-10"
              placeholder="john@example.com"
            />
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.customer?.email && (
            <p className="mt-1 text-sm text-red-600">{errors.customer.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Special Requests</label>
        <textarea
          {...register('special_requests')}
          className="input mt-1"
          rows={3}
          placeholder="Any special requests or requirements..."
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Create Booking
      </button>
    </form>
  );
}