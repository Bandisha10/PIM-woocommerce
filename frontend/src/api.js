const API_BASE = '/api';

export async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...options.headers };

  const token = localStorage.getItem('nexus_auth_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {}
    throw new Error(errorDetail);
  }

  // Handle stream / blob (e.g. CSV export)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return res.blob();
  }

  return res.json();
}

export const api = {
  // Authentication
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: data }),
  googleAuth: (data) => request('/auth/google', { method: 'POST', body: data }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: data }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),
  verifyEmail: (data) => request('/auth/verify-email', { method: 'POST', body: data }),

  // Fast Unified Bootstrap
  getBootstrap: () => request('/bootstrap'),


  // System & Health
  getHealth: () => request('/health'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id, deleteRemote = false) => request(`/products/${id}?delete_remote=${deleteRemote}`, { method: 'DELETE' }),
  bulkDeleteProducts: (ids) => request('/products/bulk-delete', { method: 'POST', body: { ids } }),

  // Sync Engine
  syncProducts: (productIds = null, syncAllPending = false) =>
    request('/sync', {
      method: 'POST',
      body: { product_ids: productIds, sync_all_pending: syncAllPending },
    }),
  pullFromStore: () => request('/pull', { method: 'POST' }),
  resolveConflict: (id, keep) =>
    request(`/products/${id}/resolve`, {
      method: 'POST',
      body: { keep },
    }),
  simulateRemoteChange: (productId = null, changeType = 'price_and_stock', customPrice = null, customStock = null) =>
    request('/simulate-remote-change', {
      method: 'POST',
      body: {
        product_id: productId,
        change_type: changeType,
        custom_price: customPrice,
        custom_stock: customStock,
      },
    }),
  getWooPreview: () => request('/woo-preview'),

  // CSV Bulk
  importCsv: (csvText) => request('/import-csv', { method: 'POST', body: { csv: csvText } }),
  exportCsv: async () => {
    const blob = await request('/export-csv');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockroom_pim_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Templates
  getTemplates: () => request('/templates'),
  createTemplate: (data) => request('/templates', { method: 'POST', body: data }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

  // Categories & Channels
  getCategories: () => request('/categories'),
  getChannels: () => request('/channels'),
  updateChannel: (id, data) => request(`/channels/${id}`, { method: 'PUT', body: data }),
  testStoreConnection: (data) => request('/channels/test', { method: 'POST', body: data }),

  // Activity
  getActivity: (limit = 40) => request(`/activity?limit=${limit}`),
};
