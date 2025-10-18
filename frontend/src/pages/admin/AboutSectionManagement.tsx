import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { Icon, Icons } from '../../components/common/Icons';
import BilingualInput from '../../components/common/BilingualInput';
import toast from 'react-hot-toast';

interface AboutContent {
  backgroundImage: string;
  quote: { en: string; vi: string };
  tagline: { en: string; vi: string };
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  youtubeId: string;
  statistics: {
    happyCustomers: string;
    numberOfTrips: string;
    yearsOfExperience: string;
    googleReview: string;
  };
}

const AboutSectionManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    backgroundImage: '',
    quote: { en: '', vi: '' },
    tagline: { en: '', vi: '' },
    title: { en: '', vi: '' },
    description: { en: '', vi: '' },
    youtubeId: '',
    statistics: {
      happyCustomers: '',
      numberOfTrips: '',
      yearsOfExperience: '',
      googleReview: ''
    }
  });

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  useEffect(() => {
    fetchAboutContent();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAboutContent = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/admin/content?type=setting`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const aboutData = data.data || [];

        setAboutContent({
          backgroundImage: aboutData.find((item: any) => item.key === 'about_background_image')?.content || '',
          quote: {
            en: aboutData.find((item: any) => item.key === 'about_quote')?.content || '',
            vi: aboutData.find((item: any) => item.key === 'about_quote')?.content_vi || ''
          },
          tagline: {
            en: aboutData.find((item: any) => item.key === 'about_tagline')?.content || '',
            vi: aboutData.find((item: any) => item.key === 'about_tagline')?.content_vi || ''
          },
          title: {
            en: aboutData.find((item: any) => item.key === 'about_title')?.content || '',
            vi: aboutData.find((item: any) => item.key === 'about_title')?.content_vi || ''
          },
          description: {
            en: aboutData.find((item: any) => item.key === 'about_description')?.content || '',
            vi: aboutData.find((item: any) => item.key === 'about_description')?.content_vi || ''
          },
          youtubeId: aboutData.find((item: any) => item.key === 'about_youtube_id')?.content || '',
          statistics: {
            happyCustomers: aboutData.find((item: any) => item.key === 'stats_happy_customers')?.content || '',
            numberOfTrips: aboutData.find((item: any) => item.key === 'stats_number_of_trips')?.content || '',
            yearsOfExperience: aboutData.find((item: any) => item.key === 'stats_years_experience')?.content || '',
            googleReview: aboutData.find((item: any) => item.key === 'stats_google_review')?.content || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast.error(t('Failed to fetch about content'));
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${getApiUrl()}/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const result = await response.json();
      return result.data?.imageUrl || '';
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let backgroundImageUrl = aboutContent.backgroundImage;

      // Upload new background image if selected
      if (selectedFile) {
        backgroundImageUrl = await uploadImage(selectedFile);
      }

      const contentItems = [
        { key: 'about_background_image', title: 'About Background Image', content: backgroundImageUrl, content_vi: backgroundImageUrl },
        { key: 'about_quote', title: 'About Quote', content: aboutContent.quote.en, content_vi: aboutContent.quote.vi },
        { key: 'about_tagline', title: 'About Tagline', content: aboutContent.tagline.en, content_vi: aboutContent.tagline.vi },
        { key: 'about_title', title: 'About Title', content: aboutContent.title.en, content_vi: aboutContent.title.vi },
        { key: 'about_description', title: 'About Description', content: aboutContent.description.en, content_vi: aboutContent.description.vi },
        { key: 'about_youtube_id', title: 'About YouTube ID', content: aboutContent.youtubeId, content_vi: aboutContent.youtubeId },
        { key: 'stats_happy_customers', title: 'Happy Customers Stat', content: aboutContent.statistics.happyCustomers, content_vi: aboutContent.statistics.happyCustomers },
        { key: 'stats_number_of_trips', title: 'Number of Trips Stat', content: aboutContent.statistics.numberOfTrips, content_vi: aboutContent.statistics.numberOfTrips },
        { key: 'stats_years_experience', title: 'Years Experience Stat', content: aboutContent.statistics.yearsOfExperience, content_vi: aboutContent.statistics.yearsOfExperience },
        { key: 'stats_google_review', title: 'Google Review Stat', content: aboutContent.statistics.googleReview, content_vi: aboutContent.statistics.googleReview }
      ];

      // Fetch all content once before the loop
      const response = await fetch(`${getApiUrl()}/admin/content?type=setting`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch existing content');
      }

      const data = await response.json();
      const existingContent = data.data || [];

      // Process each content item
      for (const item of contentItems) {
        const existingItem = existingContent.find((content: any) => content.key === item.key);

        if (existingItem) {
          // Update existing content with all fields
          const updateResponse = await fetch(`${getApiUrl()}/admin/content/${existingItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              title: item.title,
              content: item.content,
              content_vi: item.content_vi,
              type: 'setting',
              status: 'active'
            })
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error(`Failed to update ${item.key}:`, errorData);
            throw new Error(`Failed to update ${item.title}`);
          }
        } else {
          // Create new content
          const createResponse = await fetch(`${getApiUrl()}/admin/content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
              key: item.key,
              title: item.title,
              content: item.content,
              content_vi: item.content_vi,
              type: 'setting',
              status: 'active'
            })
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            console.error(`Failed to create ${item.key}:`, errorData);
            throw new Error(`Failed to create ${item.title}`);
          }
        }
      }

      setSelectedFile(null);
      toast.success('About section updated successfully');
      await fetchAboutContent(); // Wait for refresh to complete
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error(error instanceof Error ? error.message : 'Error saving about content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return '';

    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return url; // Return as-is if no pattern matches
  };

  const handleYouTubeUrlChange = (value: string) => {
    const videoId = extractYouTubeId(value);
    setAboutContent({ ...aboutContent, youtubeId: videoId });
  };

  const handleBilingualChange = (name: string, value: { en: string; vi: string }) => {
    setAboutContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}>
              Loading about section content...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
            About Section Management
          </h1>
          <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
            Manage the content, background image, and YouTube video for the homepage about section
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Form */}
          <div className={`${isDarkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              Edit Content
            </h2>

            <div className="space-y-6">
              {/* Background Image */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  Background Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAboutContent({ ...aboutContent, backgroundImage: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setAboutContent({ ...aboutContent, backgroundImage: '' });
                      }
                    }}
                    className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                  />
                </div>
                {aboutContent.backgroundImage && (
                  <div className="mt-4">
                    <img
                      src={aboutContent.backgroundImage}
                      alt="Background Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Quote */}
              <BilingualInput
                label="Company Quote"
                name="quote"
                value={aboutContent.quote}
                onChange={handleBilingualChange}
                placeholder={{ en: 'Enter your company quote here...', vi: 'Nhập câu trích dẫn công ty của bạn ở đây...' }}
              />

              {/* Tagline */}
              <BilingualInput
                label="Tagline"
                name="tagline"
                value={aboutContent.tagline}
                onChange={handleBilingualChange}
                placeholder={{ en: 'Enter your tagline here...', vi: 'Nhập slogan của bạn ở đây...' }}
              />

              {/* Title */}
              <BilingualInput
                label="Section Title"
                name="title"
                value={aboutContent.title}
                onChange={handleBilingualChange}
                placeholder={{ en: 'About Our Journey', vi: 'Về Hành Trình Của Chúng Tôi' }}
              />

              {/* Description */}
              <BilingualInput
                label="Description"
                name="description"
                type="textarea"
                value={aboutContent.description}
                onChange={handleBilingualChange}
                placeholder={{ en: 'Enter section description...', vi: 'Nhập mô tả phần này...' }}
                rows={4}
              />

              {/* YouTube URL/ID */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  YouTube Video URL or ID
                </label>
                <input
                  type="text"
                  value={aboutContent.youtubeId}
                  onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                  placeholder="https://youtube.com/watch?v=VIDEO_ID or just VIDEO_ID"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                  You can paste the full YouTube URL or just the video ID
                </p>
              </div>

              {/* Statistics */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  Statistics Section
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      Happy Customers
                    </label>
                    <input
                      type="number"
                      value={aboutContent.statistics.happyCustomers}
                      onChange={(e) => setAboutContent({
                        ...aboutContent,
                        statistics: { ...aboutContent.statistics, happyCustomers: e.target.value }
                      })}
                      className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      Number of Trips
                    </label>
                    <input
                      type="number"
                      value={aboutContent.statistics.numberOfTrips}
                      onChange={(e) => setAboutContent({
                        ...aboutContent,
                        statistics: { ...aboutContent.statistics, numberOfTrips: e.target.value }
                      })}
                      className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                        Experience in the industry
                    </label>
                    <input
                      type="number"
                      value={aboutContent.statistics.yearsOfExperience}
                      onChange={(e) => setAboutContent({
                        ...aboutContent,
                        statistics: { ...aboutContent.statistics, yearsOfExperience: e.target.value }
                      })}
                      className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                        Rating on Google (1-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={aboutContent.statistics.googleReview}
                      onChange={(e) => setAboutContent({
                        ...aboutContent,
                        statistics: { ...aboutContent.statistics, googleReview: e.target.value }
                      })}
                      className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      placeholder="4.6"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  saving || uploading
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {saving || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Icon icon={Icons.FiSave} className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className={`${isDarkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              Preview
            </h2>

            <div className="space-y-6">
              {/* Background Image Preview */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  Background Image with Quote
                </h3>
                <div
                  className="relative h-48 rounded-lg overflow-hidden bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${aboutContent.backgroundImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}')`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50"></div>
                  <div className="relative z-10 h-full flex items-center justify-center p-4">
                    <div className="text-center text-white">
                      <blockquote className="text-sm font-serif italic mb-2">
                        "{aboutContent.quote.en || 'Your company quote will appear here...'}"
                      </blockquote>
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-px bg-orange-500 mr-2"></div>
                        <p className="text-xs font-medium text-orange-500">
                          {aboutContent.tagline.en || 'Your tagline'}
                        </p>
                        <div className="w-8 h-px bg-orange-500 ml-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and Description Preview */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  Title & Description
                </h3>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {aboutContent.title.en || 'Section Title'}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                    {aboutContent.description.en || 'Section description will appear here...'}
                  </p>
                </div>
              </div>

              {/* YouTube Preview */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  YouTube Video
                </h3>
                {aboutContent.youtubeId ? (
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${aboutContent.youtubeId}?controls=1&modestbranding=1&rel=0`}
                      title="Preview Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className={`h-32 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-dark-700' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      YouTube video preview will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Statistics Preview */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  Statistics Preview
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className={`p-3 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                    <div className="text-lg font-bold text-blue-500">
                      {aboutContent.statistics.happyCustomers || '0'}+
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      Happy Customers
                    </div>
                  </div>
                  <div className={`p-3 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                    <div className="text-lg font-bold text-green-500">
                      {aboutContent.statistics.numberOfTrips || '0'}+
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                        Successful Journey
                    </div>
                  </div>
                  <div className={`p-3 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                    <div className="text-lg font-bold text-purple-500">
                      {aboutContent.statistics.yearsOfExperience || '0'}+
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      Years Experience
                    </div>
                  </div>
                  <div className={`p-3 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                    <div className="text-lg font-bold text-yellow-500">
                      {aboutContent.statistics.googleReview || '0'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      Google Rating
                    </div>
                    <div className="flex justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          icon={Icons.FiStar}
                          className={`w-3 h-3 ${star <= Math.floor(parseFloat(aboutContent.statistics.googleReview) || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-dark-800 border-dark-600' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-start gap-3">
            <Icon icon={Icons.FiInfo} className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-blue-800'}`}>
                Content Guidelines
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-blue-700'}`}>
                <li>• Background image should be high quality (1920x1080 or higher)</li>
                <li>• Quote should be inspiring and represent your company values</li>
                <li>• YouTube URL can be in any format - we'll extract the video ID automatically</li>
                <li>• Statistics should be concise and impactful (e.g., "500+", "10 Years")</li>
                <li>• Changes are applied immediately to the live website</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSectionManagement;
