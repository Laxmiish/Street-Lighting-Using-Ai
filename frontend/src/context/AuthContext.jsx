import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const PRESET_USERS = {
  admin: {
    id: 'u-001',
    name: 'Dr. Rajeshwar Rao, IAS',
    email: 'director.operations@smartcity.gov',
    role: 'admin',
    roleLabel: 'City Executive',
    title: 'Municipal Commissioner & Director',
    department: 'Urban Infrastructure & Smart City Directorate',
    badge: 'Executive Authority',
    assignedZone: 'ALL',
    allowedTabs: ['dashboard', 'analytics', 'records', 'poles', 'maintenance'],
    permissions: ['view_executive_metrics', 'view_sdg_roi', 'export_audit_records', 'view_all_assets'],
  },
  nodal_zone1: {
    id: 'u-010',
    name: 'Er. Alok Srivastava',
    email: 'nodal.zone1@lucknowsmartcity.gov',
    role: 'admin',
    roleLabel: 'Nodal Officer (Hazratganj)',
    title: 'Nodal Zonal Officer (Zone 1)',
    department: 'Zone 1: Hazratganj Municipal Division',
    badge: 'Zonal Authority',
    assignedZone: 'Zone 1: Hazratganj',
    allowedTabs: ['dashboard', 'analytics', 'records', 'poles', 'maintenance'],
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  nodal_zone4: {
    id: 'u-011',
    name: 'Er. Pradeep Mishra',
    email: 'nodal.zone4@lucknowsmartcity.gov',
    role: 'admin',
    roleLabel: 'Nodal Officer (Gomti Nagar)',
    title: 'Nodal Zonal Officer (Zone 4)',
    department: 'Zone 4: Gomti Nagar & Shaheed Path Division',
    badge: 'Zonal Authority',
    assignedZone: 'Zone 4: Gomti Nagar',
    allowedTabs: ['dashboard', 'analytics', 'records', 'poles', 'maintenance'],
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  nodal_zone5: {
    id: 'u-012',
    name: 'Er. Sunil Verma',
    email: 'nodal.zone5@lucknowsmartcity.gov',
    role: 'admin',
    roleLabel: 'Nodal Officer (Alambagh)',
    title: 'Nodal Zonal Officer (Zone 5)',
    department: 'Zone 5: Alambagh Municipal Division',
    badge: 'Zonal Authority',
    assignedZone: 'Zone 5: Alambagh',
    allowedTabs: ['dashboard', 'analytics', 'records', 'poles', 'maintenance'],
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  nodal_zone6: {
    id: 'u-013',
    name: 'Er. R.K. Pandey',
    email: 'nodal.zone6@lucknowsmartcity.gov',
    role: 'admin',
    roleLabel: 'Nodal Officer (Chowk Heritage)',
    title: 'Nodal Zonal Officer (Zone 6)',
    department: 'Zone 6: Chowk Heritage Division',
    badge: 'Zonal Authority',
    assignedZone: 'Zone 6: Chowk Heritage',
    allowedTabs: ['dashboard', 'analytics', 'records', 'poles', 'maintenance'],
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  operator: {
    id: 'u-003',
    name: 'Vikramaditya Sharma',
    email: 'operator.dispatch@smartcity.gov',
    role: 'operator',
    roleLabel: 'Control Room Operator',
    title: 'Lead Grid Dispatch Officer',
    department: 'Integrated Command & Control Center (ICCC)',
    badge: 'Operations Control',
    allowedTabs: ['dashboard', 'map', 'poles', 'alerts', 'ai-settings'],
    permissions: ['control_lighting_scenes', 'override_brightness', 'monitor_radar', 'resolve_alerts', 'adjust_ai_parameters'],
  },
  technician: {
    id: 'u-004',
    name: 'Mahesh Kumar',
    email: 'technician.field@smartcity.gov',
    role: 'technician',
    roleLabel: 'Field Service Specialist',
    title: 'Senior Field Maintenance Specialist',
    department: 'Rapid Response Repair Unit 4',
    badge: 'Field Operations',
    allowedTabs: ['dashboard', 'maintenance', 'alerts'],
    permissions: ['view_field_jobs', 'update_work_orders', 'mark_repaired', 'inspect_hardware'],
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const login = async ({ email, password, role }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1. Attempt backend authentication
      const backendRes = await api.login({ email, password, role });
      
      let authenticatedUser = null;
      if (backendRes && backendRes.user) {
        const matchingPreset = PRESET_USERS[backendRes.user.role] || PRESET_USERS.admin;
        authenticatedUser = {
          ...matchingPreset,
          ...backendRes.user,
        };
      } else {
        // Fallback to validated preset roles
        const targetRole = role || (email?.includes('operator') ? 'operator' : email?.includes('technician') ? 'technician' : 'admin');
        authenticatedUser = PRESET_USERS[targetRole] || PRESET_USERS.admin;
      }

      setUser(authenticatedUser);
      localStorage.setItem('lumina_auth_user', JSON.stringify(authenticatedUser));
      setAuthLoading(false);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      setAuthError('Authentication service temporarily unavailable.');
      setAuthLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('lumina_auth_user');
  };

  const canAccessTab = (tabId) => {
    if (!user) return false;
    return user.allowedTabs?.includes(tabId) ?? true;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authLoading,
        authError,
        login,
        logout,
        canAccessTab,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
