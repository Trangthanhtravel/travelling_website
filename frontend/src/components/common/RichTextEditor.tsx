import React, { useState, useRef } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import toast from 'react-hot-toast';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

  // Force text visibility after component mounts and theme changes
  React.useEffect(() => {
    const forceTextVisibility = () => {
      // More aggressive targeting of all possible text elements
      const textElements = document.querySelectorAll(`
        .rich-text-editor textarea, 
        .rich-text-editor .w-md-editor-text-textarea,
        .rich-text-editor .w-md-editor-text-input,
        .rich-text-editor .CodeMirror,
        .rich-text-editor .CodeMirror-line,
        .rich-text-editor .CodeMirror-scroll,
        .rich-text-editor .CodeMirror-sizer,
        .rich-text-editor .w-md-editor-text,
        .rich-text-editor .wmde-markdown-var
      `);

      textElements.forEach((element: Element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.setProperty('color', isDarkMode ? '#F9FAFB' : '#111827', 'important');
        htmlElement.style.setProperty('background-color', isDarkMode ? '#1F2937' : '#FFFFFF', 'important');
      });

      // Force caret/cursor visibility
      const cursors = document.querySelectorAll('.rich-text-editor .CodeMirror-cursor');
      cursors.forEach((cursor: Element) => {
        const cursorElement = cursor as HTMLElement;
        cursorElement.style.setProperty('border-left-color', isDarkMode ? '#F9FAFB' : '#111827', 'important');
      });

      // Force placeholder text visibility
      const placeholders = document.querySelectorAll('.rich-text-editor textarea::placeholder');
      placeholders.forEach((placeholder: Element) => {
        const placeholderElement = placeholder as HTMLElement;
        placeholderElement.style.setProperty('color', isDarkMode ? '#9CA3AF' : '#6B7280', 'important');
      });
    };

    // Apply styles immediately
    forceTextVisibility();

    // Apply styles with multiple delays to catch all dynamically created elements
    const timeouts = [50, 100, 200, 500, 1000];
    const timeoutIds = timeouts.map(delay =>
      setTimeout(forceTextVisibility, delay)
    );

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(forceTextVisibility, 10);
    });

    const editorContainer = document.querySelector('.rich-text-editor');
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [isDarkMode, value]);

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
          components={{
            preview: (source, state, dispatch) => {
              return (
                <div className={`prose prose-lg max-w-none p-4 ${
                  isDarkMode 
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-300' 
                    : 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:border-blue-500'
                }`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      img: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt}
                          className="w-full rounded-lg shadow-md my-6"
                        />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors duration-200`}
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => (
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-8 mb-4`}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-6 mb-3`}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-5 mb-2`}>
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-4 mb-2`}>
                          {children}
                        </h4>
                      ),
                      h5: ({ children }) => (
                        <h5 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                          {children}
                        </h5>
                      ),
                      h6: ({ children }) => (
                        <h6 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                          {children}
                        </h6>
                      ),
                      p: ({ children }) => (
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>
                          {children}
                        </p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className={`border-l-4 ${isDarkMode ? 'border-blue-500 bg-gray-800' : 'border-blue-500 bg-gray-50'} pl-4 py-2 my-6 italic`}>
                          <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {children}
                          </div>
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className={`list-disc list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className={`list-decimal list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </li>
                      ),
                      code: ({ inline, children, ...props }: any) => (
                        inline ? (
                          <code className={`px-1 py-0.5 rounded text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                            {children}
                          </code>
                        ) : (
                          <code className={`block p-4 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                            {children}
                          </code>
                        )
                      ),
                      pre: ({ children }) => (
                        <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className={`min-w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className={`border px-4 py-2 text-left font-semibold ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'}`}>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className={isDarkMode ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className={isDarkMode ? 'text-gray-300 italic' : 'text-gray-700 italic'}>
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {source}
                  </ReactMarkdown>
                </div>
              );
            }
          }}
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
        /* Root editor container */
        .rich-text-editor .w-md-editor {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Main text area - most important for DB content visibility */
        .rich-text-editor .w-md-editor-text-input,
        .rich-text-editor .w-md-editor-text-textarea,
        .rich-text-editor textarea.w-md-editor-text-textarea {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          border: 1px solid ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        
        /* Text container */
        .rich-text-editor .w-md-editor-text {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Nested text elements */
        .rich-text-editor .w-md-editor-text .w-md-editor-text-input,
        .rich-text-editor .w-md-editor-text .w-md-editor-text-textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Preview area */
        .rich-text-editor .wmde-markdown {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Toolbar */
        .rich-text-editor .w-md-editor-toolbar {
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
          border-bottom: 1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar-divider {
          background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        /* Toolbar buttons */
        .rich-text-editor .w-md-editor-toolbar button {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .w-md-editor-toolbar button:hover {
          background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        /* CodeMirror specific targeting - this is crucial for DB content */
        .rich-text-editor .CodeMirror,
        .rich-text-editor .CodeMirror .CodeMirror-scroll,
        .rich-text-editor .CodeMirror .CodeMirror-sizer {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        .rich-text-editor .CodeMirror-cursor {
          border-left: 1px solid ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .CodeMirror-line,
        .rich-text-editor .CodeMirror-line span {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* All text nodes in editor */
        .rich-text-editor .w-md-editor-text * {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Specific textarea targeting */
        .rich-text-editor textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Input elements */
        .rich-text-editor input[type="text"] {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Placeholder text */
        .rich-text-editor .w-md-editor-text-textarea::placeholder,
        .rich-text-editor textarea::placeholder {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          opacity: 0.7;
        }
        
        /* Selection colors */
        .rich-text-editor .CodeMirror-selected,
        .rich-text-editor ::selection {
          background-color: ${isDarkMode ? '#374151' : '#DBEAFE'} !important;
        }
        
        /* Markdown syntax highlighting */
        .rich-text-editor .cm-header {
          color: ${isDarkMode ? '#60A5FA' : '#2563EB'} !important;
        }
        
        .rich-text-editor .cm-strong {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          font-weight: bold;
        }
        
        .rich-text-editor .cm-em {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          font-style: italic;
        }
        
        .rich-text-editor .cm-link {
          color: ${isDarkMode ? '#60A5FA' : '#2563EB'} !important;
        }
        
        .rich-text-editor .cm-url {
          color: ${isDarkMode ? '#34D399' : '#059669'} !important;
        }
        
        .rich-text-editor .cm-quote {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          font-style: italic;
        }
        
        .rich-text-editor .cm-code {
          color: ${isDarkMode ? '#FBBF24' : '#D97706'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F3F4F6'} !important;
          padding: 2px 4px;
          border-radius: 3px;
        }
        
        /* Force text visibility for any remaining elements */
        .rich-text-editor [data-color-mode="${isDarkMode ? 'dark' : 'light'}"] {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* MDEditor internal classes */
        .rich-text-editor .wmde-markdown-var {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Additional targeting for stubborn elements */
        .rich-text-editor .w-md-editor-focus .w-md-editor-text-textarea,
        .rich-text-editor .w-md-editor-focus .w-md-editor-text-input {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }

        /* Additional comprehensive text visibility rules */
        .rich-text-editor .w-md-editor-text-container,
        .rich-text-editor .w-md-editor-text-container * {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }

        /* Force visibility on all possible text elements */
        .rich-text-editor div[data-color-mode] *,
        .rich-text-editor .wmde-markdown *,
        .rich-text-editor .w-md-editor-text *,
        .rich-text-editor textarea,
        .rich-text-editor input {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }

        /* Ensure editor area background and borders are visible */
        .rich-text-editor .w-md-editor-area {
          border: 1px solid ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
          border-radius: 6px;
          overflow: hidden;
        }

        /* Make sure content is readable when loaded from database */
        .rich-text-editor .w-md-editor-text-area textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          caret-color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
