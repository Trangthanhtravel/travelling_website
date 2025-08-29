-- Migration script to update tours table to use category_slug
-- This script preserves existing data while updating the schema

-- Step 1: Add the new category_slug column
ALTER TABLE tours ADD COLUMN category_slug TEXT;

-- Step 2: Create a mapping from old categories to new slugs
-- Update existing tours to map old category values to new category slugs
UPDATE tours SET category_slug = 'cultural' WHERE category = 'domestic';
UPDATE tours SET category_slug = 'cultural' WHERE category = 'inbound';
UPDATE tours SET category_slug = 'adventure' WHERE category = 'outbound';

-- Step 3: For any tours without a category_slug, set a default
UPDATE tours SET category_slug = 'tours' WHERE category_slug IS NULL;

-- Step 4: Create the new index
CREATE INDEX IF NOT EXISTS idx_tours_category_slug ON tours(category_slug);

-- Note: The old 'category' column is kept for backward compatibility
-- You can remove it later once everything is working properly
