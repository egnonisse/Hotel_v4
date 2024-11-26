import React from 'react';
import { useAuth } from '../lib/auth';
import { usePermissions } from '../hooks/usePermissions';
import { User, Hotel, Bell, Shield, CreditCard } from 'lucide-react';

export default function Settings() {
  const { profile } = useAuth();
  const permissions = usePermissions();

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Manage your account details and preferences',
      show: true,
    },
    {
      id: 'hotel',
      title: 'Hotel Settings',
      icon: Hotel,
      description: 'Configure your hotel details and policies',
      show: permissions.isHotelAdmin || permissions.isSuperAdmin,
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      icon: Bell,
      description: 'Customize your notification settings',
      show: true,
    },
    {
      id: 'permissions',
      title: 'Role & Permissions',
      icon: Shield,
      description: 'Manage user roles and access rights',
      show: permissions.isHotelAdmin || permissions.isSuperAdmin,
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      icon: CreditCard,
      description: 'Manage your subscription and payment details',
      show: permissions.isHotelAdmin || permissions.isSuperAdmin,
    },
  ].filter(section => section.show);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {sections.map(({ id, title, icon: Icon, description }) => (
          <div
            key={id}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-gray-600 mt-1">{description}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Logged in as: <span className="font-medium">{profile?.full_name}</span>
          <br />
          Role: <span className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );
}