import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../common/Icons';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();

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
              Your trusted travel partner for unforgettable adventures. We create personalized
              experiences that connect you with the world's most beautiful destinations.
            </p>
            <div className={`space-y-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
              <div className="flex items-center">
                <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-2" />
                <span>123 Travel Street, Ho Chi Minh City, Vietnam</span>
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
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tours" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  All Tours
                </Link>
              </li>
              <li>
                <Link to="/services" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blogs" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Travel Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/booking-policy" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Booking Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className={`border-t mt-8 pt-8 ${isDarkMode ? 'border-dark-800' : 'border-light-300'}`}>
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-4 lg:mb-0">
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-50'}`}>Stay Updated</h3>
              <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>Subscribe to our newsletter for travel tips and exclusive offers.</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 lg:w-64 px-4 py-2 rounded-l-lg border focus:outline-none focus:border-accent-orange transition-colors ${
                  isDarkMode 
                    ? 'bg-dark-800 border-dark-700 text-dark-text-primary placeholder-dark-text-muted' 
                    : 'bg-light-50 border-light-300 text-light-text-primary placeholder-light-text-muted'
                }`}
              />
              <button className="px-6 py-2 bg-accent-orange hover:bg-accent-orange-hover rounded-r-lg font-medium text-white transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className={`border-t mt-8 pt-8 flex flex-col lg:flex-row justify-between items-center ${isDarkMode ? 'border-dark-800' : 'border-light-300'}`}>
          <div className="flex space-x-4 mb-4 lg:mb-0">
            <button type="button" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
              <Icon icon={Icons.FiFacebook} className="w-5 h-5" />
            </button>
            <button type="button" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
              <Icon icon={Icons.FiInstagram} className="w-5 h-5" />
            </button>
            <button type="button" className={`transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-200 hover:text-light-50'}`}>
              <Icon icon={Icons.FiTwitter} className="w-5 h-5" />
            </button>
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-200'}`}>
            <p>&copy; 2025 TravelWorld. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
