// Usar mesma origem por padrÃ£o em produÃ§Ã£o. Defina VITE_API_URL para apontar para outro host quando necessÃ¡rio.
const API_URL = (import.meta.env.VITE_API_URL ?? '').trim();

class LocalApiClient {
  constructor() {
    this.token = null;
    try {
      const saved = localStorage.getItem('fusion_token');
      if (saved) this.token = saved;
    } catch {}
  }

  setToken(token) {
    this.token = token;
    try {
      if (token) localStorage.setItem('fusion_token', token);
      else localStorage.removeItem('fusion_token');
    } catch {}
  }

  async request(endpoint, options = {}) {
    // Defensive: if token missing in memory, try recovering from localStorage
    if (!this.token) {
      try {
        const saved = localStorage.getItem('fusion_token');
        if (saved) this.token = saved;
      } catch {}
    }

    const isAuthEndpoint = endpoint.startsWith('/auth');
    const isPublic = isAuthEndpoint || endpoint.startsWith('/components/pwa');
    if (!this.token && !isPublic) {
      // Evita chamadas sem token que só gerariam 401 e spam no console
      throw new Error('API Error: 401 - {"error":"No token"}');
    }

    const base = API_URL || '';
    const url = `${base}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async register(email, password, full_name, role = 'aluno') {
    const result = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, role }),
    });
    this.setToken(result.token);
    return result;
  }

  async getCurrentUser() {
    // Se não houver token, evita chamadas desnecessárias e retorna nulo
    if (!this.token) {
      try {
        const saved = localStorage.getItem('fusion_token');
        if (saved) this.token = saved;
      } catch {}
      if (!this.token) {
        return { user: null, unauthenticated: true };
      }
    }

    const data = await this.request('/me');
    // The backend returns the user object directly, but the UI expects `{ user: ... }`
    // Normalize the shape here to avoid `undefined` user data across the app.
    if (data && typeof data === 'object' && 'user' in data) return data;
    return { user: data };
  }

  async logout() {
    this.setToken(null);
    // Note: Server-side logout might be needed, but for now just clear local token
  }

  // Generic CRUD methods
  async get(table, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/${table}?${queryString}` : `/api/${table}`;
    return this.request(endpoint);
  }

  async create(table, data) {
    return this.request(`/api/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(table, id, data) {
    return this.request(`/api/${table}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(table, id) {
    return this.request(`/api/${table}/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_URL}/upload`;
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
}

export const localApi = new LocalApiClient();
