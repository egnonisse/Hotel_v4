import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  description: z.string().optional(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface CreateHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateHotelModal({ isOpen, onClose }: CreateHotelModalProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema)
  });

  const createHotel = useMutation({
    mutationFn: async (data: HotelFormData) => {
      // Create hotel
      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .insert([data])
        .select()
        .single();

      if (hotelError) throw hotelError;

      // Update user profile with hotel_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ hotel_id: hotel.id })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      return hotel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel'] });
      toast.success('Hotel created successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error creating hotel:', error);
      toast.error('Failed to create hotel');
    }
  });

  const onSubmit = (data: HotelFormData) => {
    createHotel.mutate(data);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Create New Hotel
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="input mt-1"
                placeholder="Grand Hotel"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                className="input mt-1"
                rows={3}
                placeholder="A luxury hotel in the heart of the city..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={createHotel.isLoading}
              >
                {createHotel.isLoading ? 'Creating...' : 'Create Hotel'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}