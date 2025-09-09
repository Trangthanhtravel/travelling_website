import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
        }`}
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          language === 'vi'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
        }`}
      >
        <span>🇻🇳</span>
        <span>VI</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
