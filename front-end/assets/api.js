// Shared API client + session helpers for every UnivPulse page.
// Load this before shared.js and any page-specific script.

// Backend base URL. Change this if your Flask backend isn't running on
// the default `python run.py` port (see backend/README.md).
const API_BASE = 'http://localhost:5000';

const AUTH_STORAGE_KEY = 'univpulse_auth'; // holds {token, user} from login/signup

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function setAuth(auth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Every page under front-end/<folder>/<page>.html sits one level below
// front-end/, and the built login app lives at front-end/react/dist/, so
// '../react/dist/index.html' reaches it from any of them. Rebuild that
// dist/ folder (`npm run build` inside react/) after editing react/src.
const LOGIN_PATH = '../react/dist/index.html';

// Call at the top of every protected dashboard page. Redirects to login
// and returns null unless a token exists for one of allowedRoles;
// otherwise returns the stored {token, user}.
function requireAuth(allowedRoles) {
  const auth = getAuth();
  if (!auth || !auth.token || !allowedRoles.includes(auth.user.role)) {
    window.location.href = LOGIN_PATH;
    return null;
  }
  return auth;
}

function logout() {
  clearAuth();
  window.location.href = LOGIN_PATH;
}

// Wraps fetch with the Authorization header, JSON parsing, and a
// consistent thrown Error(message) on any non-2xx response -- the
// backend always replies with {"error": "..."} on failure (see
// backend/app/errors.py), so callers just need one catch block.
async function apiFetch(path, options = {}) {
  const auth = getAuth();
  const headers = { ...(options.headers || {}) };
  if (auth && auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
  // Don't set Content-Type for FormData (multipart uploads) -- the
  // browser needs to set its own boundary.
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401 || response.status === 422) {
    // Missing/expired/invalid token -- back to login rather than a
    // dashboard that silently has no data.
    clearAuth();
    window.location.href = LOGIN_PATH;
    throw new Error('Session expired, please log in again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error((data && data.error) || `Request failed (${response.status})`);
  }
  return data;
}

// Renders "3h ago" / "2d ago" style relative time from an ISO timestamp.
function timeAgo(isoString) {
  const seconds = Math.max(0, (Date.now() - new Date(isoString).getTime()) / 1000);
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];
  for (const [label, secondsPerUnit] of units) {
    const value = Math.floor(seconds / secondsPerUnit);
    if (value >= 1) return `${value}${label} ago`;
  }
  return 'just now';
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value ?? '';
  return div.innerHTML;
}
