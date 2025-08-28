const { getDB, generateId } = require('../config/database');

// Get featured blogs for homepage
const getFeaturedBlogs = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { limit = 3 } = req.query;

    const query = `
      SELECT b.*, u.name as author_name, u.email as author_email
      FROM blogs b
      LEFT JOIN users u ON b.author = u.id
      WHERE b.status = 'published' AND b.featured = 1
      ORDER BY b.created_at DESC
      LIMIT ?
    `;

    const result = await db.prepare(query).bind(parseInt(limit)).all();

    console.log('Featured blogs query result:', result); // Debug log

    const blogs = result.results?.map(blog => ({
      ...blog,
      categories: blog.categories ? (typeof blog.categories === 'string' ? blog.categories : JSON.stringify(blog.categories)) : '',
      tags: blog.tags ? (typeof blog.tags === 'string' ? blog.tags : JSON.stringify(blog.tags)) : '',
      gallery: blog.gallery ? JSON.parse(blog.gallery) : [],
      featured: Boolean(blog.featured),
      image_url: blog.featured_image, // Add this for frontend compatibility
      authorProfile: {
        name: blog.author_name,
        email: blog.author_email
      }
    })) || [];

    console.log('Processed featured blogs:', blogs); // Debug log

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all blogs with filtering and pagination
const getBlogs = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      status,
      category,
      tag,
      author,
      search,
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'desc',
      featured
    } = req.query;

    let query = `
      SELECT b.*, u.name as author_name, u.email as author_email
      FROM blogs b
      LEFT JOIN users u ON b.author = u.id
    `;

    const conditions = [];
    const params = [];

    // Only show published blogs for non-admin users
    if (req.user?.role !== 'admin') {
      conditions.push('b.status = ?');
      params.push('published');
    } else if (status) {
      conditions.push('b.status = ?');
      params.push(status);
    }

    if (featured !== undefined) {
      conditions.push('b.featured = ?');
      params.push(featured === 'true' ? 1 : 0);
    }

    if (author) {
      conditions.push('b.author = ?');
      params.push(author);
    }

    if (search) {
      conditions.push('(b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      conditions.push('b.categories LIKE ?');
      params.push(`%${category}%`);
    }

    if (tag) {
      conditions.push('b.tags LIKE ?');
      params.push(`%${tag}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const validSortColumns = ['created_at', 'published_at', 'views', 'title', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY b.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const result = await db.prepare(query).bind(...params).all();

    // Get total count for pagination - fix parameter binding issue
    let countQuery = `SELECT COUNT(*) as total FROM blogs b`;
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // Create count params by excluding limit and offset (last 2 params)
    const countParams = params.slice(0, -2);
    const countResult = await db.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total || 0;

    // Process results
    const blogs = result.results?.map(blog => ({
      ...blog,
      categories: blog.categories ? (typeof blog.categories === 'string' ? blog.categories : JSON.stringify(blog.categories)) : '',
      tags: blog.tags ? (typeof blog.tags === 'string' ? blog.tags : JSON.stringify(blog.tags)) : '',
      gallery: blog.gallery ? JSON.parse(blog.gallery) : [],
      featured: Boolean(blog.featured),
      authorProfile: {
        name: blog.author_name,
        email: blog.author_email
      }
    })) || [];

    res.json({
      success: true,
      data: { blogs },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { slug } = req.params;

    const query = `
      SELECT b.*, u.name as author_name, u.email as author_email
      FROM blogs b
      LEFT JOIN users u ON b.author = u.id
      WHERE b.slug = ? AND (b.status = 'published' OR ? = 'admin')
    `;

    const result = await db.prepare(query).bind(slug, req.user?.role || '').first();

    if (!result) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Increment view count if not admin
    if (req.user?.role !== 'admin') {
      await db.prepare('UPDATE blogs SET views = views + 1 WHERE id = ?').bind(result.id).run();
      result.views = (result.views || 0) + 1;
    }

    const blog = {
      ...result,
      categories: result.categories ? (typeof result.categories === 'string' ? result.categories : JSON.stringify(result.categories)) : '',
      tags: result.tags ? (typeof result.tags === 'string' ? result.tags : JSON.stringify(result.tags)) : '',
      gallery: result.gallery ? JSON.parse(result.gallery) : [],
      featured: Boolean(result.featured),
      authorProfile: {
        name: result.author_name,
        email: result.author_email
      }
    };

    res.json({ success: true, data: { blog } });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single blog by ID (for admin)
const getBlogById = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;

    const query = `
      SELECT b.*, u.name as author_name, u.email as author_email
      FROM blogs b
      LEFT JOIN users u ON b.author = u.id
      WHERE b.id = ?
    `;

    const result = await db.prepare(query).bind(id).first();

    if (!result) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const blog = {
      ...result,
      categories: result.categories ? (typeof result.categories === 'string' ? result.categories : JSON.stringify(result.categories)) : '',
      tags: result.tags ? (typeof result.tags === 'string' ? result.tags : JSON.stringify(result.tags)) : '',
      gallery: result.gallery ? JSON.parse(result.gallery) : [],
      featured: Boolean(result.featured),
      authorProfile: {
        name: result.author_name,
        email: result.author_email
      }
    };

    res.json({ success: true, data: { blog } });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      gallery = [],
      categories = [],
      tags = [],
      status = 'draft',
      featured = false,
      language = 'en',
      seoData = {}
    } = req.body;

    // Validate required fields
    if (!title || !slug || !content || !excerpt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, slug, content, excerpt'
      });
    }

    // Check if slug already exists
    const existingBlog = await db.prepare('SELECT id FROM blogs WHERE slug = ?').bind(slug).first();
    if (existingBlog) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const blogId = generateId();
    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const query = `
      INSERT INTO blogs (
        id, title, slug, content, excerpt, featured_image, gallery,
        author_id, status, featured, categories, tags, language,
        seo_data, reading_time, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.prepare(query).bind(
      blogId,
      title,
      slug,
      content,
      excerpt,
      featuredImage || null,
      JSON.stringify(gallery),
      req.user.id,
      status,
      featured ? 1 : 0,
      JSON.stringify(categories),
      JSON.stringify(tags),
      language,
      JSON.stringify(seoData),
      readingTime,
      publishedAt
    ).run();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog: { id: blogId, slug } }
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      gallery = [],
      categories = [],
      tags = [],
      status,
      featured,
      language,
      seoData = {}
    } = req.body;

    // Check if blog exists
    const existingBlog = await db.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first();
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Check if slug is taken by another blog
    if (slug && slug !== existingBlog.slug) {
      const slugExists = await db.prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?').bind(slug, id).first();
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Slug already exists' });
      }
    }

    // Calculate reading time if content changed
    let readingTime = existingBlog.reading_time;
    if (content && content !== existingBlog.content) {
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Update published_at if status changed to published
    let publishedAt = existingBlog.published_at;
    if (status === 'published' && existingBlog.status !== 'published') {
      publishedAt = new Date().toISOString();
    }

    const query = `
      UPDATE blogs SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        featured_image = COALESCE(?, featured_image),
        gallery = COALESCE(?, gallery),
        status = COALESCE(?, status),
        featured = COALESCE(?, featured),
        categories = COALESCE(?, categories),
        tags = COALESCE(?, tags),
        language = COALESCE(?, language),
        seo_data = COALESCE(?, seo_data),
        reading_time = ?,
        published_at = COALESCE(?, published_at),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.prepare(query).bind(
      title || null,
      slug || null,
      content || null,
      excerpt || null,
      featuredImage || null,
      gallery ? JSON.stringify(gallery) : null,
      status || null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      categories ? JSON.stringify(categories) : null,
      tags ? JSON.stringify(tags) : null,
      language || null,
      seoData ? JSON.stringify(seoData) : null,
      readingTime,
      publishedAt,
      id
    ).run();

    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;

    // Check if blog exists
    const existingBlog = await db.prepare('SELECT id FROM blogs WHERE id = ?').bind(id).first();
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    await db.prepare('DELETE FROM blogs WHERE id = ?').bind(id).run();

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update blog status
const updateBlogStatus = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if blog exists
    const existingBlog = await db.prepare('SELECT * FROM blogs WHERE id = ?').bind(id).first();
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Update published_at if status changed to published
    let publishedAt = existingBlog.published_at;
    if (status === 'published' && existingBlog.status !== 'published') {
      publishedAt = new Date().toISOString();
    }

    await db.prepare('UPDATE blogs SET status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(status, publishedAt, id).run();

    res.json({ success: true, message: 'Blog status updated successfully' });
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getFeaturedBlogs,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus
};
