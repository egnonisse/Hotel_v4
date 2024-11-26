import React from 'react';
import { Users, Bed, TrendingUp, DollarSign } from 'lucide-react';

const stats = [
  {
    label: 'Total Bookings',
    value: '156',
    change: '+12.5%',
    icon: Users,
    trend: 'up'
  },
  {
    label: 'Room Occupancy',
    value: '85%',
    change: '+5.2%',
    icon: Bed,
    trend: 'up'
  },
  {
    label: 'Average Daily Rate',
    value: '$245',
    change: '+8.1%',
    icon: TrendingUp,
    trend: 'up'
  },
  {
    label: 'Revenue',
    value: '$38.2K',
    change: '+22.5%',
    icon: DollarSign,
    trend: 'up'
  }
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}