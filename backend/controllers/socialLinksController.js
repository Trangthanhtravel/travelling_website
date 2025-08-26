const db = require('../config/database');

class SocialLinksController {
    // Get all social links (public endpoint)
    static async getAllSocialLinks(req, res) {
        try {
            const socialLinks = await db.prepare(`
                SELECT * FROM social_links 
                WHERE is_active = 1 
                ORDER BY sort_order ASC, platform ASC
            `).all();

            res.json({
                success: true,
                data: socialLinks
            });
        } catch (error) {
            console.error('Error fetching social links:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch social links'
            });
        }
    }

    // Get all social links for admin (including inactive)
    static async getAdminSocialLinks(req, res) {
        try {
            const socialLinks = await db.prepare(`
                SELECT * FROM social_links 
                ORDER BY sort_order ASC, platform ASC
            `).all();

            res.json({
                success: true,
                data: socialLinks
            });
        } catch (error) {
            console.error('Error fetching admin social links:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch social links'
            });
        }
    }

    // Create new social link
    static async createSocialLink(req, res) {
        try {
            const { platform, url, display_text, icon, is_active, sort_order } = req.body;

            if (!platform || !url) {
                return res.status(400).json({
                    success: false,
                    message: 'Platform and URL are required'
                });
            }

            const result = await db.prepare(`
                INSERT INTO social_links (platform, url, display_text, icon, is_active, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `).run(platform, url, display_text, icon, is_active ?? true, sort_order ?? 0);

            const socialLink = await db.prepare(`
                SELECT * FROM social_links WHERE id = ?
            `).get(result.lastInsertRowid);

            res.status(201).json({
                success: true,
                message: 'Social link created successfully',
                data: socialLink
            });
        } catch (error) {
            console.error('Error creating social link:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create social link'
            });
        }
    }

    // Update social link
    static async updateSocialLink(req, res) {
        try {
            const { id } = req.params;
            const { platform, url, display_text, icon, is_active, sort_order } = req.body;

            if (!platform || !url) {
                return res.status(400).json({
                    success: false,
                    message: 'Platform and URL are required'
                });
            }

            await db.prepare(`
                UPDATE social_links 
                SET platform = ?, url = ?, display_text = ?, icon = ?, is_active = ?, sort_order = ?, updated_at = datetime('now')
                WHERE id = ?
            `).run(platform, url, display_text, icon, is_active, sort_order, id);

            const socialLink = await db.prepare(`
                SELECT * FROM social_links WHERE id = ?
            `).get(id);

            if (!socialLink) {
                return res.status(404).json({
                    success: false,
                    message: 'Social link not found'
                });
            }

            res.json({
                success: true,
                message: 'Social link updated successfully',
                data: socialLink
            });
        } catch (error) {
            console.error('Error updating social link:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update social link'
            });
        }
    }

    // Delete social link
    static async deleteSocialLink(req, res) {
        try {
            const { id } = req.params;

            const result = await db.prepare(`
                DELETE FROM social_links WHERE id = ?
            `).run(id);

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Social link not found'
                });
            }

            res.json({
                success: true,
                message: 'Social link deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting social link:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete social link'
            });
        }
    }
}

module.exports = SocialLinksController;
