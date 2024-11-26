import React from 'react';
import { Room } from '../../types';
import { Pencil, Trash2, Users, DollarSign, Maximize, Tag } from 'lucide-react';
import PermissionGate from '../PermissionGate';

interface RoomCardProps {
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-red-100 text-red-800',
    cleaning: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-orange-100 text-orange-800',
    out_of_order: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-w-16 aspect-h-9 relative">
        {room.photos?.[0] ? (
          <img
            src={room.photos[0]}
            alt={room.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
            {room.status.replace('_', ' ').charAt(0).toUpperCase() + room.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{room.type}</p>
          </div>
          <PermissionGate permission="canManageRooms">
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                title="Edit room"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
                    onDelete();
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Delete room"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </PermissionGate>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Capacity: {room.capacity} - {room.max_capacity} guests</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>${room.base_price.toFixed(2)}/night</span>
          </div>
          {room.size_sqm && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Maximize className="w-4 h-4" />
              <span>{room.size_sqm} m²</span>
            </div>
          )}
        </div>

        {room.description && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{room.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {room.smoking_allowed && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded">
              Smoking Allowed
            </span>
          )}
          {room.pet_friendly && (
            <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded">
              Pet Friendly
            </span>
          )}
          <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
            Room {room.room_number}
          </span>
          {room.floor_number && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
              Floor {room.floor_number}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}