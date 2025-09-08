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
  'We are always ready to help you plan the perfect trip. Contact us today!': 'Chúng tôi luôn sẵn sàng hỗ trợ bạn lên kế hoạch cho chuyến du lịch hoàn hảo. Hãy liên hệ với chúng tôi ngay hôm nay!',
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
  'Invalid email': 'Email không h��p lệ',
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
  'Your trusted travel partner for unforgettable adventures. We create personalized experiences that connect you with the world\'s most beautiful destinations.': 'Đối tác du lịch đáng tin cậy của bạn cho những cuộc phiêu lưu khó quên. Chúng tôi tạo ra những trải nghiệm cá nhân hóa kết nối bạn với những điểm đến đẹp nhất thế giới.',
  'Booking Policy': 'Chính Sách Đặt Tour',
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
  'December': 'Tháng Mười Hai',

  // Car Rental specific
  'Car Rental Services': 'Dịch Vụ Thuê Xe',
  'Premium vehicle fleet for your travel needs': 'Đội xe cao cấp cho nhu cầu du lịch của bạn',
  'Car Rentals': 'Thuê Xe',
  'Search car rentals...': 'Tìm kiếm dịch vụ thuê xe...',
  'View Mode': 'Chế Độ Xem',
  'Newest First': 'Mới Nhất Trước',
  'Oldest First': 'Cũ Nhất Trước',
  'Price: Low to High': 'Giá: Thấp Đến Cao',
  'Price: High to Low': 'Giá: Cao Đến Thấp',
  'Name: A to Z': 'Tên: A đến Z',
  'Name: Z to A': 'Tên: Z đến A',
  'Choose Your Vehicle': 'Chọn Xe Của Bạn',
  'Rental Duration': 'Thời Gian Thuê',
  'Pick-up Location': 'Địa Điểm Nhận Xe',
  'Drop-off Location': 'Địa Điểm Trả Xe',
  'Pick-up Date': 'Ngày Nhận Xe',
  'Drop-off Date': 'Ngày Trả Xe',
  'Driver Age': 'Tu���i Tài Xế',
  'With Driver': 'Có Tài Xế',
  'Self Drive': 'Tự Lái',
  'Book Vehicle': 'Đặt Xe',
  'Vehicle Type': 'Loại Xe',
  'Transmission': 'Hộp Số',
  'Automatic': 'Tự Động',
  'Manual': 'Số Sàn',
  'Fuel Type': 'Loại Nhiên Liệu',
  'Seats': 'Số Ghế',
  'Air Conditioning': 'Điều Hòa',
  'GPS Navigation': 'Định Vị GPS',
  'Insurance': 'Bảo Hiểm',
  'Unlimited Mileage': 'Không Giới Hạn Km',

  // About Page
  'Our Story': 'Câu Chuyện Của Chúng Tôi',
  'Our Mission': 'Sứ Mệnh',
  'Our Vision': 'Tầm Nhìn',
  'Our Team': 'Đội Ngũ',
  'Company History': 'Lịch Sử Công Ty',
  'Awards & Recognition': 'Giải Thưởng & Công Nhận',
  'Our Values': 'Giá Trị Cốt Lõi',
  'Quality Service': 'Dịch Vụ Chất Lượng',
  'Customer Satisfaction': 'Sự Hài Lòng Khách Hàng',
  'Sustainable Tourism': 'Du Lịch Bền Vững',
  'Local Expertise': 'Chuyên Môn Địa Phương',

  // Statistics & Numbers
  'Tours Completed': 'Tour Đã Hoàn Thành',
  'Countries Visited': 'Quốc Gia Đã Đến',
  'Tour Guides': 'Hướng Dẫn Viên',
  'Customer Rating': 'Đánh Giá Khách Hàng',
  'Positive Reviews': 'Đánh Giá Tích Cực',
  'Repeat Customers': 'Khách Hàng Quay Lại',

  // Tour Types & Categories
  'Adventure Tours': 'Tour Phiêu Lưu',
  'Cultural Tours': 'Tour Văn Hóa',
  'Food Tours': 'Tour Ẩm Thực',
  'Beach Tours': 'Tour Biển',
  'Mountain Tours': 'Tour Núi',
  'City Tours': 'Tour Thành Phố',
  'Historical Tours': 'Tour Lịch Sử',
  'Nature Tours': 'Tour Thiên Nhiên',
  'Photography Tours': 'Tour Chụp Ảnh',
  'Luxury Tours': 'Tour Cao Cấp',
  'Budget Tours': 'Tour Tiết Kiệm',
  'Family Tours': 'Tour Gia Đình',
  'Honeymoon Tours': 'Tour Tuần Trăng Mật',
  'Group Tours': 'Tour Nhóm',
  'Private Tours': 'Tour Riêng',

  // Booking Status
  'Available': 'Có Sẵn',
  'Sold Out': 'Hết Chỗ',
  'Last Few Spots': 'Còn Ít Chỗ',
  'Booking Confirmed': 'Đã Xác Nhận Đặt Tour',
  'Booking Pending': 'Đang Chờ Xác Nhận',
  'Booking Cancelled': 'Đã Hủy',
  'Payment Required': 'Cần Thanh Toán',
  'Payment Completed': 'Đã Thanh Toán',

  // Service Types
  'Transportation': 'Vận Chuyển',
  'Accommodation': 'Lưu Trú',
  'Tour Guide': 'Hướng D���n Viên',
  'Meals': 'Bữa Ăn',
  'Activities': 'Hoạt Động',
  'Equipment': 'Thiết Bị',
  'Entrance Fees': 'Phí Vào Cửa',

  // Difficulty Levels
  'Easy': 'Dễ',
  'Moderate': 'Trung Bình',
  'Challenging': 'Khó',
  'Difficult': 'Rất Khó',
  'Expert': 'Chuyên Gia',

  // Weather & Seasons
  'Best Time to Visit': 'Thời Gian Tốt Nhất',
  'Weather': 'Thời Tiết',
  'Spring': 'Mùa Xuân',
  'Summer': 'Mùa Hè',
  'Autumn': 'Mùa Thu',
  'Winter': 'Mùa Đông',
  'Rainy Season': 'Mùa Mưa',
  'Dry Season': 'Mùa Khô',

  // Additional Forms & Actions
  'Select Date': 'Chọn Ngày',
  'Select Time': 'Chọn Giờ',
  'Select Option': 'Chọn Tùy Chọn',
  'Choose Package': 'Chọn Gói',
  'Download Brochure': 'Tải Brochure',
  'Share Tour': 'Chia Sẻ Tour',
  'Add to Wishlist': 'Thêm Vào Danh Sách Yêu Thích',
  'Compare Tours': 'So Sánh Tour',
  'Print Itinerary': 'In Lịch Trình',
  'Send to Friend': 'Gửi Cho Bạn',

  // Social Media & Contact
  'Follow us on Facebook': 'Theo dõi chúng tôi trên Facebook',
  'Follow us on Instagram': 'Theo dõi chúng tôi trên Instagram',
  'Follow us on Twitter': 'Theo dõi chúng tôi trên Twitter',
  'Follow us on YouTube': 'Theo dõi chúng tôi trên YouTube',
  'Call Us': 'Gọi Cho Chúng Tôi',
  'Email Us': 'Gửi Email',
  'WhatsApp': 'WhatsApp',
  'Live Chat': 'Chat Trực Tuyến',

  // Error Messages & Validation
  'Please fill in all required fields': 'Vui lòng điền tất cả các trường bắt buộc',
  'Please select a valid date': 'Vui lòng chọn ngày hợp lệ',
  'Please enter a valid phone number': 'Vui lòng nhập số điện thoại hợp lệ',
  'Connection error': 'Lỗi kết nối',
  'Server error': 'Lỗi máy chủ',
  'No results found': 'Không tìm thấy kết quả',
  'Page not found': 'Không tìm thấy trang',

  // Currency & Payment
  'Currency': 'Tiền Tệ',
  'VND': 'VNĐ',
  'USD': 'USD',
  'Credit Card': 'Thẻ Tín Dụng',
  'Debit Card': 'Thẻ Ghi Nợ',
  'Bank Transfer': 'Chuyển Khoản',
  'Cash': 'Tiền Mặt',
  'Online Payment': 'Thanh Toán Online',
  'Installment': 'Trả Góp',
  'Deposit': 'Đặt Cọc',
  'Full Payment': 'Thanh Toán Đủ',
  'Refund': 'Hoàn Tiền',

  // Admin Panel
  'Dashboard': 'Bảng Điều Khiển',
  'Manage Tours': 'Quản Lý Tour',
  'Manage Bookings': 'Quản Lý Đặt Tour',
  'Manage Customers': 'Quản Lý Khách Hàng',
  'Manage Services': 'Quản Lý Dịch Vụ',
  'Manage Content': 'Quản Lý Nội Dung',
  'Settings': 'Cài Đặt',
  'Reports': 'Báo Cáo',
  'Statistics': 'Thống Kê',
  'User Management': 'Quản Lý Người Dùng',
  'Content Management': 'Quản Lý Nội Dung',
  'Upload Image': 'Tải Ảnh Lên',
  'Gallery': 'Thư Viện',
  'SEO Settings': 'Cài Đặt SEO',

  // Additional UI Elements
  'Show More': 'Hiển Thị Thêm',
  'Show Less': 'Hiển Thị Ít Hơn',
  'Expand': 'Mở Rộng',
  'Collapse': 'Thu Gọn',
  'Download': 'Tải Xuống',
  'Upload': 'Tải Lên',
  'Copy': 'Sao Chép',
  'Paste': 'Dán',
  'Select All': 'Chọn Tất Cả',
  'Deselect All': 'Bỏ Chọn Tất Cả',
  'Refresh': 'Làm Mới',
  'Reload': 'Tải Lại',

  // Responsive Design
  'Menu': 'Menu',
  'Toggle Navigation': 'Chuyển Đổi Điều Hướng',
  'Mobile Menu': 'Menu Di Động',
  'Desktop View': 'Chế Độ Desktop',
  'Mobile View': 'Chế Độ Di Động'
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
  const [isVietnamese, setIsVietnamese] = useState(false);

  const t = (key: string): string => {
    if (isVietnamese && vietnameseTranslations[key]) {
      return vietnameseTranslations[key];
    }
    return key; // Return the key itself if translation not found
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

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
