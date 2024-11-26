import { useAuth } from '../lib/auth';

export function usePermissions() {
  const { profile, permissions } = useAuth();

  const isSuperAdmin = profile?.role === 'super_admin';
  const isHotelAdmin = profile?.role === 'hotel_admin';
  const isStaff = profile?.role === 'staff';
  const isGuest = profile?.role === 'guest';
  const isSupport = profile?.role === 'support';

  // Super admin has all permissions by default
  if (isSuperAdmin) {
    return {
      isSuperAdmin: true,
      isHotelAdmin: true,
      isStaff: true,
      isGuest: false,
      isSupport: false,
      canManageRooms: true,
      canManageBookings: true,
      canViewReports: true,
      canManageStaff: true,
    };
  }

  return {
    isSuperAdmin,
    isHotelAdmin,
    isStaff,
    isGuest,
    isSupport,
    canManageRooms: isHotelAdmin || (isStaff && permissions?.can_manage_rooms),
    canManageBookings: isHotelAdmin || (isStaff && permissions?.can_manage_bookings),
    canViewReports: isHotelAdmin || (isStaff && permissions?.can_view_reports),
    canManageStaff: isHotelAdmin || (isStaff && permissions?.can_manage_staff),
  };
}