const db = require('../config/database');

// Get all content
const getAllContent = async (req, res) => {
  try {
    const { type, status = 'active' } = req.query;

    let query = 'SELECT * FROM content WHERE status = ?';
    const params = [status];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const content = await db.prepare(query).all(...params);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
};

// Get content by key
const getContentByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const content = await db.prepare(
      'SELECT * FROM content WHERE key = ? AND status = ?'
    ).get(key, 'active');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get content by key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
};

// Create content (admin only)
const createContent = async (req, res) => {
  try {
    const { key, title, content, type = 'setting' } = req.body;

    if (!key || !title) {
      return res.status(400).json({
        success: false,
        message: 'Key and title are required'
      });
    }

    // Check if key already exists
    const existing = await db.prepare(
      'SELECT id FROM content WHERE key = ?'
    ).get(key);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Content with this key already exists'
      });
    }

    const now = new Date().toISOString();

    const result = await db.prepare(`
      INSERT INTO content (key, title, content, type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?)
    `).run(key, title, content, type, now, now);

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: { id: result.lastInsertRowid }
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content'
    });
  }
};

// Update content (admin only)
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, status } = req.body;

    const existing = await db.prepare(
      'SELECT * FROM content WHERE id = ?'
    ).get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const now = new Date().toISOString();

    await db.prepare(`
      UPDATE content 
      SET title = ?, content = ?, type = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      content || existing.content,
      type || existing.type,
      status || existing.status,
      now,
      id
    );

    res.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content'
    });
  }
};

// Delete content (admin only)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.prepare(
      'SELECT * FROM content WHERE id = ?'
    ).get(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await db.prepare('DELETE FROM content WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content'
    });
  }
};

// Get hero images specifically
const getHeroImages = async (req, res) => {
  try {
    const heroImages = await db.prepare(`
      SELECT * FROM content 
      WHERE key LIKE 'hero_image_%' AND status = 'active'
      ORDER BY key
    `).all();

    res.json({
      success: true,
      data: heroImages
    });
  } catch (error) {
    console.error('Get hero images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hero images'
    });
  }
};

module.exports = {
  getAllContent,
  getContentByKey,
  createContent,
  updateContent,
  deleteContent,
  getHeroImages
};
