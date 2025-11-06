const emailService = require('../services/emailService');

// Get all email settings
const getEmailSettings = async (req, res) => {
  try {
    const settings = await emailService.getEmailSettings(req.db);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get email settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email settings'
    });
  }
};

// Update email settings
const updateEmailSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    // Validate email format if company_email is being updated
    if (settings.company_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.company_email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company email format'
        });
      }
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const updateQuery = `
        INSERT OR REPLACE INTO email_settings (setting_key, setting_value, description, created_at, updated_at)
        VALUES (?, ?, 
          COALESCE((SELECT description FROM email_settings WHERE setting_key = ?), ''),
          COALESCE((SELECT created_at FROM email_settings WHERE setting_key = ?), datetime('now')),
          datetime('now')
        )
      `;
      await req.db.prepare(updateQuery).bind(key, value, key, key).run();
    }

    // Get updated settings
    const updatedSettings = await emailService.getEmailSettings(req.db);

    res.json({
      success: true,
      message: 'Email settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email settings'
    });
  }
};

// Test email configuration
const testEmailConfiguration = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const settings = await emailService.getEmailSettings(req.db);

    // Create a test email
    const transporter = emailService.createTransporter();

    const testEmailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Email Configuration Test
        </h2>
        
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Current Settings:</h3>
          <ul>
            <li><strong>Company Email:</strong> ${settings.company_email}</li>
            <li><strong>Company Name:</strong> ${settings.company_name}</li>
            <li><strong>From Name:</strong> ${settings.email_from_name}</li>
          </ul>
        </div>
        
        <p>If you received this email, your email notification system is configured correctly!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Test sent at: ${new Date().toLocaleString()}<br>
          From: ${settings.company_name} Admin Panel
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Email Configuration Test - ' + settings.company_name,
      html: testEmailTemplate
    });

    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email: ' + error.message
    });
  }
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    // This would require additional logging in the email service
    // For now, return basic stats
    const settings = await emailService.getEmailSettings(req.db);

    const stats = {
      notifications_enabled: settings.booking_notification_enabled === 'true',
      confirmations_enabled: settings.customer_confirmation_enabled === 'true',
      company_email: settings.company_email,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email statistics'
    });
  }
};

module.exports = {
  getEmailSettings,
  updateEmailSettings,
  testEmailConfiguration,
  getEmailStats
};
