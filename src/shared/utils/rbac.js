const { verifyToken } = require('./jwt');
const db = require('../database/db');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid format' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  const user = db.users.find(u => u.id === decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, error: 'User record not found' });
  }

  req.user = user;
  next();
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role_code)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Role '${req.user.role_code}' does not have permission to access this resource`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles
};
