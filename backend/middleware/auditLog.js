const { getDB } = require('../config/database');

/**
 * Audit logging middleware
 * Logs admin actions (create, update, delete) to activity_logs table
 */
const logActivity = async (req, action_type, resource_type, resource_id, resource_name, changes = null) => {
  try {
    console.log(`[Audit] logActivity called:`, {
      hasUser: !!req.user,
      userId: req.user?.id,
      userName: req.user?.name,
      userEmail: req.user?.email,
      action_type,
      resource_type,
      resource_id,
      resource_name
    });

    if (!req.user || !req.user.id) {
      console.warn('[Audit] No user in request for audit log - SKIPPING');
      return;
    }

    const admin_id = req.user.id;
    const admin_name = req.user.name || 'Unknown Admin';
    const admin_email = req.user.email || 'unknown@example.com';
    const ip_address = req.ip || req.connection?.remoteAddress || null;
    const user_agent = req.headers['user-agent'] || null;
    const changes_json = changes ? JSON.stringify(changes) : null;

    const query = `
      INSERT INTO activity_logs (
        admin_id, admin_name, admin_email, action_type, 
        resource_type, resource_id, resource_name, 
        changes, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    console.log(`[Audit] Preparing to insert log with params:`, {
      admin_id,
      admin_name,
      admin_email,
      action_type,
      resource_type,
      resource_id,
      resource_name
    });

    const db = getDB();
    const result = await db.prepare(query).bind(
      admin_id,
      admin_name,
      admin_email,
      action_type,
      resource_type,
      resource_id,
      resource_name,
      changes_json,
      ip_address,
      user_agent
    ).run();

    console.log(`✓ Audit log created: ${admin_email} ${action_type}d ${resource_type} #${resource_id}`, result);
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[Audit] Failed to log activity:', error);
  }
};

/**
 * Helper to create audit middleware for specific actions
 */
const createAuditMiddleware = (action_type, resource_type) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to capture response
    res.json = function(data) {
      console.log(`[Audit] Response for ${action_type} ${resource_type}:`, {
        success: data.success,
        statusCode: res.statusCode,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : [],
        params: req.params
      });

      // Log after successful operation
      if (data.success && res.statusCode < 400) {
        // Extract resource info from response or request
        const resource_id = data.data?.id || data.id || req.params.id || null;
        const resource_name = data.data?.name || data.data?.title || data.name || data.title || null;
        const changes = data.data || null;

        console.log(`[Audit] Extracted info:`, {
          resource_id,
          resource_name,
          hasChanges: !!changes
        });

        // Fire and forget - don't wait for logging
        logActivity(req, action_type, resource_type, resource_id, resource_name, changes)
          .catch(err => console.error('Audit log error:', err));
      } else {
        console.log(`[Audit] Skipping log - success: ${data.success}, statusCode: ${res.statusCode}`);
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  logActivity,
  createAuditMiddleware
};
