import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from './Icons';

interface SocialLink {
    id: number;
    platform: 'facebook' | 'zalo' | 'email' | 'phone';
    url: string;
    display_text?: string;
    icon?: string;
    is_active: boolean;
    sort_order: number;
}

const SocialChatBox: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const fetchSocialLinks = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/social-links/public`);
            const data = await response.json();

            if (data.success) {
                setSocialLinks(data.data);
            }
        } catch (error) {
            console.error('Error fetching social links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'facebook':
                return Icons.FiFacebook;
            case 'zalo':
                return Icons.FiMessageCircle; // Using message circle for Zalo
            case 'email':
                return Icons.FiMail;
            case 'phone':
                return Icons.FiPhone;
            default:
                return Icons.FiMessageCircle;
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'facebook':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'zalo':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'email':
                return 'bg-gray-600 hover:bg-gray-700';
            case 'phone':
                return 'bg-green-600 hover:bg-green-700';
            default:
                return 'bg-accent-orange hover:bg-accent-orange-hover';
        }
    };

    const handleSocialClick = (link: SocialLink) => {
        let url = link.url;

        // Handle different platform URL formats
        switch (link.platform) {
            case 'email':
                if (!url.startsWith('mailto:')) {
                    url = `mailto:${url}`;
                }
                break;
            case 'phone':
                if (!url.startsWith('tel:')) {
                    url = `tel:${url}`;
                }
                break;
            case 'facebook':
                if (!url.startsWith('http')) {
                    url = `https://facebook.com/${url}`;
                }
                break;
            case 'zalo':
                if (!url.startsWith('http')) {
                    url = `https://zalo.me/${url}`;
                }
                break;
        }

        if (link.platform === 'email' || link.platform === 'phone') {
            window.location.href = url;
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (isLoading || socialLinks.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {/* Social Links */}
            <div className={`mb-4 space-y-3 transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
                {socialLinks.map((link) => (
                    <div
                        key={link.id}
                        className="flex items-center justify-end"
                    >
                        {/* Tooltip */}
                        <div className={`mr-3 px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 ${
                            isDarkMode 
                                ? 'bg-dark-800 text-dark-text-primary border border-dark-700' 
                                : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                            {link.display_text || link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        </div>

                        {/* Social Icon Button */}
                        <button
                            onClick={() => handleSocialClick(link)}
                            className={`w-12 h-12 rounded-full ${getPlatformColor(link.platform)} text-white shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center`}
                            aria-label={`Contact via ${link.platform}`}
                        >
                            <Icon
                                icon={getPlatformIcon(link.platform)}
                                className="w-5 h-5"
                            />
                        </button>
                    </div>
                ))}
            </div>

            {/* Main Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full bg-accent-orange hover:bg-accent-orange-hover text-white shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                    isOpen ? 'rotate-45' : 'rotate-0'
                }`}
                aria-label="Toggle contact options"
            >
                <Icon
                    icon={isOpen ? Icons.FiX : Icons.FiMessageCircle}
                    className="w-6 h-6"
                />
            </button>
        </div>
    );
};

export default SocialChatBox;
