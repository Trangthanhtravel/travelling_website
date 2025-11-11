const currency= require('../utils/currency');
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize email transporter
  createTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    return this.transporter;
  }

  // Get email settings from database
  async getEmailSettings(db) {
    try {
      const query = 'SELECT setting_key, setting_value FROM email_settings';
      const result = await db.prepare(query).bind().all();

      const settings = {};

      // D1 returns results in a 'results' array
      if (result && result.results && result.results.length > 0) {
        result.results.forEach(row => {
          settings[row.setting_key] = row.setting_value;
        });
      }

      // If no settings found in database, return defaults
      if (Object.keys(settings).length === 0) {
        return {
          company_email: process.env.COMPANY_EMAIL || 'info@travelcompany.com',
          company_name: process.env.COMPANY_NAME || 'Travel Company',
          email_from_name: 'Travel Company Team',
          booking_notification_enabled: 'true',
          customer_confirmation_enabled: 'true',
          admin_notification_subject: 'New Booking Received - {booking_number}',
          customer_confirmation_subject: 'Booking Confirmation - {booking_number}',
          admin_email_body: '',
          customer_email_body: ''
        };
      }

      return settings;
    } catch (error) {
      console.error('Error fetching email settings:', error);
      // Return default settings if database query fails
      return {
        company_email: process.env.COMPANY_EMAIL || 'info@travelcompany.com',
        company_name: process.env.COMPANY_NAME || 'Travel Company',
        email_from_name: 'Travel Company Team',
        booking_notification_enabled: 'true',
        customer_confirmation_enabled: 'true',
        admin_notification_subject: 'New Booking Received - {booking_number}',
        customer_confirmation_subject: 'Booking Confirmation - {booking_number}',
        admin_email_body: '',
        customer_email_body: ''
      };
    }
  }

  // Replace template variables in text
  replaceTemplateVariables(template, variables) {
    let result = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, variables[key]);
    });
    return result;
  }

  // Get translations for email templates
  getEmailTranslations(language = 'en') {
    const translations = {
      en: {
        newBookingReceived: 'New Booking Received',
        bookingRequestReceived: 'Booking Request Received',
        aNewBookingHasBeenSubmitted: 'A new booking has been submitted through the website and requires your attention.',
        thankYouForChoosing: 'Thank you for choosing',
        weHaveReceivedYourBooking: 'We have successfully received your booking request and are excited to help you create an amazing travel experience.',
        customerInformation: 'Customer Information:',
        bookingDetails: 'Booking Details:',
        yourBookingDetails: 'Your Booking Details:',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        bookingNumber: 'Booking Number',
        tour: 'Tour',
        service: 'Service',
        startDate: 'Start Date',
        travelers: 'Travelers',
        totalAmount: 'Total Amount',
        specialRequests: 'Special Requests',
        actionRequired: 'Action Required:',
        pleaseContactCustomer: 'Please contact the customer within 24 hours to confirm this booking and provide payment instructions.',
        automatedNotification: 'This is an automated notification from',
        bookingSystem: 'booking system.',
        dear: 'Dear',
        whatHappensNext: 'What happens next?',
        teamWillReview: 'Our team will review your booking request',
        contactWithin24Hours: "We'll contact you within 24 hours to confirm availability",
        receivePaymentInstructions: "You'll receive payment instructions once confirmed",
        finalConfirmation: 'Final booking confirmation after payment',
        important: 'Important:',
        keepBookingNumber: "Please keep this booking number for your records. You'll need it for all communications regarding your booking.",
        questionsContact: 'If you have any questions or need to make changes to your booking, please don\'t hesitate to contact us.',
        thankYouForTravelNeeds: 'Thank you for choosing us for your travel needs!',
        automatedConfirmation: 'This is an automated confirmation email.',
        persons: 'person(s)'
      },
      vi: {
        newBookingReceived: 'Đơn Đặt Chỗ Mới',
        bookingRequestReceived: 'Đã Nhận Yêu Cầu Đặt Chỗ',
        aNewBookingHasBeenSubmitted: 'Một đơn đặt chỗ mới đã được gửi qua website và cần được xử lý.',
        thankYouForChoosing: 'Cảm ơn bạn đã chọn',
        weHaveReceivedYourBooking: 'Chúng tôi đã nhận được yêu cầu đặt chỗ của bạn và rất vui mừng được giúp bạn tạo nên một trải nghiệm du lịch tuyệt vời.',
        customerInformation: 'Thông Tin Khách Hàng:',
        bookingDetails: 'Chi Tiết Đặt Chỗ:',
        yourBookingDetails: 'Chi Tiết Đặt Chỗ Của Bạn:',
        name: 'Họ Tên',
        email: 'Email',
        phone: 'Số Điện Thoại',
        bookingNumber: 'Mã Đặt Chỗ',
        tour: 'Tour',
        service: 'Dịch Vụ',
        startDate: 'Ngày Bắt Đầu',
        travelers: 'Số Khách',
        totalAmount: 'Tổng Tiền',
        specialRequests: 'Yêu Cầu Đặc Biệt',
        actionRequired: 'Cần Thực Hiện:',
        pleaseContactCustomer: 'Vui lòng liên hệ với khách hàng trong vòng 24 giờ để xác nhận đặt chỗ này và cung cấp hướng dẫn thanh toán.',
        automatedNotification: 'Đây là thông báo tự động từ hệ thống đặt chỗ của',
        bookingSystem: '',
        dear: 'Kính gửi',
        whatHappensNext: 'Các bước tiếp theo?',
        teamWillReview: 'Đội ngũ của chúng tôi sẽ xem xét yêu cầu đặt chỗ của bạn',
        contactWithin24Hours: 'Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận',
        receivePaymentInstructions: 'Bạn sẽ nhận được hướng dẫn thanh toán sau khi được xác nhận',
        finalConfirmation: 'Xác nhận đặt chỗ cuối cùng sau khi thanh toán',
        important: 'Quan Trọng:',
        keepBookingNumber: 'Vui lòng lưu mã đặt chỗ này để theo dõi. Bạn sẽ cần nó cho mọi liên lạc liên quan đến đặt chỗ của mình.',
        questionsContact: 'Nếu bạn có bất kỳ câu hỏi nào hoặc cần thay đổi đặt chỗ, vui lòng liên hệ với chúng tôi.',
        thankYouForTravelNeeds: 'Cảm ơn bạn đã chọn chúng tôi cho nhu cầu du lịch của bạn!',
        automatedConfirmation: 'Đây là email xác nhận tự động.',
        persons: 'người'
      }
    };
    return translations[language] || translations.en;
  }

  // Send booking notification to admin/company
  async sendAdminBookingNotification(db, booking, customerInfo, tourOrService, language = 'en') {
    try {
      console.log('[EmailService] Starting admin booking notification...');
      console.log('[EmailService] Booking:', booking);
      console.log('[EmailService] Customer:', customerInfo);
      console.log('[EmailService] Item:', tourOrService);
      console.log('[EmailService] Language:', language);

      const settings = await this.getEmailSettings(db);
      console.log('[EmailService] Email settings:', settings);

      // Check if admin notifications are enabled
      if (settings.booking_notification_enabled !== 'true') {
        console.log('Admin booking notifications are disabled');
        return;
      }

      console.log('[EmailService] Creating email transporter...');
      const transporter = this.createTransporter();
      console.log('[EmailService] Transporter created');

      const t = this.getEmailTranslations(language);

      // Prepare template variables
      const variables = {
        booking_number: booking.bookingNumber,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        item_title: tourOrService.title,
        item_type: booking.type,
        start_date: booking.startDate,
        total_travelers: booking.totalTravelers,
        total_amount: booking.totalAmount,
        currency: booking.currency,
        special_requests: booking.specialRequests || 'None',
        company_name: settings.company_name
      };

      const subject = this.replaceTemplateVariables(
        settings.admin_notification_subject,
        variables
      );

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.newBookingReceived} - ${tourOrService.title}
          </h2>
          
          <p>${t.aNewBookingHasBeenSubmitted}</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.customerInformation}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">${t.name}:</td>
                <td style="padding: 8px 0;">${customerInfo.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.email}:</td>
                <td style="padding: 8px 0;"><a href="mailto:${customerInfo.email}">${customerInfo.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.phone}:</td>
                <td style="padding: 8px 0;"><a href="tel:${customerInfo.phone}">${customerInfo.phone}</a></td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.bookingDetails}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">${t.bookingNumber}:</td>
                <td style="padding: 8px 0; font-family: monospace; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">${booking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${booking.type === 'tour' ? t.tour : t.service}:</td>
                <td style="padding: 8px 0;">${tourOrService.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.startDate}:</td>
                <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.travelers}:</td>
                <td style="padding: 8px 0;">${booking.totalTravelers} ${t.persons}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.totalAmount}:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">${currency.formatCurrency(booking.totalAmount)}</td>
              </tr>
              ${booking.specialRequests ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">${t.specialRequests}:</td>
                <td style="padding: 8px 0; background: #fef3c7; padding: 8px; border-radius: 4px;">${booking.specialRequests}</td>
              </tr>
              ` : ''}
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

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: settings.company_email,
        subject: subject,
        html: emailTemplate
      };

      console.log('[EmailService] Sending admin email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      await transporter.sendMail(mailOptions);

      console.log('[EmailService] Admin booking notification sent successfully');
    } catch (error) {
      console.error('Error sending admin booking notification:', error);
      console.error('Error details:', error.message, error.stack);
      throw error; // Re-throw to let the caller know it failed
    }
  }

  // Send confirmation email to customer
  async sendCustomerConfirmation(db, booking, customerInfo, tourOrService, language = 'en') {
    try {
      console.log('[EmailService] Starting customer confirmation...');
      console.log('[EmailService] Booking:', booking);
      console.log('[EmailService] Customer:', customerInfo);
      console.log('[EmailService] Item:', tourOrService);
      console.log('[EmailService] Language:', language);

      const settings = await this.getEmailSettings(db);
      console.log('[EmailService] Email settings:', settings);

      // Check if customer confirmations are enabled
      if (settings.customer_confirmation_enabled !== 'true') {
        console.log('Customer confirmation emails are disabled');
        return;
      }

      console.log('[EmailService] Creating email transporter...');
      const transporter = this.createTransporter();
      console.log('[EmailService] Transporter created');

      const t = this.getEmailTranslations(language);

      // Prepare template variables
      const variables = {
        booking_number: booking.bookingNumber,
        customer_name: customerInfo.name,
        item_title: tourOrService.title,
        item_type: booking.type,
        start_date: booking.startDate,
        total_travelers: booking.totalTravelers,
        total_amount: booking.totalAmount,
        currency: booking.currency,
        company_name: settings.company_name
      };

      const subject = this.replaceTemplateVariables(
        settings.customer_confirmation_subject,
        variables
      );

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.bookingRequestReceived} - ${tourOrService.title}
          </h2>
          
          <p>${t.dear} <strong>${customerInfo.name}</strong>,</p>
          
          <p>${t.thankYouForChoosing} ${settings.company_name}! ${t.weHaveReceivedYourBooking}</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.yourBookingDetails}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">${t.bookingNumber}:</td>
                <td style="padding: 8px 0; font-family: monospace; background: #e0e7ff; padding: 4px 8px; border-radius: 4px;">${booking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${booking.type === 'tour' ? t.tour : t.service}:</td>
                <td style="padding: 8px 0;">${tourOrService.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.startDate}:</td>
                <td style="padding: 8px 0;">${new Date(booking.startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.travelers}:</td>
                <td style="padding: 8px 0;">${booking.totalTravelers} ${t.persons}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.totalAmount}:</td>
                <td style="padding: 8px 0; color: #059669; font-weight: bold;">${currency.formatCurrency(booking.totalAmount)}</td>
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

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: customerInfo.email,
        subject: subject,
        html: emailTemplate
      };

      console.log('[EmailService] Sending customer email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      await transporter.sendMail(mailOptions);

      console.log('[EmailService] Customer confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending customer confirmation email:', error);
      console.error('Error details:', error.message, error.stack);
      throw error; // Re-throw to let the caller know it failed
    }
  }

  // Send booking status update email to customer
  async sendBookingStatusUpdate(db, booking, customerInfo, tourOrService, newStatus, notes = '') {
    try {
      const settings = await this.getEmailSettings(db);

      if (settings.customer_confirmation_enabled !== 'true') {
        return;
      }

      const transporter = this.createTransporter();

      const statusMessages = {
        confirmed: {
          title: 'Booking Confirmed!',
          message: 'Great news! Your booking has been confirmed.',
          color: '#22c55e',
          bgColor: '#f0fdf4'
        },
        contacted: {
          title: 'We\'ve Contacted You',
          message: 'Our team has reached out to you regarding your booking.',
          color: '#3b82f6',
          bgColor: '#eff6ff'
        },
        completed: {
          title: 'Booking Completed',
          message: 'Thank you for traveling with us! We hope you had a wonderful experience.',
          color: '#8b5cf6',
          bgColor: '#f5f3ff'
        },
        cancelled: {
          title: 'Booking Cancelled',
          message: 'Your booking has been cancelled as requested.',
          color: '#ef4444',
          bgColor: '#fef2f2'
        }
      };

      const statusInfo = statusMessages[newStatus] || {
        title: 'Booking Update',
        message: `Your booking status has been updated to: ${newStatus}`,
        color: '#6b7280',
        bgColor: '#f9fafb'
      };

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusInfo.color}; border-bottom: 2px solid ${statusInfo.color}; padding-bottom: 10px;">
            ${statusInfo.title}
          </h2>
          
          <p>Dear <strong>${customerInfo.name}</strong>,</p>
          
          <div style="background-color: ${statusInfo.bgColor}; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: ${statusInfo.color}; font-weight: bold;">${statusInfo.message}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Booking Information:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 140px;">Booking Number:</td>
                <td style="padding: 8px 0; font-family: monospace;">${booking.bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${booking.type === 'tour' ? 'Tour' : 'Service'}:</td>
                <td style="padding: 8px 0;">${tourOrService.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0; text-transform: capitalize; font-weight: bold; color: ${statusInfo.color};">${newStatus}</td>
              </tr>
            </table>
          </div>
          
          ${notes ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">Additional Notes:</h4>
            <p style="margin: 0; color: #92400e;">${notes}</p>
          </div>
          ` : ''}
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 18px; color: #2563eb;"><strong>${settings.company_name}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This is an automated update email.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: customerInfo.email,
        subject: `Booking Update - ${booking.bookingNumber}`,
        html: emailTemplate
      });

      console.log(`Booking status update email sent successfully for status: ${newStatus}`);
    } catch (error) {
      console.error('Error sending booking status update email:', error);
    }
  }
}

module.exports = new EmailService();
