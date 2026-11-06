// Single source of truth for role-based UI gating.
// Mirrors backend authorization. Keep in sync with backend/src/middleware/requireRole.js usages.

export const PERMISSIONS = {
  'meeting.write':  ['admin', 'manager'],
  'meeting.notify': ['admin', 'manager'],
  'resident.write': ['admin', 'manager'],
  'qr.generate':    ['admin', 'manager'],
  'admin.manage':   ['admin'],
  'community.edit': ['admin'],
};

export function can(role, permission) {
  const allowed = PERMISSIONS[permission];
  return Array.isArray(allowed) && allowed.includes(role);
}

export const ROLE_LABELS = {
  admin: '管理員',
  manager: '社區經理',
  meeting_assistant: '秘書',
};
