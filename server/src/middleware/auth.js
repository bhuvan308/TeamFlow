const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const db = require('../config/db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Missing authentication token');

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
}

// Confirms req.user is a member of :projectId and attaches req.projectRole.
// Optionally restricts to a set of roles, e.g. requireProjectRole(['owner','admin']).
function requireProjectMember(allowedRoles = null) {
  return async function (req, res, next) {
    const projectId = req.params.projectId || req.body.project_id;
    if (!projectId) throw new ApiError(400, 'project_id is required');

    const { rows } = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );
    if (!rows.length) throw new ApiError(403, 'Not a member of this project');
    if (allowedRoles && !allowedRoles.includes(rows[0].role)) {
      throw new ApiError(403, 'Insufficient project role for this action');
    }
    req.projectRole = rows[0].role;
    next();
  };
}

module.exports = { requireAuth, requireProjectMember };
