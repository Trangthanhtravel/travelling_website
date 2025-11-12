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

  // Send contact form notification to admin
  async sendContactNotificationToAdmin(db, contactData, language = 'en') {
    try {
      console.log('[EmailService] Starting contact notification to admin...');

      const settings = await this.getEmailSettings(db);
      console.log('[EmailService] Email settings:', settings);

      // Check if contact notifications are enabled
      if (settings.contact_notification_enabled !== 'true') {
        console.log('Contact notifications are disabled');
        return;
      }

      const transporter = this.createTransporter();
      const t = this.getContactEmailTranslations(language);

      const variables = {
        customer_name: contactData.name,
        customer_email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        company_name: settings.company_name
      };

      const subject = this.replaceTemplateVariables(
        settings.contact_notification_subject || 'New Contact Form Submission - {subject}',
        variables
      );

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.newContactMessage}
          </h2>
          
          <p>${t.newMessageReceived}</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.senderInformation}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">${t.name}:</td>
                <td style="padding: 8px 0;">${contactData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.email}:</td>
                <td style="padding: 8px 0;"><a href="mailto:${contactData.email}">${contactData.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">${t.subject}:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${contactData.subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.messageContent}</h3>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${contactData.message}</p>
            </div>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">${t.actionRequired}</p>
            <p style="margin: 5px 0 0 0;">${t.pleaseRespond}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            ${t.automatedNotification} ${settings.company_name} ${t.contactSystem}
          </p>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: settings.company_email,
        replyTo: contactData.email,
        subject: subject,
        html: emailTemplate
      };

      console.log('[EmailService] Sending contact notification to admin:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      await transporter.sendMail(mailOptions);
      console.log('[EmailService] Contact notification sent to admin successfully');
    } catch (error) {
      console.error('Error sending contact notification to admin:', error);
      throw error;
    }
  }

  // Send contact confirmation to customer
  async sendContactConfirmationToCustomer(db, contactData, language = 'en') {
    try {
      console.log('[EmailService] Starting contact confirmation to customer...');

      const settings = await this.getEmailSettings(db);
      console.log('[EmailService] Email settings:', settings);

      // Check if contact confirmations are enabled
      if (settings.contact_confirmation_enabled !== 'true') {
        console.log('Contact confirmations are disabled');
        return;
      }

      const transporter = this.createTransporter();
      const t = this.getContactEmailTranslations(language);

      const variables = {
        customer_name: contactData.name,
        subject: contactData.subject,
        company_name: settings.company_name
      };

      const subject = this.replaceTemplateVariables(
        settings.contact_confirmation_subject || 'We Received Your Message - {subject}',
        variables
      );

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${t.messageReceived}
          </h2>
          
          <p>${t.dear} <strong>${contactData.name}</strong>,</p>
          
          <p>${t.thankYouForContacting} ${settings.company_name}! ${t.weHaveReceivedYourMessage}</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #15803d; font-weight: bold;">${t.messageConfirmed}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">${t.yourMessage}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 100px;">${t.subject}:</td>
                <td style="padding: 8px 0; color: #2563eb; font-weight: bold;">${contactData.subject}</td>
              </tr>
            </table>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; white-space: pre-wrap; color: #6b7280;">${contactData.message}</p>
            </div>
          </div>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">${t.whatHappensNext}</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>${t.teamWillReview}</li>
              <li>${t.contactWithin24Hours}</li>
              <li>${t.checkSpamFolder}</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>${t.important}:</strong> ${t.keepThisEmail}</p>
          </div>
          
          <p>${t.urgentMatters}</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 18px; color: #2563eb;"><strong>${settings.company_name}</strong></p>
            <p style="margin: 5px 0;">${t.thankYouForReachingOut}</p>
            <p style="margin: 0; font-size: 14px;">${t.automatedConfirmation}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: contactData.email,
        subject: subject,
        html: emailTemplate
      };

      console.log('[EmailService] Sending contact confirmation to customer:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      await transporter.sendMail(mailOptions);
      console.log('[EmailService] Contact confirmation sent to customer successfully');
    } catch (error) {
      console.error('Error sending contact confirmation to customer:', error);
      throw error;
    }
  }

  // Get translations for contact email templates
  getContactEmailTranslations(language = 'en') {
    const translations = {
      en: {
        newContactMessage: 'New Contact Form Message',
        newMessageReceived: 'A new message has been submitted through the contact form.',
        senderInformation: 'Sender Information:',
        messageContent: 'Message Content:',
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        actionRequired: 'Action Required:',
        pleaseRespond: 'Please respond to this inquiry within 24 hours.',
        automatedNotification: 'This is an automated notification from',
        contactSystem: 'contact system.',
        messageReceived: 'Message Received - We\'ll Be In Touch Soon!',
        dear: 'Dear',
        thankYouForContacting: 'Thank you for contacting',
        weHaveReceivedYourMessage: 'We have successfully received your message and our team will review it shortly.',
        messageConfirmed: 'Your message has been received and is being reviewed by our team.',
        yourMessage: 'Your Message:',
        whatHappensNext: 'What happens next?',
        teamWillReview: 'Our team will review your message carefully',
        contactWithin24Hours: 'We\'ll respond to your inquiry within 24 hours',
        checkSpamFolder: 'Please check your spam folder if you don\'t see our response',
        important: 'Important',
        keepThisEmail: 'Please keep this email for your records. You can reply directly to this email if you have additional questions.',
        urgentMatters: 'For urgent matters, please feel free to call us directly.',
        thankYouForReachingOut: 'Thank you for reaching out to us!',
        automatedConfirmation: 'This is an automated confirmation email.'
      },
      vi: {
        newContactMessage: 'Tin Nhắn Liên Hệ Mới',
        newMessageReceived: 'Một tin nhắn mới đã được gửi qua biểu mẫu liên hệ.',
        senderInformation: 'Thông Tin Người Gửi:',
        messageContent: 'Nội Dung Tin Nhắn:',
        name: 'Họ Tên',
        email: 'Email',
        subject: 'Tiêu Đề',
        actionRequired: 'Cần Thực Hiện:',
        pleaseRespond: 'Vui lòng phản hồi yêu cầu này trong vòng 24 giờ.',
        automatedNotification: 'Đây là thông báo tự động từ hệ thống liên hệ của',
        contactSystem: '',
        messageReceived: 'Đã Nhận Tin Nhắn - Chúng Tôi Sẽ Liên Hệ Sớm!',
        dear: 'Kính gửi',
        thankYouForContacting: 'Cảm ơn bạn đã liên hệ với',
        weHaveReceivedYourMessage: 'Chúng tôi đã nhận được tin nhắn của bạn và đội ngũ sẽ xem xét ngay.',
        messageConfirmed: 'Tin nhắn của bạn đã được nhận và đang được đội ngũ của chúng tôi xem xét.',
        yourMessage: 'Tin Nhắn Của Bạn:',
        whatHappensNext: 'Các bước tiếp theo?',
        teamWillReview: 'Đội ngũ của chúng tôi sẽ xem xét tin nhắn của bạn cẩn thận',
        contactWithin24Hours: 'Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 24 giờ',
        checkSpamFolder: 'Vui lòng kiểm tra thư mục spam nếu bạn không thấy phản hồi của chúng tôi',
        important: 'Quan Trọng',
        keepThisEmail: 'Vui lòng lưu email này để theo dõi. Bạn có thể trả lời trực tiếp email này nếu có thêm câu hỏi.',
        urgentMatters: 'Đối với các vấn đề khẩn cấp, vui lòng gọi trực tiếp cho chúng tôi.',
        thankYouForReachingOut: 'Cảm ơn bạn đã liên hệ với chúng tôi!',
        automatedConfirmation: 'Đây là email xác nhận tự động.'
      }
    };
    return translations[language] || translations.en;
  }

  // Send admin invitation email with credentials
  async sendAdminInvitationEmail(db, adminData) {
    try {
      console.log('[EmailService] Starting admin invitation email...');

      const settings = await this.getEmailSettings(db);
      const transporter = this.createTransporter();

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Welcome to ${settings.company_name} Admin Team!
          </h2>
          
          <p>Dear <strong>${adminData.name}</strong>,</p>
          
          <p>You have been assigned as an administrator for ${settings.company_name}. This role allows you to manage tours, services, bookings, and content on the platform.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Your Admin Credentials:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Email:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #2563eb;">${adminData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Password:</td>
                <td style="padding: 8px 0; font-family: monospace; background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;">${adminData.password}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">⚠️ Important Security Notice:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #dc2626;">
              <li>Please change your password immediately after your first login</li>
              <li>Do not share your credentials with anyone</li>
              <li>Keep this email in a secure location or delete it after changing your password</li>
            </ul>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #15803d; margin-top: 0;">Admin Permissions:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #15803d;">
              <li>Manage tours and services</li>
              <li>View and update bookings</li>
              <li>Manage blog posts and content</li>
              <li>Receive booking and contact form notifications</li>
              <li>Update website content and settings</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Note:</h3>
            <p style="margin: 0; color: #92400e;">As an admin, you can perform most operations but cannot delete data or assign new administrators. Only super admins have those privileges.</p>
          </div>
          
          <p>If you have any questions or need assistance, please contact the super admin who assigned you this role.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 18px; color: #2563eb;"><strong>${settings.company_name}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This is an automated invitation email.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: adminData.email,
        subject: `Admin Access Granted - ${settings.company_name}`,
        html: emailTemplate
      };

      await transporter.sendMail(mailOptions);
      console.log('[EmailService] Admin invitation email sent successfully');
    } catch (error) {
      console.error('Error sending admin invitation email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(db, adminData) {
    try {
      console.log('[EmailService] Starting password reset email...');

      const settings = await this.getEmailSettings(db);
      const transporter = this.createTransporter();

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Password Reset - ${settings.company_name}
          </h2>
          
          <p>Dear <strong>${adminData.name}</strong>,</p>
          
          <p>Your password has been reset by a super administrator. Below are your new login credentials:</p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">New Login Credentials:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Email:</td>
                <td style="padding: 8px 0; font-family: monospace; color: #2563eb;">${adminData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">New Password:</td>
                <td style="padding: 8px 0; font-family: monospace; background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;">${adminData.password}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #dc2626; font-weight: bold;">⚠️ Important Security Notice:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #dc2626;">
              <li>Please change this password immediately after logging in</li>
              <li>Choose a strong, unique password</li>
              <li>Do not share your credentials with anyone</li>
              <li>Delete this email after changing your password</li>
            </ul>
          </div>
          
          <p>If you did not request this password reset, please contact the super administrator immediately.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 18px; color: #2563eb;"><strong>${settings.company_name}</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This is an automated password reset email.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"${settings.email_from_name}" <${process.env.EMAIL_USER}>`,
        to: adminData.email,
        subject: `Password Reset - ${settings.company_name}`,
        html: emailTemplate
      };

      await transporter.sendMail(mailOptions);
      console.log('[EmailService] Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
