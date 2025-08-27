// Database configuration for Cloudflare D1 accessed from Vercel
const fetch = require('node-fetch');

const getDB = () => {
  // For Vercel deployment accessing Cloudflare D1 via REST API
  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_DATABASE_ID) {
    return {
      prepare: (query) => ({
        bind: (...params) => ({
          all: async () => {
            try {
              const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sql: query,
                  params: params
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('D1 API error response:', errorText);
                throw new Error(`D1 API error: ${response.status} ${response.statusText}`);
              }

              const data = await response.json();

              if (!data.success) {
                console.error('D1 API returned error:', data.errors);
                throw new Error(`D1 API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
              }

              return {
                results: data.result[0]?.results || [],
                success: true,
                meta: data.result[0]?.meta || {}
              };
            } catch (error) {
              console.error('D1 REST API error:', error);
              return { results: [], success: false, error: error.message };
            }
          },
          first: async () => {
            try {
              const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sql: query,
                  params: params
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('D1 API error response:', errorText);
                throw new Error(`D1 API error: ${response.status} ${response.statusText}`);
              }

              const data = await response.json();

              if (!data.success) {
                console.error('D1 API returned error:', data.errors);
                throw new Error(`D1 API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
              }

              const results = data.result[0]?.results || [];
              return results[0] || null;
            } catch (error) {
              console.error('D1 REST API error:', error);
              return null;
            }
          },
          run: async () => {
            try {
              const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sql: query,
                  params: params
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('D1 API error response:', errorText);
                throw new Error(`D1 API error: ${response.status} ${response.statusText}`);
              }

              const data = await response.json();

              if (!data.success) {
                console.error('D1 API returned error:', data.errors);
                throw new Error(`D1 API error: ${data.errors?.[0]?.message || 'Unknown error'}`);
              }

              const result = data.result[0];
              return {
                success: true,
                changes: result?.meta?.changes || 0,
                last_row_id: result?.meta?.last_row_id || null,
                meta: result?.meta || {}
              };
            } catch (error) {
              console.error('D1 REST API error:', error);
              return { success: false, error: error.message };
            }
          }
        })
      })
    };
  }

  // For local development fallback
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using development database fallback');
    // Return a mock database for development
    return {
      prepare: (query) => ({
        bind: (...params) => ({
          all: async () => ({ results: [], success: true }),
          first: async () => null,
          run: async () => ({ success: true, changes: 0 })
        })
      })
    };
  }

  throw new Error('Database configuration missing. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_DATABASE_ID environment variables.');
};

// Helper functions
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const generateBookingNumber = () => {
  const prefix = 'BK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Create and export the database instance
const db = getDB();

// Export both the database instance and helper functions
module.exports = {
  // Default export (database instance)
  default: db,
  // Named exports for backward compatibility
  getDB: () => db,
  generateId,
  generateBookingNumber,
  // Direct database access
  db
};

// Enhanced query wrapper with proper error handling
async function query(sql, params = []) {
  try {
    const db = getDB();
    const stmt = db.prepare(sql);
    const result = await stmt.bind(...params).all();

    return {
      success: result.success,
      data: result.results || [],
      error: result.error || null
    };
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);

    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

// Helper to get a single row
async function get(sql, params = []) {
  try {
    const db = getDB();
    const stmt = db.prepare(sql);
    const bound = stmt.bind(...params);
    const result = await bound.first();
    return result;
  } catch (error) {
    console.error('Database get error:', error);
    return null;
  }
}

// Helper to get all rows
async function all(sql, params = []) {
  try {
    const db = getDB();
    const stmt = db.prepare(sql);
    const bound = stmt.bind(...params);
    const result = await bound.all();
    return result.results || [];
  } catch (error) {
    console.error('Database all error:', error);
    return [];
  }
}

// Helper to run insert/update/delete
async function run(sql, params = []) {
  try {
    const db = getDB();
    const stmt = db.prepare(sql);
    const bound = stmt.bind(...params);
    const result = await bound.run();

    return {
      success: result.success,
      changes: result.changes || 0,
      lastInsertRowid: result.last_row_id || null,
      error: result.error || null
    };
  } catch (error) {
    console.error('Database run error:', error);
    return {
      success: false,
      changes: 0,
      lastInsertRowid: null,
      error: error.message
    };
  }
}
