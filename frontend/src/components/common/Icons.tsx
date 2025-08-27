import React from 'react';
import {
  // Navigation & UI
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiArrowRight,
  FiExternalLink,

  // Content & Media
  FiFileText,
  FiImage,
  FiCamera,
  FiVideo,
  FiEdit,
  FiEdit2,
  FiEye,
  FiEyeOff,

  // Actions
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSave,
  FiDownload,
  FiUpload,
  FiCopy,
  FiShare2,

  // Search & Filter
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,

  // Location & Travel
  FiMapPin,
  FiGlobe,
  FiCompass,
  FiNavigation,

  // Transportation
  FiTruck,

  // User & Account
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserCheck,

  // Time & Calendar
  FiClock,
  FiCalendar,

  // Communication
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiMessageCircle,

  // Status & Feedback
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,

  // Settings & Configuration
  FiSettings,
  FiSliders,

  // Business & Finance
  FiDollarSign,
  FiCreditCard,
  FiShoppingCart,

  // Home & Accommodation
  FiHome,

  // Marine & Water
  FiAnchor,

  // Documents & Files
  FiFile,
  FiFolder,

  // Star Rating
  FiStar,

  // Theme
  FiSun,
  FiMoon,

  // Social & Sharing
  FiHeart,
  FiThumbsUp,
    FiFacebook,
    FiInstagram,
    FiTwitter,

  // Loading & Status
  FiLoader,
  FiRefreshCw,

  // Authentication
  FiLogOut,
  FiLogIn,
    FiLock,
    FiEdit3,
    FiPlay,
    FiBarChart,
    FiSend,
    FiPackage,
    FiRepeat,
    FiTag,
    FiShare,
} from 'react-icons/fi';
import { IconType } from 'react-icons';

// Icon interface for type safety
interface IconProps {
  icon: IconType;
  className?: string;
  onClick?: () => void;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, className, onClick, size }) => {
  return React.createElement(IconComponent as React.ComponentType<any>, { className, onClick, size });
};

// Export all icons for easy access
export const Icons = {
  // Navigation & UI
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiArrowRight,
  FiExternalLink,

  // Content & Media
  FiFileText,
  FiImage,
  FiCamera,
  FiVideo,
  FiEdit,
  FiEdit2,
  FiEye,
  FiEyeOff,

  // Actions
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSave,
  FiDownload,
  FiUpload,
  FiCopy,
  FiShare2,

  // Search & Filter
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,

  // Location & Travel
  FiMapPin,
  FiGlobe,
  FiCompass,
  FiNavigation,

  // Transportation
  FiTruck,

  // User & Account
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserCheck,

  // Time & Calendar
  FiClock,
  FiCalendar,

  // Communication
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiMessageCircle,

  // Status & Feedback
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,

  // Settings & Configuration
  FiSettings,
  FiSliders,

  // Business & Finance
  FiDollarSign,
  FiCreditCard,
  FiShoppingCart,

  // Home & Accommodation
  FiHome,

  // Marine & Water
  FiAnchor,

  // Documents & Files
  FiFile,
  FiFolder,

  // Star Rating
  FiStar,

  // Theme
  FiSun,
  FiMoon,

  // Social & Sharing
  FiHeart,
  FiThumbsUp,
    FiFacebook,
    FiInstagram,
    FiTwitter,

  // Loading & Status
  FiLoader,
  FiRefreshCw,

  // Authentication
  FiLogOut,
  FiLogIn,

    FiLock,
    FiEdit3,
    FiPlay,
    FiBarChart,
    FiSend,
    FiPackage,
    FiRepeat,
    FiTag,
    FiShare,
};

export default Icons;