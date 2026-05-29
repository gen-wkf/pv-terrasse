// api.js — reusable API client

const BASE = 'http://localhost:3001/api';

function getToken() { 
  return localStorage.getItem('smac_token'); 
}

async function api(method, path, body, isFormData = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body
      ? (isFormData ? body : JSON.stringify(body))
      : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const login          = (email, password) => api('POST', '/auth/login', { email, password });
export const register       = (userData)        => api('POST', '/auth/register', userData);
export const getMe          = ()                => api('GET', '/auth/me');
export const updateMe       = (data)            => api('PUT', '/auth/me', data);
export const changePassword = (data)            => api('PUT', '/auth/change-password', data);
export const listUsers      = ()                => api('GET', '/auth/users'); // admin only

// ── PV ─────────────────────────────────────────────────────────────────────
export const listPVs  = (params = {}) => api('GET', `/pv?${new URLSearchParams(params)}`);
export const createPV = (data)        => api('POST', '/pv', data);
export const getPV    = (id)          => api('GET', `/pv/${id}`);
export const updatePV = (id, data)    => api('PUT', `/pv/${id}`, data);
export const deletePV = (id)          => api('DELETE', `/pv/${id}`);
export const getPVStats = ()          => api('GET', '/pv/stats');

// ── Photos ─────────────────────────────────────────────────────────────────
export const uploadPhotos = (pvId, reserveId, files) => {
  const form = new FormData();
  files.forEach(f => form.append('photos', f));
  return api('POST', `/pv/${pvId}/reserves/${reserveId}/photos`, form, true);
};

// ── Signature ──────────────────────────────────────────────────────────────
export const uploadSignature = (pvId, participantId, file) => {
  const form = new FormData();
  form.append('signature', file);
  return api('POST', `/pv/${pvId}/participants/${participantId}/signature`, form, true);
};

// ── PDF ────────────────────────────────────────────────────────────────────
export const generatePdf = (pvId) => api('POST', `/pv/${pvId}/generate-pdf`);
export const downloadPdf = (pvId) => {
  window.open(`${BASE}/pv/${pvId}/pdf?token=${getToken()}`, '_blank');
};