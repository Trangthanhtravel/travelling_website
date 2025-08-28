// Utility functions for handling authentication in admin components
export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('adminToken');

  // Check if token exists and is not a string representation of null/undefined
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return null;
  }

  return token;
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('adminToken');
};

export const createAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No valid authentication token found');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const handleAuthError = (response: Response): void => {
  if (response.status === 401) {
    clearAuthToken();
    // You could also trigger a redirect to login page here
    throw new Error('Authentication failed. Please log in again.');
  }
};
