import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Room } from '../types';
import { Bed, Users, DollarSign, Hash } from 'lucide-react';

const roomSchema = z.object({
  hotel_id: z.string().uuid(),
  name: z.string().min(1, 'Room name is required'),
  type: z.string().min(1, 'Room type is required'),
  base_price: z.number().min(0, 'Price must be positive'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  max_capacity: z.number().min(1, 'Maximum capacity must be at least 1'),
  floor_number: z.number().nullable(),
  room_number: z.string().min(1, 'Room number is required'),
  size_sqm: z.number().nullable(),
  description: z.string().nullable(),
  photos: z.array(z.string().url()).default([]),
  smoking_allowed: z.boolean().default(false),
  pet_friendly: z.boolean().default(false),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomFormProps {
  onSubmit: (data: RoomFormData) => void;
  initialData?: Partial<Room>;
  hotelId: string;
}

export default function RoomForm({ onSubmit, initialData, hotelId }: RoomFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      ...initialData,
      hotel_id: hotelId,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register('hotel_id')} value={hotelId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Room Name</label>
          <div className="mt-1 relative">
            <input
              type="text"
              {...register('name')}
              className="input pl-10"
              placeholder="Deluxe Ocean View"
            />
            <Bed className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Room Type</label>
          <select {...register('type')} className="input mt-1">
            <option value="">Select type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="executive">Executive</option>
            <option value="penthouse">Penthouse</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Base Price per Night</label>
          <div className="mt-1 relative">
            <input
              type="number"
              step="0.01"
              {...register('base_price', { valueAsNumber: true })}
              className="input pl-10"
              placeholder="199.99"
            />
            <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.base_price && (
            <p className="mt-1 text-sm text-red-600">{errors.base_price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Room Number</label>
          <div className="mt-1 relative">
            <input
              type="text"
              {...register('room_number')}
              className="input pl-10"
              placeholder="101"
            />
            <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.room_number && (
            <p className="mt-1 text-sm text-red-600">{errors.room_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Capacity</label>
          <div className="mt-1 relative">
            <input
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className="input pl-10"
              placeholder="2"
            />
            <Users className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Capacity</label>
          <div className="mt-1 relative">
            <input
              type="number"
              {...register('max_capacity', { valueAsNumber: true })}
              className="input pl-10"
              placeholder="4"
            />
            <Users className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          {errors.max_capacity && (
            <p className="mt-1 text-sm text-red-600">{errors.max_capacity.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          className="input mt-1"
          rows={3}
          placeholder="Spacious room with ocean view..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('smoking_allowed')}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">Smoking Allowed</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('pet_friendly')}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">Pet Friendly</span>
        </label>
      </div>

      <button type="submit" className="btn-primary w-full">
        {initialData ? 'Update Room' : 'Create Room'}
      </button>
    </form>
  );
}