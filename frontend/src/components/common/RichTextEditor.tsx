import React, { useState, useRef } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import toast from 'react-hot-toast';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  isDarkMode?: boolean;
  enableImageUpload?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = 400,
  enableImageUpload = false
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'edit' | 'live' | 'preview'>('edit');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image upload function
  const uploadImage = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/upload-content-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result.data.imageUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || t('Failed to upload image'));
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Custom image upload command
  const customImageCommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image', title: 'Upload image' },
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    execute: () => {
      if (enableImageUpload) {
        fileInputRef.current?.click();
      }
    },
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('Please select an image file'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('Image must be less than 5MB'));
      return;
    }

    try {
      const imageUrl = await uploadImage(file);
      const imageMarkdown = `![${file.name}](${imageUrl})`;

      // Insert image markdown at cursor position
      const textarea = document.querySelector('.w-md-editor-text-textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
        onChange(newValue);

        // Set cursor position after inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 100);
      } else {
        // Fallback: append to end
        onChange(value + '\n\n' + imageMarkdown);
      }

      toast.success(t('Image uploaded and inserted'));
    } catch (error) {
      // Error already handled in uploadImage function
    }

    // Clear file input
    e.target.value = '';
  };

  // Detect if content contains markdown syntax
  const hasMarkdownSyntax = (text: string) => {
    const markdownPatterns = [
      /#{1,6}\s/,           // Headers
      /\*\*.*\*\*/,         // Bold
      /\*.*\*/,             // Italic
      /\[.*\]\(.*\)/,       // Links
      /!\[.*\]\(.*\)/,      // Images
      /```[\s\S]*```/,      // Code blocks
      /`.*`/,               // Inline code
      />\s/,                // Blockquotes
      /^\s*[-*+]\s/m,       // Lists
      /^\s*\d+\.\s/m        // Numbered lists
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  };

  const handleChange = (val?: string) => {
    onChange(val || '');
  };

  // Build commands array
  const editorCommands = [
    // Basic formatting
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    commands.title,
    commands.divider,
    commands.link,
    commands.quote,
    commands.code,
    commands.image,
    ...(enableImageUpload ? [customImageCommand] : []), // Add custom image upload if enabled
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    commands.table,
    commands.divider,
    commands.help
  ];

  return (
    <div className={`rich-text-editor ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Hidden file input for image upload */}
      {enableImageUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Content Editor
          </span>
          {hasMarkdownSyntax(value) && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
              Markdown Detected
            </span>
          )}
          {enableImageUpload && (
            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded">
              Image Upload Enabled
            </span>
          )}
          {isUploadingImage && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600 mr-1"></div>
              Uploading...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'edit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('live')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'live'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              mode === 'preview'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      <div data-color-mode={isDarkMode ? 'dark' : 'light'}>
        <MDEditor
          value={value}
          onChange={handleChange}
          visibleDragbar={false}
          preview={mode === 'preview' ? 'preview' : mode === 'live' ? 'live' : 'edit'}
          hideToolbar={false}
          height={height}
          data-color-mode={isDarkMode ? 'dark' : 'light'}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            },
          }}
          commands={editorCommands}
        />
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>
          💡 <strong>Tips:</strong> Use the toolbar for formatting, or type markdown directly.
          Supports **bold**, *italic*, [links](url), images, lists, and more!
          {enableImageUpload && (
            <span className="block mt-1">
              📷 <strong>Images:</strong> Click the upload icon in the toolbar or drag & drop images directly into the editor.
            </span>
          )}
        </p>
      </div>

      {/* Custom styles */}
      <style>{`
        .rich-text-editor .w-md-editor {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'};
        }
        
        .rich-text-editor .w-md-editor-text-input,
        .rich-text-editor .w-md-editor-text-textarea {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          border: 1px solid ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
        }
        
        .rich-text-editor .w-md-editor-text {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        .rich-text-editor .wmde-markdown {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar {
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
          border-bottom: 1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar-divider {
          background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
