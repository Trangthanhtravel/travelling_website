const db = require('../config/database');

/**
 * Get activity logs with pagination and filters
 */
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      admin_id,
      action_type,
      resource_type,
      date_from,
      date_to
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build query with filters
    let whereConditions = [];
    let params = [];

    if (admin_id) {
      whereConditions.push('admin_id = ?');
      params.push(admin_id);
    }

    if (action_type) {
      whereConditions.push('action_type = ?');
      params.push(action_type);
    }

    if (resource_type) {
      whereConditions.push('resource_type = ?');
      params.push(resource_type);
    }

    if (date_from) {
      whereConditions.push('created_at >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('created_at <= ?');
      params.push(date_to);
    }

    // Only show logs from last 365 days
    whereConditions.push('created_at >= datetime("now", "-365 days")');

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM activity_logs ${whereClause}`;
    const countResult = await db.getDB().prepare(countQuery).bind(...params).first();
    const total = countResult?.total || 0;

    // Get paginated logs
    const logsQuery = `
      SELECT 
        id,
        admin_id,
        admin_name,
        admin_email,
        action_type,
        resource_type,
        resource_id,
        resource_name,
        changes,
        ip_address,
        created_at
      FROM activity_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logsResult = await db.getDB().prepare(logsQuery)
      .bind(...params, parseInt(limit), offset)
      .all();

    const logs = logsResult.results || [];

    // Parse JSON changes for each log
    const parsedLogs = logs.map(log => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null
    }));

    res.json({
      success: true,
      data: parsedLogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

/**
 * Get activity statistics
 */
const getActivityStats = async (req, res) => {
  try {
    // Get stats for last 30 days
    const statsQuery = `
      SELECT 
        action_type,
        resource_type,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY action_type, resource_type
      ORDER BY count DESC
    `;

    const statsResult = await db.getDB().prepare(statsQuery).all();
    const stats = statsResult.results || [];

    // Get most active admins
    const adminStatsQuery = `
      SELECT 
        admin_id,
        admin_name,
        admin_email,
        COUNT(*) as action_count
      FROM activity_logs
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY admin_id, admin_name, admin_email
      ORDER BY action_count DESC
      LIMIT 10
    `;

    const adminStatsResult = await db.getDB().prepare(adminStatsQuery).all();
    const adminStats = adminStatsResult.results || [];

    // Get recent activity count by day
    const dailyStatsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM activity_logs
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const dailyStatsResult = await db.getDB().prepare(dailyStatsQuery).all();
    const dailyStats = dailyStatsResult.results || [];

    res.json({
      success: true,
      data: {
        actionStats: stats,
        adminStats,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};

/**
 * Clean up old logs (older than 365 days)
 * This should be called by a cron job
 */
const cleanupOldLogs = async (req, res) => {
  try {
    // Only super admins can trigger cleanup
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admins can cleanup logs'
      });
    }

    const deleteQuery = `
      DELETE FROM activity_logs 
      WHERE created_at < datetime('now', '-365 days')
    `;

    const result = await db.getDB().prepare(deleteQuery).run();
    const deletedCount = result.meta?.changes || 0;

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old activity logs`,
      deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old logs'
    });
  }
};

module.exports = {
  getActivityLogs,
  getActivityStats,
  cleanupOldLogs
};

