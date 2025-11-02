import { prisma } from './prisma';

export interface UserPermissions {
  isOwner: boolean;
  role: 'owner' | 'manager' | 'staff';
  canManageBookings: boolean;
  canManageClients: boolean;
  canManageServices: boolean;
  canManageAnalytics: boolean;
  canManageTeam: boolean;
  canManageBilling: boolean;
  canManageLocations: boolean;
  locationId?: string | null;
}

/**
 * Get user permissions based on their role and team membership
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  // Check if user is an owner (has their own business)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      locationId: true,
    },
  });

  // Check if user is a team member
  const teamMembership = await prisma.teamMember.findFirst({
    where: {
      memberId: userId,
      status: 'active',
    },
    select: {
      role: true,
      permissions: true,
      ownerId: true,
    },
  });

  // If user is not a team member, they are an owner
  if (!teamMembership) {
    return {
      isOwner: true,
      role: 'owner',
      canManageBookings: true,
      canManageClients: true,
      canManageServices: true,
      canManageAnalytics: true,
      canManageTeam: true,
      canManageBilling: true,
      canManageLocations: true,
      locationId: user?.locationId,
    };
  }

  // User is a team member - get their permissions
  const permissions = teamMembership.permissions as any;

  return {
    isOwner: false,
    role: teamMembership.role as 'manager' | 'staff',
    canManageBookings: permissions?.manageBookings ?? true,
    canManageClients: permissions?.manageClients ?? true,
    canManageServices: permissions?.manageServices ?? false,
    canManageAnalytics: permissions?.manageAnalytics ?? false,
    canManageTeam: teamMembership.role === 'manager',
    canManageBilling: false,
    canManageLocations: false,
    locationId: user?.locationId,
  };
}

/**
 * Check if user has permission to access a specific page
 */
export async function canAccessPage(userId: string, page: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);

  const pagePermissions: Record<string, boolean> = {
    '/dashboard': true, // Everyone can access dashboard
    '/dashboard/bookings': permissions.canManageBookings,
    '/dashboard/bookings/new': permissions.canManageBookings,
    '/dashboard/bookings/calendar': permissions.canManageBookings,
    '/dashboard/clients': permissions.canManageClients,
    '/dashboard/services': permissions.canManageServices,
    '/dashboard/analytics': permissions.canManageAnalytics,
    '/dashboard/team': permissions.canManageTeam,
    '/dashboard/billing': permissions.canManageBilling,
    '/dashboard/settings': permissions.isOwner,
    '/dashboard/locations': permissions.canManageLocations,
    '/dashboard/loyalty': permissions.isOwner,
    '/dashboard/payouts': permissions.isOwner,
  };

  return pagePermissions[page] ?? false;
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigation(permissions: UserPermissions) {
  const allNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', show: true },
    { name: 'Bookings', href: '/dashboard/bookings', icon: 'Calendar', show: permissions.canManageBookings },
    { name: 'Clients', href: '/dashboard/clients', icon: 'Users', show: permissions.canManageClients },
    { name: 'Services', href: '/dashboard/services', icon: 'Sparkles', show: permissions.canManageServices },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'TrendingUp', show: permissions.canManageAnalytics },
    { name: 'Team', href: '/dashboard/team', icon: 'Users', show: permissions.canManageTeam },
    { name: 'Locations', href: '/dashboard/locations', icon: 'MapPin', show: permissions.canManageLocations },
    { name: 'Loyalty', href: '/dashboard/loyalty', icon: 'Award', show: permissions.isOwner },
    { name: 'Billing', href: '/dashboard/billing', icon: 'CreditCard', show: permissions.canManageBilling },
    { name: 'Payouts', href: '/dashboard/payouts', icon: 'DollarSign', show: permissions.isOwner },
    { name: 'Settings', href: '/dashboard/settings', icon: 'Settings', show: permissions.isOwner },
  ];

  return allNavItems.filter(item => item.show);
}
