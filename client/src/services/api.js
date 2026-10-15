const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('esms_token') || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('esms_token', token);
  } else {
    localStorage.removeItem('esms_token');
  }
}

function clearUser() {
  localStorage.removeItem('esms_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // If unauthorized, clear token and notify listener
    setToken('');
    clearUser();
    window.dispatchEvent(new Event('auth:expired'));
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || (data.errors && data.errors.join(', ')) || 'An error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  async login(emailOrUsername, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: emailOrUsername, password })
    });
    setToken(res.token);
    return res;
  },

  async register(username, email, password) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
  },

  logout() {
    setToken('');
    clearUser();
    window.dispatchEvent(new Event('auth:changed'));
  },

  // Employees
  async getEmployees({ page = 1, limit = 20, search = '', department = '', country = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (country) params.append('country', country);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    return await request(`/employees?${params.toString()}`);
  },

  async getFilters() {
    return await request('/employees/filters');
  },

  async getEmployee(id) {
    return await request(`/employees/${id}`);
  },

  async createEmployee(payload) {
    return await request('/employees', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateEmployee(id, payload) {
    return await request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteEmployee(id) {
    return await request(`/employees/${id}`, {
      method: 'DELETE'
    });
  },

  // Dashboard
  async getDashboardSummary() {
    return await request('/dashboard/summary');
  },

  async getDepartmentReport() {
    return await request('/dashboard/by-department');
  },

  async getCountryReport() {
    return await request('/dashboard/by-country');
  }
};
