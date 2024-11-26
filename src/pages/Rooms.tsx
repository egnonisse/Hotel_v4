import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Room } from '../types';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import RoomCard from '../components/rooms/RoomCard';
import RoomForm from '../components/rooms/RoomForm';
import { useAuth } from '../lib/auth';

export default function Rooms() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [isAddingRoom, setIsAddingRoom] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<Room['status'] | 'all'>('all');

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms', profile?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', profile?.hotel_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Room[];
    },
    enabled: !!profile?.hotel_id
  });

  const createRoom = useMutation({
    mutationFn: async (newRoom: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{ ...newRoom, hotel_id: profile?.hotel_id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsAddingRoom(false);
      toast.success('Room created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create room');
      console.error(error);
    }
  });

  const updateRoom = useMutation({
    mutationFn: async (room: Room) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(room)
        .eq('id', room.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setEditingRoom(null);
      toast.success('Room updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update room');
      console.error(error);
    }
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete room');
      console.error(error);
    }
  });

  if (!profile?.hotel_id) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Please create or select a hotel first.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <button
          onClick={() => setIsAddingRoom(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Room['status'] | 'all')}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="out_of_order">Out of Order</option>
          </select>
        </div>
      </div>

      {isAddingRoom && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Room</h2>
              <button
                onClick={() => setIsAddingRoom(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <RoomForm onSubmit={(data) => createRoom.mutate(data)} />
          </div>
        </div>
      )}

      {editingRoom && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Room</h2>
              <button
                onClick={() => setEditingRoom(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <RoomForm
              initialData={editingRoom}
              onSubmit={(data) => updateRoom.mutate({ ...data, id: editingRoom.id })}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onEdit={() => setEditingRoom(room)}
            onDelete={() => deleteRoom.mutate(room.id)}
          />
        ))}
      </div>

      {rooms?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No rooms found. Add your first room to get started.</p>
        </div>
      )}
    </div>
  );
}