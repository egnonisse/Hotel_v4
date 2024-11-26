import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Plus, Hotel, Building2 } from 'lucide-react';
import CreateHotelModal from '../components/hotels/CreateHotelModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { profile } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', profile?.hotel_id],
    queryFn: async () => {
      if (!profile?.hotel_id) return null;
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', profile.hotel_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.hotel_id
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms-summary', profile?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', profile?.hotel_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.hotel_id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hotel && profile?.role !== 'guest') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Hotel className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Hotel Configured</h2>
        <p className="text-gray-600 mb-8">Get started by creating your first hotel</p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Hotel
        </button>

        <CreateHotelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hotel && (
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <Hotel className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{hotel.name}</h2>
                <p className="text-gray-600">{hotel.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Rooms</h3>
                  <p className="text-2xl font-bold text-indigo-600">{rooms?.length || 0}</p>
                </div>
              </div>
            </div>
            {/* Add more stats cards here */}
          </div>
        </>
      )}
    </div>
  );
}