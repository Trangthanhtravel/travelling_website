import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { Icon, Icons } from '../common/Icons';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { state, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useTranslation(); // Use the correct interface
    const navigate = useNavigate();

    // Handle scroll to change header background
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Helper functions for mobile menu
    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'vi' : 'en');
    };

    const isVietnamese = language === 'vi';

    const navigation = [
        { name: t('Home'), href: '/' },
        { name: t('Tours'), href: '/tours' },
        { name: t('Car Rental'), href: '/car-rental' },
        { name: t('Services'), href: '/services' },
        { name: t('Blogs'), href: '/blogs' },
        { name: t('Contact'), href: '/contact' },
        { name: t('About Us'), href: '/about' },
    ];

    const logoTextClasses = isScrolled
        ? `transition-colors duration-300 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`
        : `transition-colors duration-300 ${isDarkMode ? 'text-dark-text-secondary drop-shadow-lg' : 'text-light-text-primary drop-shadow-lg'}`;

    const navLinkClasses = isScrolled
        ? `px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${isDarkMode ? 'text-dark-text-primary hover:text-accent-orange' : 'text-light-text-secondary hover:text-accent-orange'}`
        : `px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${isDarkMode ? 'text-dark-text-secondary hover:text-accent-orange drop-shadow-md' : 'text-light-text-primary hover:text-accent-orange drop-shadow-md'}`;

    const buttonClasses = isScrolled
        ? `p-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-700' : 'bg-light-200 text-light-text-secondary hover:bg-light-300'}`
        : `p-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-dark-text-secondary/20 text-dark-text-secondary hover:bg-dark-text-secondary/30 backdrop-blur-sm border border-dark-text-secondary/10' : 'bg-light-text-primary/20 text-light-text-primary hover:bg-light-text-primary/30 backdrop-blur-sm'}`;

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled 
                ? `${isDarkMode ? 'bg-dark-900/95 backdrop-blur-md border-dark-800' : 'bg-light-50/95 backdrop-blur-md border-light-300'} border-b shadow-lg`
                : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src="/company_logo.png"
                                alt="Company Logo"
                                className={`h-10 w-auto ${logoTextClasses}`}
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Navigation Links */}
                        <div className="flex space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={navLinkClasses}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Theme Toggle */}<Link
                        to="/admin/login"
                        className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-text-muted hover:text-light-text-primary'}`}
                    >
                        {t('Admin')}
                    </Link>


                        {/* Admin/Auth Section */}
                        {state.isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/admin"
                                    className="flex items-center space-x-2 px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-accent-orange-dark transition-colors duration-300"
                                >
                                    <Icon icon={Icons.FiSettings} className="w-4 h-4" />
                                    <span>{t('Admin Dashboard')}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-4 py-2 border border-accent-orange text-accent-orange rounded-lg hover:bg-accent-orange hover:text-white transition-colors duration-300"
                                >
                                    <Icon icon={Icons.FiLogOut} className="w-4 h-4" />
                                    <span>{t('Logout')}</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/admin/login"
                                className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-text-muted hover:text-light-text-primary'}`}
                            >
                                {t('Admin')}
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleTheme}
                            className={buttonClasses}
                        >
                            <Icon icon={isDarkMode ? Icons.FiSun : Icons.FiMoon} className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={buttonClasses}
                        >
                            <Icon icon={isMenuOpen ? Icons.FiX : Icons.FiMenu} className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className={`md:hidden ${isDarkMode ? 'bg-dark-900' : 'bg-light-50'} border-t ${isDarkMode ? 'border-dark-800' : 'border-light-300'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block px-3 py-2 text-base font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-secondary' : 'text-light-text-secondary hover:text-light-text-primary'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Mobile Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-secondary' : 'text-light-text-secondary hover:text-light-text-primary'}`}
                        >
                            {isVietnamese ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                        </button>

                        {/* Mobile Admin Section */}
                        {state.isAuthenticated && state.admin ? (
                            <>
                                <Link
                                    to="/admin/dashboard"
                                    className={`block px-3 py-2 text-base font-medium transition-colors ${isDarkMode ? 'text-accent-orange hover:text-accent-orange-hover' : 'text-accent-orange hover:text-accent-orange-hover'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t('Admin Dashboard')}
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-text-muted hover:text-light-text-primary'}`}
                                >
                                    {t('Logout')}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/admin/login"
                                className={`block px-3 py-2 text-base font-medium transition-colors ${isDarkMode ? 'text-dark-text-muted hover:text-dark-text-primary' : 'text-light-text-muted hover:text-light-text-primary'}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t('Admin')}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;