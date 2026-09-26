const fs = require('fs');
const path = require('path');
const db = require('../database/db');

const LOGS_DIR = path.join(__dirname, '../../../logs');
const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'audit.log');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  try {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

/**
 * Appends structured audit entry to logs/audit.log and db.auditLogs
 */
function logAuditEvent({ userId, role, action, resource, details, ip, status = 'SUCCESS' }) {
  const timestamp = new Date().toISOString();
  const logId = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const auditRecord = {
    id: logId,
    timestamp,
    user_id: userId || 'ANONYMOUS',
    role: role || 'GUEST',
    action,
    resource,
    details: details || {},
    ip: ip || '127.0.0.1',
    status
  };

  // 1. Push to in-memory DB persistence
  if (db && db.auditLogs) {
    db.auditLogs.unshift(auditRecord);
  }

  // 2. Append to physical logs/audit.log file
  const formattedLine = `[${timestamp}] [${status}] [USER:${userId || 'ANONYMOUS'}] [ROLE:${role || 'GUEST'}] [ACTION:${action}] [RESOURCE:${resource}] ${JSON.stringify(details || {})}\n`;

  try {
    fs.appendFileSync(AUDIT_LOG_FILE, formattedLine, 'utf8');
  } catch (err) {
    console.error('Error writing to audit.log:', err);
  }

  return auditRecord;
}

/**
 * Express Middleware to automatically capture audit logs for mutating requests (POST, PUT, PATCH, DELETE)
 */
function auditLogMiddleware(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend;

      const userId = req.user ? req.user.id : 'ANONYMOUS';
      const role = req.user ? req.user.role_code : 'GUEST';
      const ip = req.ip || req.connection.remoteAddress;

      logAuditEvent({
        userId,
        role,
        action: `${req.method} ${req.baseUrl}${req.path}`,
        resource: req.baseUrl || req.path,
        details: {
          path: req.originalUrl,
          statusCode: res.statusCode,
          body_summary: req.body ? Object.keys(req.body) : []
        },
        ip,
        status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED'
      });

      return originalSend.call(this, body);
    };
  }
  next();
}

/**
 * Reads physical audit.log file contents
 */
function readAuditLogFile(maxLines = 100) {
  try {
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      return 'File audit.log belum dibuat.';
    }
    const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf8');
    const lines = content.trim().split('\n');
    return lines.slice(-maxLines).join('\n');
  } catch (err) {
    return `Error reading audit.log file: ${err.message}`;
  }
}

module.exports = {
  logAuditEvent,
  auditLogMiddleware,
  readAuditLogFile,
  AUDIT_LOG_FILE
};
