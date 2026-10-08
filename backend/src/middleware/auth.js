/**
 * RouteRescue Lightweight Authentication & Role Authorization Middleware
 */

function requireAuth(req, res, next) {
  const role = req.headers['x-user-role'];
  if (!role) {
    // Hackathon prototype fallback: allow open access if headers omitted
    return next();
  }
  next();
}

function requireOwner(req, res, next) {
  const role = req.headers['x-user-role'];
  if (role && role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Owner role required.'
    });
  }
  next();
}

function requireDriver(req, res, next) {
  const role = req.headers['x-user-role'];
  if (role && role !== 'DRIVER') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Driver role required.'
    });
  }
  next();
}

module.exports = {
  requireAuth,
  requireOwner,
  requireDriver
};
