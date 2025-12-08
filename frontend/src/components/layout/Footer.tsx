import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { Icon, Icons } from '../common/Icons';
import { useContactInfo } from '../../hooks/useContactInfo';

const currentYear = new Date().getFullYear();

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const { contactInfo } = useContactInfo();

  return (
    <footer className={`${isDarkMode ? 'bg-dark-900' : 'bg-light-text-secondary'} ${isDarkMode ? 'text-dark-text-primary' : 'text-light-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/B_Primary_logo_dark_theme_blue_background.png"
                alt="Company Logo"
                className="h-24 w-auto"
              />
            </div>
            <div className={`space-y-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              <div className="flex items-center">
                <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-2" />
                <span>{contactInfo?.address || t('193 Co Bac, Cau Ong Lanh Ward, Ho Chi Minh City, Vietnam')}</span>
              </div>
              <div className="flex items-center">
                <Icon icon={Icons.FiPhone} className="w-4 h-4 mr-2" />
                <span>{contactInfo?.phone || t('(+84) 28 38 388 007')}</span>
              </div>
                <div className="flex items-center">
                    <Icon icon={Icons.FiPrinter} className="w-4 h-4 mr-2" />
                    <span>{contactInfo?.phone || t('(+84) 28 38 388 007')}</span>
                </div>
              <div className="flex items-center">
                <Icon icon={Icons.FiMail} className="w-4 h-4 mr-2" />
                <span>{contactInfo?.email || 'goodtrip@trangthanhtravel.com.vn'}</span>
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
                  {t('News')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('Contact')}
                </Link>
              </li>
              <li>
                <Link to="/booking-policy" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  {t('Booking Policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>{t('Our Services')}</h3>
            <ul className="space-y-2">
              <li>
                <span className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>{t('Private Car Rental')}</span>
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
            <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              © {currentYear} Trang Thanh Travel. {t('All rights reserved')}.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
