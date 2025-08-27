class SocialLinksController {
    // Get all social links (public endpoint)
    static async getAllSocialLinks(req, res) {
        try {
            const result = await req.db.prepare(`
                SELECT * FROM social_links 
                WHERE is_active = 1 
                ORDER BY sort_order ASC, platform ASC
            `).bind().all();

            const socialLinks = result.results || [];

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
            const result = await req.db.prepare(`
                SELECT * FROM social_links 
                ORDER BY sort_order ASC, platform ASC
            `).bind().all();

            const socialLinks = result.results || [];

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

            const result = await req.db.prepare(`
                INSERT INTO social_links (platform, url, display_text, icon, is_active, sort_order)
                VALUES (?, ?, ?, ?, ?, ?)
            `).bind(platform, url, display_text || null, icon || null, is_active || 1, sort_order || 0).run();

            res.status(201).json({
                success: true,
                message: 'Social link created successfully',
                data: { id: result.meta.last_row_id }
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

            const result = await req.db.prepare(`
                UPDATE social_links 
                SET platform = ?, url = ?, display_text = ?, icon = ?, is_active = ?, sort_order = ?
                WHERE id = ?
            `).bind(platform, url, display_text || null, icon || null, is_active || 1, sort_order || 0, id).run();

            if (result.meta.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Social link not found'
                });
            }

            res.json({
                success: true,
                message: 'Social link updated successfully'
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

            const result = await req.db.prepare(`
                DELETE FROM social_links WHERE id = ?
            `).bind(id).run();

            if (result.meta.changes === 0) {
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
