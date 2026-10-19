import React from 'react';
import { useLighting } from '../context/LightingContext';
import AdminDashboard from '../components/roles/AdminDashboard';
import OperatorDashboard from '../components/roles/OperatorDashboard';
import TechnicianDashboard from '../components/roles/TechnicianDashboard';

/**
 * LuminaAI — Role-Adaptive Operations Dashboard
 * Dynamically renders non-technical, role-tailored operational surfaces:
 * 1. 'admin': City Executive (Commissioner) — Financial savings, % energy conserved, CO2 offset, precinct health
 * 2. 'operator': Control Room Operator — One-touch lighting scenes, live corridor map, concise incident ticker
 * 3. 'technician': Field Service Staff — Clear task cards, required parts, 1-tap "Mark Repaired" button
 */
export default function Dashboard() {
  const { currentRole } = useLighting();

  if (currentRole === 'technician') {
    return <TechnicianDashboard />;
  }

  if (currentRole === 'operator') {
    return <OperatorDashboard />;
  }

  // Default is 'admin' (City Executive / Municipal Commissioner)
  return <AdminDashboard />;
}
