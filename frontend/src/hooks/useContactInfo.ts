import { useState, useEffect } from 'react';
import { ContactInfo } from '../types/contact';

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('Failed to fetch contact information');
      }

      const data = await response.json();
      setContactInfo(data);
    } catch (err: any) {
      console.error('Error fetching contact info:', err);
      setError(err.message || 'Failed to load contact information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const refreshContactInfo = () => {
    fetchContactInfo();
  };

  return {
    contactInfo,
    isLoading,
    error,
    refreshContactInfo
  };
};
