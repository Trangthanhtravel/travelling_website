import React, { useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from '../../contexts/ThemeContext';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  isDarkMode?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  height = 400
}) => {
  const { isDarkMode } = useTheme();
  const [mode, setMode] = useState<'edit' | 'live' | 'preview'>('edit');

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

  return (
    <div className={`rich-text-editor ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
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
          commands={[
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
            commands.divider,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.checkedListCommand,
            commands.divider,
            commands.table,
            commands.divider,
            commands.help
          ]}
        />
      </div>

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <p>
          💡 <strong>Tips:</strong> Use the toolbar for formatting, or type markdown directly.
          Supports **bold**, *italic*, [links](url), images, lists, and more!
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
