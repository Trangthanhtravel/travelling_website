import React, { useState } from 'react';
import { Icon, Icons } from './Icons';

interface BilingualInputProps {
  label: string;
  name: string;
  value: {
    en: string;
    vi: string;
  };
  onChange: (name: string, value: { en: string; vi: string }) => void;
  type?: 'text' | 'textarea' | 'array';
  placeholder?: {
    en: string;
    vi: string;
  };
  required?: boolean;
  rows?: number;
}

const BilingualInput: React.FC<BilingualInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = { en: '', vi: '' },
  required = false,
  rows = 4
}) => {
  const [activeTab, setActiveTab] = useState<'en' | 'vi'>('en');

  const handleInputChange = (lang: 'en' | 'vi', inputValue: string) => {
    onChange(name, {
      ...value,
      [lang]: inputValue
    });
  };

  const handleArrayChange = (lang: 'en' | 'vi', arrayValue: string[]) => {
    onChange(name, {
      ...value,
      [lang]: arrayValue.join('\n')
    });
  };

  const getArrayValue = (lang: 'en' | 'vi'): string[] => {
    return value[lang] ? value[lang].split('\n').filter(item => item.trim()) : [];
  };

  const addArrayItem = (lang: 'en' | 'vi') => {
    const currentArray = getArrayValue(lang);
    currentArray.push('');
    handleArrayChange(lang, currentArray);
  };

  const removeArrayItem = (lang: 'en' | 'vi', index: number) => {
    const currentArray = getArrayValue(lang);
    currentArray.splice(index, 1);
    handleArrayChange(lang, currentArray);
  };

  const updateArrayItem = (lang: 'en' | 'vi', index: number, newValue: string) => {
    const currentArray = getArrayValue(lang);
    currentArray[index] = newValue;
    handleArrayChange(lang, currentArray);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Language Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'en'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🇺🇸</span>
            <span>English</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vi')}
          className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'vi'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🇻🇳</span>
            <span>Vietnamese</span>
          </div>
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {type === 'array' ? (
          <div className="space-y-2">
            {getArrayValue(activeTab).map((item, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateArrayItem(activeTab, index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`${placeholder[activeTab]} ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(activeTab, index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                >
                  <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(activeTab)}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Icon icon={Icons.FiPlus} className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        ) : type === 'textarea' ? (
          <textarea
            value={value[activeTab] || ''}
            onChange={(e) => handleInputChange(activeTab, e.target.value)}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder[activeTab]}
            required={required && activeTab === 'en'}
          />
        ) : (
          <input
            type="text"
            value={value[activeTab] || ''}
            onChange={(e) => handleInputChange(activeTab, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder[activeTab]}
            required={required && activeTab === 'en'}
          />
        )}
      </div>

      {/* Language Status Indicators */}
      <div className="flex space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <span>🇺🇸</span>
          <span>EN:</span>
          <span className={value.en ? 'text-green-600' : 'text-red-500'}>
            {value.en ? 'Filled' : 'Empty'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span>🇻🇳</span>
          <span>VI:</span>
          <span className={value.vi ? 'text-green-600' : 'text-red-500'}>
            {value.vi ? 'Filled' : 'Empty'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BilingualInput;
