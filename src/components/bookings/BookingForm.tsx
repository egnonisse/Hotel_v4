import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Room } from '../../types';
import { Calendar, Users, Mail, User, Phone, CreditCard } from 'lucide-react';
import { differenceInDays } from 'date-fns';

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const bookingSchema = z.object({
  room_id: z.string().uuid('Please select a room'),
  check_in_date: z.date().min(new Date(), 'Check-in date must be in the future'),
  check_out_date: z.date(),
  guest_count: z.number().min(1, 'At least one guest is required'),
  customer: z.object({
    name: z.string().min(1, 'Guest name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
  }),
  special_requests: z.string().optional(),
  payment_method: z.enum(['mobile_money', 'bank_transfer', 'cash']),
  payment_phone: z.string().regex(phoneRegex, 'Invalid phone number format'),
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
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      payment_method: 'mobile_money',
    }
  });

  const selectedRoomId = watch('room_id');
  const checkInDate = watch('check_in_date');
  const checkOutDate = watch('check_out_date');
  const selectedRoom = rooms.find(room => room.id === selectedRoomId);

  React.useEffect(() => {
    if (selectedRoom && checkInDate && checkOutDate) {
      const nights = differenceInDays(checkOutDate, checkInDate);
      if (nights > 0) {
        const total = nights * selectedRoom.base_price;
        setValue('total_price', total);
      }
    }
  }, [selectedRoom, checkInDate, checkOutDate, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
          <div className="mt-1">
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
          <div className="mt-1">
            <Controller
              control={control}
              name="check_out_date"
              render={({ field }) => (
                <div className="relative">
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="input pl-10"
                    minDate={checkInDate || new Date()}
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="mt-1 relative">
            <input
              type="tel"
              {...register('customer.phone')}
              className="input pl-10"
              placeholder="+1234567890"
            />
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.customer?.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.customer.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select {...register('payment_method')} className="input mt-1">
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Phone Number</label>
          <div className="mt-1 relative">
            <input
              type="tel"
              {...register('payment_phone')}
              className="input pl-10"
              placeholder="+1234567890"
            />
            <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.payment_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_phone.message}</p>
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

      {selectedRoom && checkInDate && checkOutDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900">Booking Summary</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>Room: {selectedRoom.name}</p>
            <p>Price per night: ${selectedRoom.base_price}</p>
            <p>Number of nights: {differenceInDays(checkOutDate, checkInDate)}</p>
            <p className="text-lg font-medium text-gray-900 mt-2">
              Total: ${(differenceInDays(checkOutDate, checkInDate) * selectedRoom.base_price).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary w-full">
        Create Booking
      </button>
    </form>
  );
}