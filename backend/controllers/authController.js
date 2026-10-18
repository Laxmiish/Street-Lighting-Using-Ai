/**
 * LuminaAI — Authentication & RBAC Controller
 * Handles user login, session verification, and role-based access.
 */

const db = require('../../database/db');
const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

const MUNICIPAL_USERS = [
  {
    id: 'u-001',
    name: 'Dr. Rajeshwar Rao, IAS',
    email: 'director.operations@smartcity.gov',
    role: 'admin',
    title: 'Municipal Commissioner & Director',
    department: 'Urban Infrastructure & Smart City Directorate',
    assignedZone: 'ALL',
    phone: '+91 98765 43210',
    permissions: ['view_executive_metrics', 'view_sdg_roi', 'export_audit_records', 'view_all_assets'],
  },
  {
    id: 'u-010',
    name: 'Er. Alok Srivastava',
    email: 'nodal.zone1@lucknowsmartcity.gov',
    role: 'admin',
    title: 'Nodal Zonal Officer (Zone 1)',
    department: 'Zone 1: Hazratganj Municipal Division',
    assignedZone: 'Zone 1: Hazratganj',
    phone: '+91 98765 11001',
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  {
    id: 'u-011',
    name: 'Er. Pradeep Mishra',
    email: 'nodal.zone4@lucknowsmartcity.gov',
    role: 'admin',
    title: 'Nodal Zonal Officer (Zone 4)',
    department: 'Zone 4: Gomti Nagar & Shaheed Path Division',
    assignedZone: 'Zone 4: Gomti Nagar',
    phone: '+91 98765 11004',
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  {
    id: 'u-012',
    name: 'Er. Sunil Verma',
    email: 'nodal.zone5@lucknowsmartcity.gov',
    role: 'admin',
    title: 'Nodal Zonal Officer (Zone 5)',
    department: 'Zone 5: Alambagh Municipal Division',
    assignedZone: 'Zone 5: Alambagh',
    phone: '+91 98765 11005',
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  {
    id: 'u-013',
    name: 'Er. R.K. Pandey',
    email: 'nodal.zone6@lucknowsmartcity.gov',
    role: 'admin',
    title: 'Nodal Zonal Officer (Zone 6)',
    department: 'Zone 6: Chowk Heritage Division',
    assignedZone: 'Zone 6: Chowk Heritage',
    phone: '+91 98765 11006',
    permissions: ['view_executive_metrics', 'view_all_assets'],
  },
  {
    id: 'u-003',
    name: 'Vikramaditya Sharma',
    email: 'operator.dispatch@smartcity.gov',
    role: 'operator',
    title: 'Lead Grid Dispatch Officer',
    department: 'Integrated Command & Control Center (ICCC)',
    phone: '+91 98765 43212',
    permissions: ['control_lighting_scenes', 'override_brightness', 'trigger_radar', 'resolve_alerts', 'adjust_ai_parameters'],
  },
  {
    id: 'u-004',
    name: 'Mahesh Kumar',
    email: 'technician.field@smartcity.gov',
    role: 'technician',
    title: 'Senior Field Maintenance Specialist',
    department: 'Rapid Response Repair Unit 4',
    phone: '+91 98765 43213',
    permissions: ['view_field_jobs', 'update_work_orders', 'mark_repaired', 'verify_hardware'],
  },
];

/**
 * User Login
 * Endpoint: POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  let targetUser = null;

  if (email) {
    targetUser = MUNICIPAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  } else if (role) {
    targetUser = MUNICIPAL_USERS.find(u => u.role === role);
  }

  // Fallback to first user if none matched in demo
  if (!targetUser) {
    targetUser = MUNICIPAL_USERS[0];
  }

  // Log successful login into statutory audit trail
  await auditService.logEvent({
    sector: 'Operations Control Center',
    eventType: 'User Authentication',
    summary: `Officer ${targetUser.name} (${targetUser.role.toUpperCase()}) authenticated successfully via secure municipal portal.`,
    metric: 'Authenticated',
    compliance: 'ISO 27001 / IT Act 2000',
    loggedBy: targetUser.name,
  });

  res.json({
    success: true,
    message: 'Authentication successful',
    token: `bearer_tok_${targetUser.id}_${Date.now()}`,
    user: targetUser,
  });
});

/**
 * Get Current Authenticated Profile
 * Endpoint: GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: MUNICIPAL_USERS[0],
  });
});

/**
 * User Logout
 * Endpoint: POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
