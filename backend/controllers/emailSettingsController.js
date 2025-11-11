const currency= require('../utils/currency');
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

// Get email preview
const getEmailPreview = async (req, res) => {
  try {
    const { type, customBody, language = 'en' } = req.query;
    const settings = await emailService.getEmailSettings(req.db);

    // Get translations
    const t = emailService.getEmailTranslations(language);

    // Sample data for preview
    const sampleBooking = {
      bookingNumber: 'BK-2024-00123',
      type: 'tour',
      startDate: '2024-12-25',
      totalTravelers: 2,
      totalAmount: '1,500',
      currency: 'USD',
      specialRequests: language === 'vi' ? 'Ưu tiên bữa ăn chay' : 'Vegetarian meals preferred'
    };

    const sampleCustomer = {
      name: language === 'vi' ? 'Nguyễn Văn A' : 'John Doe',
      email: 'customer@example.com',
      phone: language === 'vi' ? '+84 (912) 345-678' : '+1 (555) 123-4567'
    };

    const sampleTour = {
      title: language === 'vi' ? 'Tour Khám Phá Việt Nam Tuyệt Vời' : 'Amazing Vietnam Adventure Tour'
    };

    const variables = {
      booking_number: sampleBooking.bookingNumber,
      customer_name: sampleCustomer.name,
      customer_email: sampleCustomer.email,
      customer_phone: sampleCustomer.phone,
      item_title: sampleTour.title,
      item_type: sampleBooking.type,
      start_date: sampleBooking.startDate,
      total_travelers: sampleBooking.totalTravelers,
      total_amount: sampleBooking.totalAmount,
      currency: sampleBooking.currency,
      special_requests: sampleBooking.specialRequests,
      company_name: settings.company_name
    };

    let emailHtml = '';
    let subject = '';

    if (type === 'admin') {
      subject = emailService.replaceTemplateVariables(settings.admin_notification_subject, variables);

      const customContent = customBody && customBody.trim()
        ? emailService.replaceTemplateVariables(customBody, variables)
        : '';

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.newBookingReceived} - ${sampleTour.title}
          </h2>
          
          ${customContent ? `<div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            ${customContent}
          </div>` : `<p>${t.aNewBookingHasBeenSubmitted}</p>`}
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.customerInformation}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">${t.name}:</td>
                <td style="padding: 8px 0;">${sampleCustomer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.email}:</td>
                <td style="padding: 8px 0;"><a href="mailto:${sampleCustomer.email}">${sampleCustomer.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.phone}:</td>
                <td style="padding: 8px 0;"><a href="tel:${sampleCustomer.phone}">${sampleCustomer.phone}</a></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.bookingDetails}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">${t.bookingNumber}:</td>
                <td style="font-family: monospace; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">${sampleBooking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.tour}:</td>
                <td style="padding: 8px 0;">${sampleTour.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.startDate}:</td>
                <td style="padding: 8px 0;">${new Date(sampleBooking.startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.travelers}:</td>
                <td style="padding: 8px 0;">${sampleBooking.totalTravelers} ${t.persons}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.totalAmount}:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">${currency.formatCurrency(sampleBooking.totalAmount)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">${t.specialRequests}:</td>
                <td style="background: #fef3c7; padding: 8px; border-radius: 4px;">${sampleBooking.specialRequests}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">${t.actionRequired}</p>
            <p style="margin: 5px 0 0 0;">${t.pleaseContactCustomer}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            ${t.automatedNotification} ${settings.company_name} ${t.bookingSystem}
          </p>
        </div>
      `;
    } else if (type === 'customer') {
      subject = emailService.replaceTemplateVariables(settings.customer_confirmation_subject, variables);

      const customContent = customBody && customBody.trim()
        ? emailService.replaceTemplateVariables(customBody, variables)
        : '';

      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.bookingRequestReceived} - ${sampleTour.title}
          </h2>
          
          <p>${t.dear} <strong>${sampleCustomer.name}</strong>,</p>
          
          ${customContent ? `<div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            ${customContent}
          </div>` : `<p>${t.thankYouForChoosing} ${settings.company_name}! ${t.weHaveReceivedYourBooking}</p>`}
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.yourBookingDetails}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">${t.bookingNumber}:</td>
                <td style="font-family: monospace; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">${sampleBooking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.tour}:</td>
                <td style="padding: 8px 0;">${sampleTour.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.startDate}:</td>
                <td style="padding: 8px 0;">${new Date(sampleBooking.startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.travelers}:</td>
                <td style="padding: 8px 0;">${sampleBooking.totalTravelers} ${t.persons}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.totalAmount}:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">${currency.formatCurrency(sampleBooking.totalAmount)}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #15803d;">${t.whatHappensNext}</h4>
            <ul style="margin: 0; padding-left: 20px; color: #166534;">
              <li>${t.teamWillReview}</li>
              <li>${t.contactWithin24Hours}</li>
              <li>${t.receivePaymentInstructions}</li>
              <li>${t.finalConfirmation}</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>${t.important}:</strong> ${t.keepBookingNumber}</p>
          </div>
          
          <p>${t.questionsContact}</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 18px; color: #2563eb;"><strong>${settings.company_name}</strong></p>
            <p style="margin: 5px 0;">${t.thankYouForTravelNeeds}</p>
            <p style="margin: 0; font-size: 14px;">${t.automatedConfirmation}</p>
          </div>
        </div>
      `;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid email type. Must be "admin" or "customer"'
      });
    }

    res.json({
      success: true,
      data: {
        subject,
        html: emailHtml
      }
    });
  } catch (error) {
    console.error('Get email preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating email preview'
    });
  }
};

module.exports = {
  getEmailSettings,
  updateEmailSettings,
  testEmailConfiguration,
  getEmailStats,
  getEmailPreview
};
