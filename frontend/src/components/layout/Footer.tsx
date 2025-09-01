import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { Icon, Icons } from '../common/Icons';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className={`${isDarkMode ? 'bg-dark-900' : 'bg-light-text-secondary'} ${isDarkMode ? 'text-dark-text-primary' : 'text-light-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/company_logo.png"
                alt="Company Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className={`mb-6 max-w-md ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              Đối tác du lịch đáng tin cậy của bạn cho những cuộc phiêu lưu khó quên.
              Chúng tôi tạo ra những trải nghiệm cá nhân hóa kết nối bạn với những điểm đến đẹp nhất thế giới.
            </p>
            <div className={`space-y-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              <div className="flex items-center">
                <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-2" />
                <span>123 Đường Du Lịch, Thành phố Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center">
                <Icon icon={Icons.FiPhone} className="w-4 h-4 mr-2" />
                <span>+84-123-456-789</span>
              </div>
              <div className="flex items-center">
                <Icon icon={Icons.FiMail} className="w-4 h-4 mr-2" />
                <span>info@travelworld.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>{t('Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tours" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('All Tours')}
                </Link>
              </li>
              <li>
                <Link to="/services" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('Services')}
                </Link>
              </li>
              <li>
                <Link to="/blogs" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('Blogs')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>{t('Our Services')}</h3>
            <ul className="space-y-2">
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Car Rental')}</span>
              </li>
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Hotel Booking')}</span>
              </li>
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Flight Booking')}</span>
              </li>
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Visa Services')}</span>
              </li>
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Travel Insurance')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                <Icon icon={Icons.FiFacebook} className="w-6 h-6" />
              </a>
              <a className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                <Icon icon={Icons.FiInstagram} className="w-6 h-6" />
              </a>
              <a className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                <Icon icon={Icons.FiTwitter} className="w-6 h-6" />
              </a>
              <a className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                <Icon icon={Icons.FiYoutube} className="w-6 h-6" />
              </a>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              © 2024 Travel World. {t('All rights reserved')}.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
