import { UserRole } from '../models/User';

export interface PermissionMatrix {
  canAccessAdminPanel: boolean;
  canViewAllChats: boolean;
  canModerateChats: boolean;
  canInterveneInChat: boolean;
  canManageUsers: boolean;
  canManageSubscriptions: boolean;
  canListKits: boolean;
  canBuyKits: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  admin: {
    canAccessAdminPanel: true,
    canViewAllChats: true,
    canModerateChats: true,
    canInterveneInChat: true,
    canManageUsers: true,
    canManageSubscriptions: true,
    canListKits: true,
    canBuyKits: true,
  },
  operator: {
    canAccessAdminPanel: false,
    canViewAllChats: true, // Operators can see any buyer-seller chat
    canModerateChats: true,
    canInterveneInChat: true,
    canManageUsers: false,
    canManageSubscriptions: false,
    canListKits: false,
    canBuyKits: true,
  },
  user: {
    canAccessAdminPanel: false,
    canViewAllChats: false, // Users can only view their own conversations
    canModerateChats: false,
    canInterveneInChat: false,
    canManageUsers: false,
    canManageSubscriptions: false,
    canListKits: true,
    canBuyKits: true,
  },
};

export function hasPermission(role: UserRole, permission: keyof PermissionMatrix): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] || false;
}
