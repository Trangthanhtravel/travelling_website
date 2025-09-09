import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
        language === 'vi'
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
      title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
    >
      <span className="text-base">
        {language === 'en' ? '🇺🇸' : '🇻🇳'}
      </span>
      <span className="font-semibold">
        {language === 'en' ? 'EN' : 'VI'}
      </span>
      <svg
        className="w-3 h-3 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    </button>
  );
};

export default LanguageSwitcher;
