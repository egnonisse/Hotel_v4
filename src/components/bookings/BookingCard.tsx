import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, CreditCard, MoreVertical } from 'lucide-react';
import { Menu } from '@headlessui/react';

interface BookingCardProps {
  booking: any;
  onStatusUpdate: (status: string) => void;
}

export default function BookingCard({ booking, onStatusUpdate }: BookingCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    checked_in: 'bg-blue-100 text-blue-800',
    checked_out: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800'
  };

  const availableStatusTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'cancelled', 'no_show'],
    checked_in: ['checked_out'],
    checked_out: [],
    cancelled: [],
    no_show: []
  };

  return (
    <div className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{booking.customer?.name}</h3>
            <p className="text-sm text-gray-600">{booking.room?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {booking.guest_count} guests
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              ${booking.total_price}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[booking.status as keyof typeof statusColors]
          }`}>
            {booking.status.replace('_', ' ').charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>

          <Menu as="div" className="relative">
            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              {availableStatusTransitions[booking.status as keyof typeof availableStatusTransitions]
                .map((status) => (
                  <Menu.Item key={status}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } w-full text-left px-4 py-2 text-sm text-gray-700`}
                        onClick={() => onStatusUpdate(status)}
                      >
                        Mark as {status.replace('_', ' ')}
                      </button>
                    )}
                  </Menu.Item>
                ))}
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {booking.special_requests && (
        <div className="mt-4 text-sm text-gray-600">
          <strong className="font-medium">Special Requests:</strong> {booking.special_requests}
        </div>
      )}
    </div>
  );
}