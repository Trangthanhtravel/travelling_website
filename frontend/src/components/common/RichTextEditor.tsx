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

  // Force text visibility with more aggressive approach
  React.useEffect(() => {
    let isApplyingStyles = false; // Prevent infinite loops

    const forceTextVisibility = () => {
      if (isApplyingStyles) return;
      isApplyingStyles = true;

      // Target all possible text input elements with more specific selectors
      const selectors = [
        '.rich-text-editor textarea',
        '.rich-text-editor .w-md-editor-text-textarea',
        '.rich-text-editor .w-md-editor-text-input',
        '.w-md-editor-text-textarea',
        'textarea[data-color-mode]',
        '.w-md-editor textarea'
      ];

      let foundElements = 0;
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element: Element) => {
          const htmlElement = element as HTMLElement;

          // Debug: Log current computed styles before our changes (only once)
          if (foundElements === 0) {
            const computedStyle = window.getComputedStyle(htmlElement);
            console.log('🔍 Main textarea element found:', selector);
            console.log('📊 Before - Color:', computedStyle.color);
            console.log('📊 Before - Background:', computedStyle.backgroundColor);
            console.log('📊 Element tag:', htmlElement.tagName);
            console.log('📊 Element type:', htmlElement.getAttribute('type'));
            console.log('📊 Element value:', (htmlElement as HTMLTextAreaElement).value?.substring(0, 50));
            console.log('📊 Element placeholder:', (htmlElement as HTMLTextAreaElement).placeholder);
            console.log('📊 Font family:', computedStyle.fontFamily);
            console.log('📊 Font size:', computedStyle.fontSize);
            console.log('📊 Text shadow:', computedStyle.textShadow);
            console.log('📊 Z-index:', computedStyle.zIndex);
            console.log('📊 Position:', computedStyle.position);
          }

          // Force styles with maximum priority - more aggressive approach
          htmlElement.style.setProperty('color', isDarkMode ? '#FFFFFF' : '#000000', 'important');
          htmlElement.style.setProperty('background-color', isDarkMode ? '#1F2937' : '#FFFFFF', 'important');
          htmlElement.style.setProperty('border-color', isDarkMode ? '#374151' : '#D1D5DB', 'important');

          // Additional properties to ensure visibility
          htmlElement.style.setProperty('opacity', '1', 'important');
          htmlElement.style.setProperty('visibility', 'visible', 'important');
          htmlElement.style.setProperty('font-size', '14px', 'important');
          htmlElement.style.setProperty('line-height', '1.6', 'important');
          htmlElement.style.setProperty('caret-color', isDarkMode ? '#FFFFFF' : '#000000', 'important');

          // Force font properties
          htmlElement.style.setProperty('font-family', '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 'important');
          htmlElement.style.setProperty('font-weight', 'normal', 'important');
          htmlElement.style.setProperty('text-decoration', 'none', 'important');
          htmlElement.style.setProperty('text-shadow', 'none', 'important');
          htmlElement.style.setProperty('text-indent', '0', 'important');
          htmlElement.style.setProperty('letter-spacing', 'normal', 'important');
          htmlElement.style.setProperty('word-spacing', 'normal', 'important');

          // Force positioning and z-index
          htmlElement.style.setProperty('z-index', '1', 'important');
          htmlElement.style.setProperty('position', 'relative', 'important');

          // Remove any potential text selection styling
          htmlElement.style.setProperty('user-select', 'text', 'important');
          htmlElement.style.setProperty('-webkit-user-select', 'text', 'important');
          htmlElement.style.setProperty('-moz-user-select', 'text', 'important');

          // Force text rendering
          htmlElement.style.setProperty('text-rendering', 'auto', 'important');
          htmlElement.style.setProperty('-webkit-font-smoothing', 'auto', 'important');
          htmlElement.style.setProperty('-moz-osx-font-smoothing', 'auto', 'important');

          // Remove any transform that might hide text
          htmlElement.style.setProperty('transform', 'none', 'important');
          htmlElement.style.setProperty('filter', 'none', 'important');

          // Ensure padding/margin don't hide text
          htmlElement.style.setProperty('padding', '12px', 'important');
          htmlElement.style.setProperty('margin', '0', 'important');

          // Force focus to make text visible
          if ((htmlElement as HTMLTextAreaElement).value && (htmlElement as HTMLTextAreaElement).value.length > 0) {
            setTimeout(() => {
              htmlElement.focus();
              htmlElement.blur();
              htmlElement.focus();
              // Try to select and unselect to force text rendering
              (htmlElement as HTMLTextAreaElement).setSelectionRange(0, 0);
              setTimeout(() => {
                const valueLength = (htmlElement as HTMLTextAreaElement).value.length;
                (htmlElement as HTMLTextAreaElement).setSelectionRange(valueLength, valueLength);
              }, 10);
            }, 100);
          }

          foundElements++;
        });
      });

      // Force cursor visibility
      const cursors = document.querySelectorAll('.CodeMirror-cursor, .w-md-editor-text-textarea, textarea');
      cursors.forEach((cursor: Element) => {
        const cursorElement = cursor as HTMLElement;
        cursorElement.style.setProperty('caret-color', isDarkMode ? '#FFFFFF' : '#000000', 'important');
        cursorElement.style.setProperty('border-left-color', isDarkMode ? '#FFFFFF' : '#000000', 'important');
      });

      console.log('✅ Applied text visibility styles to', foundElements, 'elements');

      // Check if there are any overlaying elements that might hide the text
      const allTextInputs = document.querySelectorAll('textarea, input[type="text"]');
      console.log('🔍 Total text inputs found on page:', allTextInputs.length);
      allTextInputs.forEach((input, index) => {
        const computedStyle = window.getComputedStyle(input as HTMLElement);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
          console.log(`🚨 Hidden input ${index}:`, input, computedStyle.display, computedStyle.visibility, computedStyle.opacity);
        }
      });

      setTimeout(() => {
        isApplyingStyles = false;
      }, 100);
    };

    // Apply immediately and with delays
    forceTextVisibility();
    const timeouts = [100, 500, 1000];
    const timeoutIds = timeouts.map(delay => setTimeout(forceTextVisibility, delay));

    // Reduced MutationObserver scope to prevent infinite loops
    const observer = new MutationObserver((mutations) => {
      if (isApplyingStyles) return;

      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Only trigger on new elements being added
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        setTimeout(forceTextVisibility, 50);
      }
    });

    const editorContainer = document.querySelector('.rich-text-editor');
    if (editorContainer) {
      observer.observe(editorContainer, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      timeoutIds.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [isDarkMode, value]);

  // Additional effect to handle focus events
  React.useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        const textareas = document.querySelectorAll('.rich-text-editor textarea, .w-md-editor-text-textarea');
        textareas.forEach((textarea: Element) => {
          const element = textarea as HTMLElement;
          element.style.setProperty('color', isDarkMode ? '#FFFFFF' : '#000000', 'important');
          element.style.setProperty('background-color', isDarkMode ? '#1F2937' : '#FFFFFF', 'important');
        });
      }, 10);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('click', handleFocus);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('click', handleFocus);
    };
  }, [isDarkMode]);

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

      {/* Ultra-aggressive CSS to force text visibility */}
      <style>{`
        /* Global overrides with maximum specificity */
        .rich-text-editor * {
          box-sizing: border-box !important;
        }
        
        .rich-text-editor .w-md-editor,
        .rich-text-editor .w-md-editor *,
        .rich-text-editor .w-md-editor textarea,
        .rich-text-editor .w-md-editor .w-md-editor-text,
        .rich-text-editor .w-md-editor .w-md-editor-text-textarea,
        .rich-text-editor .w-md-editor .w-md-editor-text-input,
        .rich-text-editor .w-md-editor .CodeMirror,
        .rich-text-editor .w-md-editor .CodeMirror *,
        .rich-text-editor .w-md-editor .CodeMirror-scroll,
        .rich-text-editor .w-md-editor .CodeMirror-sizer,
        .rich-text-editor .w-md-editor .CodeMirror-lines,
        .rich-text-editor .w-md-editor .CodeMirror-line,
        .rich-text-editor .w-md-editor .CodeMirror-line span,
        .rich-text-editor .w-md-editor .CodeMirror-code,
        .rich-text-editor textarea,
        textarea.w-md-editor-text-textarea,
        .w-md-editor-text-textarea,
        .w-md-editor textarea,
        div[data-color-mode] textarea,
        div[data-color-mode] .w-md-editor-text-textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          border-color: ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
          opacity: 1 !important;
          visibility: visible !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          caret-color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Specific targeting for the main editor area */
        .rich-text-editor .w-md-editor .w-md-editor-text {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        .rich-text-editor .w-md-editor .w-md-editor-text .w-md-editor-text-textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          border: 1px solid ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
          padding: 12px !important;
          resize: none !important;
          outline: none !important;
          font-weight: normal !important;
        }
        
        .rich-text-editor .w-md-editor .w-md-editor-text .w-md-editor-text-textarea:focus {
          border-color: ${isDarkMode ? '#60A5FA' : '#3B82F6'} !important;
          box-shadow: 0 0 0 1px ${isDarkMode ? '#60A5FA' : '#3B82F6'} !important;
        }
        
        /* CodeMirror overrides */
        .rich-text-editor .CodeMirror {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        
        .rich-text-editor .CodeMirror-scroll {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        .rich-text-editor .CodeMirror-sizer,
        .rich-text-editor .CodeMirror-lines,
        .rich-text-editor .CodeMirror-code {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        .rich-text-editor .CodeMirror-line,
        .rich-text-editor .CodeMirror-line span {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: transparent !important;
        }
        
        .rich-text-editor .CodeMirror-cursor {
          border-left: 1px solid ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          border-right: none !important;
          width: 0 !important;
        }
        
        .rich-text-editor .CodeMirror-selected {
          background-color: ${isDarkMode ? '#374151' : '#DBEAFE'} !important;
        }
        
        /* Placeholder text */
        .rich-text-editor .w-md-editor-text-textarea::placeholder,
        .rich-text-editor textarea::placeholder {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          opacity: 0.8 !important;
        }
        
        /* Toolbar styling */
        .rich-text-editor .w-md-editor .w-md-editor-toolbar {
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
          border-bottom: 1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        .rich-text-editor .w-md-editor .w-md-editor-toolbar button {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .w-md-editor .w-md-editor-toolbar button:hover {
          background-color: ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        /* Editor container */
        .rich-text-editor .w-md-editor {
          border: 1px solid ${isDarkMode ? '#374151' : '#D1D5DB'} !important;
          border-radius: 6px !important;
          overflow: hidden !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Preview area */
        .rich-text-editor .wmde-markdown {
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          padding: 12px !important;
        }
        
        /* Force visibility on focus */
        .rich-text-editor .w-md-editor-focus .w-md-editor-text-textarea,
        .rich-text-editor .w-md-editor-focus textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Additional fallback selectors */
        .rich-text-editor [data-color-mode="${isDarkMode ? 'dark' : 'light'}"] textarea,
        .rich-text-editor [data-color-mode="${isDarkMode ? 'dark' : 'light'}"] .w-md-editor-text-textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* Make sure no element has transparent or same-as-background color */
        .rich-text-editor * {
          color: inherit !important;
        }
        
        .rich-text-editor input,
        .rich-text-editor textarea {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
          background-color: ${isDarkMode ? '#1F2937' : '#FFFFFF'} !important;
        }
        
        /* ===== ENHANCED MARKDOWN SYNTAX HIGHLIGHTING ===== */
        
        /* Headers - Different colors for different levels */
        .rich-text-editor .cm-header-1,
        .rich-text-editor .token-header-1,
        .rich-text-editor .cm-header {
          color: ${isDarkMode ? '#A78BFA' : '#7C3AED'} !important;
          font-weight: bold !important;
          font-size: 1.2em !important;
        }
        
        .rich-text-editor .cm-header-2,
        .rich-text-editor .token-header-2 {
          color: ${isDarkMode ? '#818CF8' : '#6366F1'} !important;
          font-weight: bold !important;
          font-size: 1.1em !important;
        }
        
        .rich-text-editor .cm-header-3,
        .rich-text-editor .token-header-3 {
          color: ${isDarkMode ? '#60A5FA' : '#3B82F6'} !important;
          font-weight: bold !important;
        }
        
        .rich-text-editor .cm-header-4,
        .rich-text-editor .cm-header-5,
        .rich-text-editor .cm-header-6,
        .rich-text-editor .token-header-4,
        .rich-text-editor .token-header-5,
        .rich-text-editor .token-header-6 {
          color: ${isDarkMode ? '#34D399' : '#059669'} !important;
          font-weight: semibold !important;
        }
        
        /* Bold and Italic text */
        .rich-text-editor .cm-strong,
        .rich-text-editor .token-bold {
          color: ${isDarkMode ? '#FDE047' : '#CA8A04'} !important;
          font-weight: bold !important;
        }
        
        .rich-text-editor .cm-em,
        .rich-text-editor .token-italic {
          color: ${isDarkMode ? '#FBBF24' : '#D97706'} !important;
          font-style: italic !important;
        }
        
        /* Links */
        .rich-text-editor .cm-link,
        .rich-text-editor .token-url,
        .rich-text-editor .cm-url {
          color: ${isDarkMode ? '#22D3EE' : '#0891B2'} !important;
          text-decoration: underline !important;
        }
        
        .rich-text-editor .cm-link-text {
          color: ${isDarkMode ? '#67E8F9' : '#0E7490'} !important;
        }
        
        /* Code - Inline and blocks */
        .rich-text-editor .cm-code,
        .rich-text-editor .token-code {
          color: ${isDarkMode ? '#F472B6' : '#BE185D'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F3F4F6'} !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
        }
        
        .rich-text-editor .cm-code-block,
        .rich-text-editor .token-code-block {
          color: ${isDarkMode ? '#E879F9' : '#A21CAF'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
          padding: 8px 12px !important;
          border-radius: 6px !important;
          border-left: 4px solid ${isDarkMode ? '#8B5CF6' : '#7C3AED'} !important;
        }
        
        /* Quotes and blockquotes */
        .rich-text-editor .cm-quote,
        .rich-text-editor .token-blockquote {
          color: ${isDarkMode ? '#A3A3A3' : '#6B7280'} !important;
          font-style: italic !important;
          border-left: 4px solid ${isDarkMode ? '#6B7280' : '#D1D5DB'} !important;
          padding-left: 12px !important;
          margin-left: 4px !important;
        }
        
        /* Lists */
        .rich-text-editor .cm-variable-2,
        .rich-text-editor .cm-list,
        .rich-text-editor .token-list-item {
          color: ${isDarkMode ? '#FB7185' : '#E11D48'} !important;
        }
        
        .rich-text-editor .cm-list-item {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        /* Images */
        .rich-text-editor .cm-image,
        .rich-text-editor .token-image {
          color: ${isDarkMode ? '#A78BFA' : '#7C3AED'} !important;
        }
        
        /* Special markdown characters and formatting */
        .rich-text-editor .cm-formatting,
        .rich-text-editor .cm-formatting-header,
        .rich-text-editor .cm-formatting-strong,
        .rich-text-editor .cm-formatting-em,
        .rich-text-editor .cm-formatting-quote,
        .rich-text-editor .cm-formatting-code {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          opacity: 0.7 !important;
        }
        
        /* Tables */
        .rich-text-editor .cm-table,
        .rich-text-editor .token-table {
          color: ${isDarkMode ? '#34D399' : '#059669'} !important;
        }
        
        .rich-text-editor .cm-table-header {
          color: ${isDarkMode ? '#10B981' : '#047857'} !important;
          font-weight: bold !important;
        }
        
        /* Horizontal rules */
        .rich-text-editor .cm-hr {
          color: ${isDarkMode ? '#6B7280' : '#9CA3AF'} !important;
          border-top: 2px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        /* Strikethrough */
        .rich-text-editor .cm-strikethrough,
        .rich-text-editor .token-strikethrough {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          text-decoration: line-through !important;
        }
        
        /* Math expressions (if supported) */
        .rich-text-editor .cm-math {
          color: ${isDarkMode ? '#FBBF24' : '#D97706'} !important;
          background-color: ${isDarkMode ? '#374151' : '#FEF3C7'} !important;
          border-radius: 3px !important;
          padding: 1px 3px !important;
        }
        
        /* Tags and mentions */
        .rich-text-editor .cm-tag {
          color: ${isDarkMode ? '#FB7185' : '#E11D48'} !important;
          background-color: ${isDarkMode ? '#374151' : '#FEE2E2'} !important;
          border-radius: 3px !important;
          padding: 1px 3px !important;
        }
        
        /* Line numbers (if enabled) */
        .rich-text-editor .CodeMirror-linenumber {
          color: ${isDarkMode ? '#6B7280' : '#9CA3AF'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
        }
        
        /* Search highlighting */
        .rich-text-editor .CodeMirror-search-match {
          background-color: ${isDarkMode ? '#FBBF24' : '#FEF3C7'} !important;
          color: ${isDarkMode ? '#111827' : '#92400E'} !important;
        }
        
        /* Fold markers */
        .rich-text-editor .CodeMirror-foldmarker {
          color: ${isDarkMode ? '#60A5FA' : '#3B82F6'} !important;
          background-color: ${isDarkMode ? '#374151' : '#DBEAFE'} !important;
        }
        
        /* Brackets and parentheses */
        .rich-text-editor .cm-bracket {
          color: ${isDarkMode ? '#A3A3A3' : '#6B7280'} !important;
        }
        
        /* Matching brackets */
        .rich-text-editor .CodeMirror-matchingtag {
          background-color: ${isDarkMode ? '#374151' : '#E5E7EB'} !important;
        }
        
        .rich-text-editor .CodeMirror-matchingbracket {
          color: ${isDarkMode ? '#22D3EE' : '#0891B2'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F0F9FF'} !important;
        }
        
        /* Error highlighting */
        .rich-text-editor .cm-error {
          color: ${isDarkMode ? '#F87171' : '#DC2626'} !important;
          background-color: ${isDarkMode ? '#451319' : '#FEE2E2'} !important;
        }
        
        /* Comments (for code blocks) */
        .rich-text-editor .cm-comment {
          color: ${isDarkMode ? '#9CA3AF' : '#6B7280'} !important;
          font-style: italic !important;
        }
        
        /* Keywords (for code blocks) */
        .rich-text-editor .cm-keyword {
          color: ${isDarkMode ? '#A78BFA' : '#7C3AED'} !important;
          font-weight: bold !important;
        }
        
        /* Variables (for code blocks) */
        .rich-text-editor .cm-variable {
          color: ${isDarkMode ? '#34D399' : '#059669'} !important;
        }
        
        /* Numbers */
        .rich-text-editor .cm-number {
          color: ${isDarkMode ? '#FBBF24' : '#D97706'} !important;
        }
        
        /* Strings */
        .rich-text-editor .cm-string {
          color: ${isDarkMode ? '#22D3EE' : '#0891B2'} !important;
        }
        
        /* Operators */
        .rich-text-editor .cm-operator {
          color: ${isDarkMode ? '#F472B6' : '#BE185D'} !important;
        }
        
        /* Enhanced live preview styling */
        .rich-text-editor .wmde-markdown h1,
        .rich-text-editor .wmde-markdown h2,
        .rich-text-editor .wmde-markdown h3,
        .rich-text-editor .wmde-markdown h4,
        .rich-text-editor .wmde-markdown h5,
        .rich-text-editor .wmde-markdown h6 {
          color: ${isDarkMode ? '#A78BFA' : '#7C3AED'} !important;
        }
        
        .rich-text-editor .wmde-markdown p {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .wmde-markdown a {
          color: ${isDarkMode ? '#22D3EE' : '#0891B2'} !important;
        }
        
        .rich-text-editor .wmde-markdown code {
          color: ${isDarkMode ? '#F472B6' : '#BE185D'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F3F4F6'} !important;
        }
        
        .rich-text-editor .wmde-markdown pre {
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
          border: 1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'} !important;
        }
        
        .rich-text-editor .wmde-markdown blockquote {
          border-left: 4px solid ${isDarkMode ? '#6B7280' : '#D1D5DB'} !important;
          color: ${isDarkMode ? '#A3A3A3' : '#6B7280'} !important;
          background-color: ${isDarkMode ? '#374151' : '#F9FAFB'} !important;
        }
        
        .rich-text-editor .wmde-markdown ul,
        .rich-text-editor .wmde-markdown ol {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .wmde-markdown li {
          color: ${isDarkMode ? '#F9FAFB' : '#111827'} !important;
        }
        
        .rich-text-editor .wmde-markdown strong {
          color: ${isDarkMode ? '#FDE047' : '#CA8A04'} !important;
        }
        
        .rich-text-editor .wmde-markdown em {
          color: ${isDarkMode ? '#FBBF24' : '#D97706'} !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
