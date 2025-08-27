import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../../components/common/Icons';

interface HeroImage {
  id: number;
  key: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HeroImageData {
  image: HeroImage | null;
  title: HeroImage | null;
  subtitle: HeroImage | null;
}

const HeroImageManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [heroImages, setHeroImages] = useState<HeroImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    imageUrl: '',
    title: '',
    subtitle: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Group content by hero image sets
        const heroSets: HeroImageData[] = [];
        const images = data.data.filter((item: HeroImage) => item.key.startsWith('hero_image_'));

        images.forEach((image: HeroImage) => {
          const index = image.key.replace('hero_image_', '');
          const title = data.data.find((item: HeroImage) => item.key === `hero_title_${index}`);
          const subtitle = data.data.find((item: HeroImage) => item.key === `hero_subtitle_${index}`);

          heroSets.push({ image, title, subtitle });
        });

        setHeroImages(heroSets);
      }
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index: number) => {
    const heroData = heroImages[index];
    setEditingIndex(index);
    setEditForm({
      imageUrl: heroData.image?.content || '',
      title: heroData.title?.content || '',
      subtitle: heroData.subtitle?.content || ''
    });
  };

  const handleSave = async () => {
    if (editingIndex === null) return;

    try {
      const heroData = heroImages[editingIndex];
      const heroIndex = editingIndex + 1;

      // Update or create image URL
      if (heroData.image) {
        await updateContent(heroData.image.id, editForm.imageUrl);
      } else {
        await createContent(`hero_image_${heroIndex}`, `Hero Image ${heroIndex}`, editForm.imageUrl);
      }

      // Update or create title
      if (heroData.title) {
        await updateContent(heroData.title.id, editForm.title);
      } else {
        await createContent(`hero_title_${heroIndex}`, `Hero Title ${heroIndex}`, editForm.title);
      }

      // Update or create subtitle
      if (heroData.subtitle) {
        await updateContent(heroData.subtitle.id, editForm.subtitle);
      } else {
        await createContent(`hero_subtitle_${heroIndex}`, `Hero Subtitle ${heroIndex}`, editForm.subtitle);
      }

      setEditingIndex(null);
      fetchHeroImages();
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error saving hero image. Please try again.');
    }
  };

  const handleAddNew = async () => {
    try {
      const nextIndex = heroImages.length + 1;

      await createContent(`hero_image_${nextIndex}`, `Hero Image ${nextIndex}`, editForm.imageUrl);
      await createContent(`hero_title_${nextIndex}`, `Hero Title ${nextIndex}`, editForm.title);
      await createContent(`hero_subtitle_${nextIndex}`, `Hero Subtitle ${nextIndex}`, editForm.subtitle);

      setIsAddingNew(false);
      setEditForm({ imageUrl: '', title: '', subtitle: '' });
      fetchHeroImages();
    } catch (error) {
      console.error('Error adding new hero image:', error);
      alert('Error adding new hero image. Please try again.');
    }
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this hero image?')) return;

    try {
      const heroData = heroImages[index];

      if (heroData.image) await deleteContent(heroData.image.id);
      if (heroData.title) await deleteContent(heroData.title.id);
      if (heroData.subtitle) await deleteContent(heroData.subtitle.id);

      fetchHeroImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Error deleting hero image. Please try again.');
    }
  };

  const updateContent = async (id: number, content: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error('Failed to update content');
    }
  };

  const createContent = async (key: string, title: string, content: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ key, title, content, type: 'setting' })
    });

    if (!response.ok) {
      throw new Error('Failed to create content');
    }
  };

  const deleteContent = async (id: number) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/content/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete content');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}>
              Loading hero images...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
            Hero Image Management
          </h1>
          <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
            Manage the background images and content for the homepage hero section
          </p>
        </div>

        {/* Add New Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setIsAddingNew(true);
              setEditForm({ imageUrl: '', title: '', subtitle: '' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Icon icon={Icons.FiPlus} className="w-4 h-4" />
            Add New Hero Image
          </button>
        </div>

        {/* Hero Images Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Add New Card */}
          {isAddingNew && (
            <div className={`${isDarkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-lg p-6 border-2 border-dashed border-blue-300`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                Add New Hero Image
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                    placeholder="Hero title"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                    placeholder="Hero subtitle"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddNew}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Icon icon={Icons.FiCheck} className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditForm({ imageUrl: '', title: '', subtitle: '' });
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Icon icon={Icons.FiX} className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Hero Images */}
          {heroImages.map((heroData, index) => (
            <div key={index} className={`${isDarkMode ? 'bg-dark-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
              {/* Image Preview */}
              <div className="relative h-48 bg-gray-200">
                {heroData.image?.content && (
                  <img
                    src={heroData.image.content}
                    alt={heroData.title?.content || `Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                )}
                {/* Light grey overlay preview */}
                <div className="absolute inset-0 bg-gray-900 bg-opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30"></div>

                {/* Preview Text */}
                <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 drop-shadow-lg">
                      {heroData.title?.content || `Hero ${index + 1}`}
                    </h3>
                    <p className="text-sm drop-shadow-md">
                      {heroData.subtitle?.content || 'No subtitle'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {editingIndex === index ? (
                  /* Edit Form */
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={editForm.subtitle}
                        onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                        className={`w-full p-2 border rounded ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-secondary' : 'bg-white border-gray-300 text-light-text-primary'}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Icon icon={Icons.FiCheck} className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Icon icon={Icons.FiX} className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                      {heroData.title?.content || `Hero ${index + 1}`}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      {heroData.subtitle?.content || 'No subtitle'}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(index)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Icon icon={Icons.FiEdit2} className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-dark-800 border-dark-600' : 'bg-blue-50 border-blue-200'} border`}>
          <div className="flex items-start gap-3">
            <Icon icon={Icons.FiInfo} className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-blue-800'}`}>
                Image Requirements
              </h4>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-blue-700'}`}>
                <li>• Recommended size: 1920x1080 pixels or higher</li>
                <li>• Format: JPG, PNG, or WebP</li>
                <li>• A light grey overlay will be automatically applied to soften bright images</li>
                <li>• Images should have good contrast for text readability</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImageManagement;
