const Category = require('../models/Category');

// Get all categories with filtering
const getCategories = async (req, res) => {
  try {
    const { type, status, featured, sortBy, sortOrder, search } = req.query;

    const categories = await Category.findAll({
      type,
      status,
      featured,
      sortBy,
      sortOrder,
      search
    });

    res.json({
      success: true,
      data: categories.map(cat => cat.toJSON())
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: category.toJSON()
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create new category (Admin only)
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      type,
      icon,
      color,
      status,
      featured,
      sort_order
    } = req.body;

    // Handle bilingual data structure
    let categoryData = {
      name: typeof name === 'object' ? name.en : name,
      slug,
      description: typeof description === 'object' ? description.en : description,
      type,
      icon,
      color,
      status: status || 'active',
      featured: featured || false,
      sort_order: sort_order || 0,
      name_vi: typeof name === 'object' ? name.vi : '',
      description_vi: typeof description === 'object' ? description.vi : ''
    };

    // Validate required fields
    if (!categoryData.name || !slug || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, slug, and type are required'
      });
    }

    // Validate type
    if (!['tour', 'service', 'both'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be tour, service, or both'
      });
    }

    // Check if slug already exists
    const existingCategory = await Category.findBySlug(slug);
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category.toJSON(),
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update category (Admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      type,
      icon,
      color,
      status,
      featured,
      sort_order
    } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Handle bilingual data structure
    let updateData = {};

    if (name !== undefined) {
      updateData.name = typeof name === 'object' ? name.en : name;
      updateData.name_vi = typeof name === 'object' ? name.vi : '';
    }

    if (description !== undefined) {
      updateData.description = typeof description === 'object' ? description.en : description;
      updateData.description_vi = typeof description === 'object' ? description.vi : '';
    }

    if (slug !== undefined) updateData.slug = slug;
    if (type !== undefined) updateData.type = type;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    // Validate type if provided
    if (type && !['tour', 'service', 'both'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be tour, service, or both'
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active or inactive'
      });
    }

    // Check if slug already exists (excluding current category)
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findBySlug(slug);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    await category.update(updateData);

    res.json({
      success: true,
      data: category.toJSON(),
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Check if category can be deleted
const checkCategoryUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../config/database');

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category is used in tours or services
    const tourCount = await db.prepare(`
      SELECT COUNT(*) as count FROM tours 
      WHERE category = ? AND status != 'deleted'
    `).get(category.slug);

    const serviceCount = await db.prepare(`
      SELECT COUNT(*) as count FROM services 
      WHERE category_id = ? AND status != 'deleted'
    `).get(id);

    const usage = {
      canDelete: tourCount.count === 0 && serviceCount.count === 0,
      toursUsing: tourCount.count,
      servicesUsing: serviceCount.count,
      totalUsage: tourCount.count + serviceCount.count
    };

    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error checking category usage:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete category (Admin only) with proper warnings
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.body; // Allow force deletion
    const db = require('../config/database');

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check usage unless force delete
    if (!force) {
      const tourCount = await db.prepare(`
        SELECT COUNT(*) as count FROM tours 
        WHERE category = ? AND status != 'deleted'
      `).get(category.slug);

      const serviceCount = await db.prepare(`
        SELECT COUNT(*) as count FROM services 
        WHERE category_id = ? AND status != 'deleted'
      `).get(id);

      if (tourCount.count > 0 || serviceCount.count > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category. It is currently being used by ${tourCount.count} tour(s) and ${serviceCount.count} service(s). Please remove or reassign these items first, or use force delete.`,
          usage: {
            tours: tourCount.count,
            services: serviceCount.count
          }
        });
      }
    }

    await category.delete();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Reorder categories (Admin only)
const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories must be an array'
      });
    }

    // Update sort order for each category
    for (let i = 0; i < categories.length; i++) {
      const { id } = categories[i];
      const category = await Category.findById(id);
      if (category) {
        await category.update({ sort_order: i + 1 });
      }
    }

    res.json({
      success: true,
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  checkCategoryUsage
};
