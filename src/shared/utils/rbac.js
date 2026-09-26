const { verifyToken } = require('./jwt');
const db = require('../database/db');

// Role Hierarchies & Permission Matrix (RBAC & ABAC)
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  FIELD_AGENT: 50,
  UMKM_OWNER_PREMIUM: 30,
  UMKM_OWNER_FREE: 10,
  CASHIER: 5
};

const PERMISSION_MATRIX = {
  SUPER_ADMIN: ['*'],
  FIELD_AGENT: [
    'services:tasks:read',
    'services:evidence:write',
    'services:route:read',
    'audit:history:read',
    'kit:read',
    'kit:write'
  ],
  UMKM_OWNER_PREMIUM: [
    'audit:evaluate',
    'audit:history:read',
    'gmaps:qr:generate',
    'gmaps:auto_reply',
    'gmaps:coupons',
    'gmaps:checklist',
    'landing:manage',
    'pos:manage',
    'pos:staff:unlimited',
    'pos:transaction:create',
    'pos:transaction:read',
    'learning:courses:all',
    'services:order',
    'kit:read',
    'kit:write'
  ],
  UMKM_OWNER_FREE: [
    'audit:evaluate',
    'audit:history:read',
    'gmaps:qr:generate',
    'gmaps:auto_reply',
    'gmaps:coupons',
    'gmaps:checklist',
    'landing:manage',
    'pos:manage',
    'pos:staff:limited',
    'pos:transaction:create',
    'pos:transaction:read',
    'learning:courses:free',
    'services:order',
    'kit:read',
    'kit:write'
  ],
  CASHIER: [
    'pos:transaction:create',
    'pos:transaction:read',
    'pos:staff:read'
  ]
};

/**
 * Authentication Middleware
 * Validates Bearer JWT Token and populates req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header missing or invalid format (Bearer token required)'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.'
    });
  }

  const user = db.users.find(u => u.id === decoded.id);
  if (!user || user.status === 'INACTIVE') {
    return res.status(401).json({
      success: false,
      error: 'User account not found or deactivated'
    });
  }

  req.user = user;
  next();
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specified user roles
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role_code) && req.user.role_code !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role_code}' does not have permission to access this resource`
      });
    }

    next();
  };
}

/**
 * Tier-Based Access Control Middleware
 * Verifies if user tier meets minimum requirement (FREE vs PREMIUM)
 */
function authorizeTier(minimumTier = 'PREMIUM') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    // SUPER_ADMIN & FIELD_AGENT bypass tier restrictions
    if (['SUPER_ADMIN', 'FIELD_AGENT'].includes(req.user.role_code)) {
      return next();
    }

    if (minimumTier === 'PREMIUM' && req.user.role_code !== 'UMKM_OWNER_PREMIUM') {
      return res.status(403).json({
        success: false,
        tier_restricted: true,
        error: 'Fitur ini khusus untuk member UMKM Premium. Silakan upgrade paket Anda!'
      });
    }

    next();
  };
}

/**
 * Attribute-Based Access Control (ABAC) / Ownership Middleware
 * Verifies if the authenticated user owns the resource or is a SUPER_ADMIN
 */
function authorizeOwnerOrAdmin(getOwnerIdFn) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    if (req.user.role_code === 'SUPER_ADMIN') {
      return next();
    }

    const resourceOwnerId = getOwnerIdFn ? getOwnerIdFn(req) : (req.params.ownerId || req.body.owner_id);
    const currentUserId = req.user.role_code === 'CASHIER' ? (req.user.owner_id || req.user.id) : req.user.id;

    if (resourceOwnerId && resourceOwnerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Anda tidak memiliki akses ke data / sumber daya pemilik lain'
      });
    }

    next();
  };
}

/**
 * Permission-Based Access Control Middleware
 * Checks if user role has required fine-grained permissions
 */
function authorizePermissions(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    const userPermissions = PERMISSION_MATRIX[req.user.role_code] || [];
    const hasAll = requiredPermissions.every(perm =>
      userPermissions.includes('*') || userPermissions.includes(perm)
    );

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: User role '${req.user.role_code}' lacks required permission: ${requiredPermissions.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
  authorizeTier,
  authorizeOwnerOrAdmin,
  authorizePermissions,
  ROLE_HIERARCHY,
  PERMISSION_MATRIX
};
