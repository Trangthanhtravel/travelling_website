const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { type, status, sortBy, sortOrder } = req.query;

    const categories = await Category.findAll({
      type,
      status,
      sortBy,
      sortOrder
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
    const { name, slug, description, type, icon, color, sort_order } = req.body;

    // Validate required fields
    if (!name || !slug || !type) {
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

    const category = await Category.create({
      name,
      slug,
      description,
      type,
      icon,
      color,
      sort_order: sort_order || 0
    });

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
    const { name, slug, description, type, icon, color, status, sort_order } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

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

    await category.update({
      name,
      slug,
      description,
      type,
      icon,
      color,
      status,
      sort_order
    });

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

// Delete category (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.delete();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.message.includes('being used')) {
      return res.status(400).json({ success: false, message: error.message });
    }
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
  reorderCategories
};
