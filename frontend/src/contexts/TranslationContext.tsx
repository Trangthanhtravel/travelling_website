import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Translations {
  [key: string]: string;
}

const vietnameseTranslations: Translations = {
  // Navigation
  'Home': 'Trang Chủ',
  'Tours': 'Tour Du Lịch',
  'Services': 'Dịch Vụ',
  'Blogs': 'Tin Tức',
  'Contact': 'Liên Hệ',
  'Admin': 'Quản Trị',
  'Admin Dashboard': 'Bảng Điều Khiển',
  'Logout': 'Đăng Xuất',
  'Login': 'Đăng Nhập',

  // Common Actions
  'Book Now': 'Đặt Ngay',
  'Learn More': 'Tìm Hiểu Thêm',
  'Read More': 'Đọc Thêm',
  'View More': 'Xem Thêm',
  'View Details': 'Xem Chi Tiết',
  'Submit': 'Gửi',
  'Send Message': 'Gửi Tin Nhắn',
  'Search': 'Tìm Kiếm',
  'Filter': 'Lọc',
  'Sort': 'Sắp Xếp',
  'Clear': 'Xóa',
  'Cancel': 'Hủy',
  'Close': 'Đóng',
  'Save': 'Lưu',
  'Edit': 'Chỉnh Sửa',
  'Delete': 'Xóa',
  'Add': 'Thêm',
  'Update': 'Cập Nhật',
  'Back': 'Quay Lại',
  'Next': 'Tiếp Theo',
  'Previous': 'Trước',

  // Home Page
  'Welcome to': 'Chào Mừng Đến Với',
  'Discover Amazing Tours': 'Khám Phá Những Tour Tuyệt Vời',
  'Explore the world with our expert guides': 'Khám phá thế giới cùng hướng dẫn viên chuyên nghiệp',
  'Get started on your next adventure': 'Bắt đầu cuộc phiêu lưu tiếp theo của bạn',
  'Featured Tours': 'Tour Nổi Bật',
  'Popular Destinations': 'Điểm Đến Phổ Biến',
  'Why Choose Us': 'Tại Sao Chọn Chúng Tôi',
  'Our Services': 'Dịch Vụ Của Chúng Tôi',
  'Happy Customers': 'Khách Hàng Hài Lòng',
  'Years of Experience': 'Năm Kinh Nghiệm',
  'Successful Trips': 'Chuyến Đi Thành Công',
  'Google Review': 'Đánh Giá Google',
  'Customer Reviews': 'Đánh Giá Khách Hàng',
  'Latest News': 'Tin Tức Mới Nhất',

  // Tours Page
  'All Tours': 'Tất Cả Tour',
  'Tour Categories': 'Danh Mục Tour',
  'Duration': 'Thời Gian',
  'Price': 'Giá',
  'Difficulty': 'Độ Khó',
  'Group Size': 'Kích Thước Nhóm',
  'Tour Details': 'Chi Tiết Tour',
  'Itinerary': 'Lịch Trình',
  'Inclusions': 'Bao Gồm',
  'Exclusions': 'Không Bao Gồm',
  'What to Bring': 'Những Gì Cần Mang',
  'Tour Gallery': 'Thư Viện Ảnh Tour',
  'Similar Tours': 'Tour Tương Tự',
  'days': 'ngày',
  'day': 'ngày',
  'nights': 'đêm',
  'night': 'đêm',
  'from': 'từ',
  'per person': 'mỗi người',

  // Services Page
  'Our Professional Services': 'Dịch Vụ Chuyên Nghiệp',
  'Car Rental': 'Thuê Xe',
  'Hotel Booking': 'Đặt Khách Sạn',
  'Flight Booking': 'Đặt Vé Máy Bay',
  'Visa Services': 'Dịch Vụ Visa',
  'Travel Insurance': 'Bảo Hiểm Du Lịch',
  'Event Planning': 'Tổ Chức Sự Kiện',
  'Service Details': 'Chi Tiết Dịch Vụ',
  'Available Services': 'Dịch Vụ Có Sẵn',

  // Contact Page
  'Get in Touch': 'Liên Hệ Với Chúng Tôi',
  'Contact Information': 'Thông Tin Liên Hệ',
  'Send us a Message': 'Gửi Tin Nhắn Cho Chúng Tôi',
  'Full Name': 'Họ và Tên',
  'Email Address': 'Địa Chỉ Email',
  'Phone Number': 'Số Điện Thoại',
  'Subject': 'Chủ Đề',
  'Message': 'Tin Nhắn',
  'Your message': 'Tin nhắn của bạn',
  'Office Address': 'Địa Chỉ Văn Phòng',
  'Business Hours': 'Giờ Làm Việc',
  'Monday - Friday': 'Thứ Hai - Thứ Sáu',
  'Saturday': 'Thứ Bảy',
  'Sunday': 'Chủ Nhật',
  'Closed': 'Đóng Cửa',

  // Booking Page
  'Book Your Tour': 'Đặt Tour Của Bạn',
  'Booking Details': 'Chi Tiết Đặt Tour',
  'Personal Information': 'Thông Tin Cá Nhân',
  'Travel Date': 'Ngày Du Lịch',
  'Number of Travelers': 'Số Lượng Du Khách',
  'Adults': 'Người Lớn',
  'Children': 'Trẻ Em',
  'Special Requirements': 'Yêu Cầu Đặc Biệt',
  'Total Price': 'Tổng Giá',
  'Confirm Booking': 'Xác Nhận Đặt Tour',
  'Booking Summary': 'Tóm Tắt Đặt Tour',
  'Payment Method': 'Phương Thức Thanh Toán',

  // Blog Page
  'Latest Articles': 'Bài Viết Mới Nhất',
  'Travel Tips': 'Mẹo Du Lịch',
  'Destinations': 'Điểm Đến',
  'Travel Guides': 'Hướng Dẫn Du Lịch',
  'Published on': 'Xuất Bản Vào',
  'Read Time': 'Thời Gian Đọc',
  'minutes': 'phút',
  'Related Articles': 'Bài Viết Liên Quan',
  'Share Article': 'Chia Sẻ Bài Viết',
  'Categories': 'Danh Mục',
  'Tags': 'Thẻ',

  // Form Validation
  'Name is required': 'Tên là bắt buộc',
  'Email is required': 'Email là bắt buộc',
  'Invalid email': 'Email không hợp lệ',
  'Subject is required': 'Chủ đề là bắt buộc',
  'Message is required': 'Tin nhắn là bắt buộc',
  'Message must be at least 10 characters': 'Tin nhắn phải có ít nhất 10 ký tự',
  'Phone number is required': 'Số điện thoại là bắt buộc',
  'Date is required': 'Ngày là bắt buộc',

  // Success/Error Messages
  'Message sent successfully!': 'Tin nhắn đã được gửi thành công!',
  'We\'ll get back to you soon.': 'Chúng tôi sẽ liên hệ lại với bạn sớm.',
  'Failed to send message. Please try again.': 'Không thể gửi tin nhắn. Vui lòng thử lại.',
  'Booking confirmed successfully!': 'Đặt tour thành công!',
  'Something went wrong. Please try again.': 'Có lỗi xảy ra. Vui lòng thử lại.',
  'Loading...': 'Đang tải...',

  // Footer
  'About Us': 'Về Chúng Tôi',
  'Quick Links': 'Liên Kết Nhanh',
  'Follow Us': 'Theo Dõi Chúng Tôi',
  'Newsletter': 'Bản Tin',
  'Subscribe to our newsletter': 'Đăng ký nhận bản tin của chúng tôi',
  'Enter your email': 'Nhập email của bạn',
  'Subscribe': 'Đăng Ký',
  'Privacy Policy': 'Chính Sách Bảo Mật',
  'Terms of Service': 'Điều Khoản Dịch Vụ',
  'All rights reserved': 'Tất cả quyền được bảo lưu',

  // Common Descriptions
  'Professional tour guides': 'Hướng dẫn viên chuyên nghiệp',
  'Best price guarantee': 'Đảm bảo giá tốt nhất',
  '24/7 customer support': 'Hỗ trợ khách hàng 24/7',
  'Secure booking': 'Đặt tour an toàn',
  'Free cancellation': 'Hủy miễn phí',
  'No hidden fees': 'Không có phí ẩn',

  // Time and Date
  'Today': 'Hôm nay',
  'Yesterday': 'Hôm qua',
  'Tomorrow': 'Ngày mai',
  'Week': 'Tuần',
  'Month': 'Tháng',
  'Year': 'Năm',
  'January': 'Tháng Một',
  'February': 'Tháng Hai',
  'March': 'Tháng Ba',
  'April': 'Tháng Tư',
  'May': 'Tháng Năm',
  'June': 'Tháng Sáu',
  'July': 'Tháng Bảy',
  'August': 'Tháng Tám',
  'September': 'Tháng Chín',
  'October': 'Tháng Mười',
  'November': 'Tháng Mười Một',
  'December': 'Tháng Mười Hai'
};

interface TranslationContextType {
  t: (key: string) => string;
  isVietnamese: boolean;
  toggleLanguage: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [isVietnamese, setIsVietnamese] = useState(true); // Default to Vietnamese

  const t = (key: string): string => {
    if (!isVietnamese) {
      return key; // Return original English text
    }
    return vietnameseTranslations[key] || key;
  };

  const toggleLanguage = () => {
    setIsVietnamese(!isVietnamese);
  };

  return (
    <TranslationContext.Provider value={{ t, isVietnamese, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
