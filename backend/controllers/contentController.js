const { db } = require('../config/database');
const { r2Helpers } = require('../config/storage');

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

    const result = await db.prepare(query).bind(...params).all();
    const content = result.results || [];

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

    const result = await db.prepare(
      'SELECT * FROM content WHERE key = ? AND status = ?'
    ).bind(key, 'active').first();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: result
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
    ).bind(key).first();

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
    `).bind(key, title, content, type, now, now).run();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: { id: result.last_row_id }
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
    ).bind(id).first();

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
    `).bind(
      title || existing.title,
      content || existing.content,
      type || existing.type,
      status || existing.status,
      now,
      id
    ).run();

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

// Update content with image (admin only)
const updateContentWithImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if R2 is properly configured
    if (!req.r2) {
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured'
      });
    }

    const existing = await db.prepare(
      'SELECT * FROM content WHERE id = ?'
    ).bind(id).first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Validate and upload image to R2
    r2Helpers.validateImage(req.file);

    // Delete old image if it exists
    if (existing.content && existing.content.startsWith('https://')) {
      await r2Helpers.deleteImage(req.r2, existing.content);
    }

    // Upload new image
    const imageUrl = await r2Helpers.uploadImage(req.r2, req.file, 'content');

    // Update content with new image URL
    const now = new Date().toISOString();
    await db.prepare(`
      UPDATE content 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `).bind(imageUrl, now, id).run();

    res.json({
      success: true,
      message: 'Content image updated successfully',
      data: { imageUrl }
    });
  } catch (error) {
    console.error('Update content with image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating content image'
    });
  }
};

// Delete content (admin only)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.prepare(
      'SELECT * FROM content WHERE id = ?'
    ).bind(id).first();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await db.prepare('DELETE FROM content WHERE id = ?').bind(id).run();

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
    const result = await db.prepare(`
      SELECT * FROM content 
      WHERE (key LIKE 'hero_image_%' OR key LIKE 'hero_title_%' OR key LIKE 'hero_subtitle_%') AND status = 'active'
      ORDER BY key
    `).bind().all();

    const heroContent = result.results || [];

    res.json({
      success: true,
      data: heroContent
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
  getHeroImages,
  updateContentWithImage
};
