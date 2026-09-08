import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Backend base URL -- keep this in sync with API_BASE in
// ../assets/api.js (the plain-HTML pages' copy of the same constant).
const API_BASE = 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'univpulse_auth'; // read by assets/api.js on every other page

// This file is built to react/dist/ (npm run build), so from
// react/dist/index.html these paths land on the right dashboard.
const REDIRECT_BY_ROLE = {
  student: '../../student_faculty/student_faculty.html',
  faculty: '../../student_faculty/student_faculty.html',
  administrator: '../../department_admin/department_admin.html',
  super_admin: '../../super_admin/super_admin.html',
};

function storeAuthAndRedirect(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  window.location.href = REDIRECT_BY_ROLE[payload.user.role] || REDIRECT_BY_ROLE.student;
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

function Icon({ children }) {
  return <span className="material-symbols-outlined">{children}</span>;
}

function Header() {
  return (
    <header className="auth-header">
      <a className="brand" href="#login" aria-label="UnivPulse home">
        <span className="brand-mark"><Icon>domain_verification</Icon></span>
        <span><strong>UnivPulse</strong><small>Civic Command</small></span>
      </a>
      <div className="gateway-status"><span className="status-dot" /> Central Auth Gateway Active</div>
    </header>
  );
}

function Footer() {
  return <footer className="auth-footer"><strong>UnivPulse</strong><span>Copyright 2025 UnivPulse - UCS503 Course Project</span></footer>;
}

function PasswordField({ id, label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="password-control">
        <input id={id} required type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder="Enter password" />
        <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}><Icon>{visible ? 'visibility_off' : 'visibility'}</Icon></button>
      </span>
    </label>
  );
}

function LoginView({ onSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await apiPost('/api/auth/login', { email, password });
      storeAuthAndRedirect(result);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return <main className="auth-main"><div className="auth-card">
    <div className="card-heading"><span className="hero-mark"><Icon>domain_verification</Icon></span><h1>UnivPulse Portal</h1><p>College Infrastructure Issue Reporter</p></div>
    <form className="auth-form" onSubmit={submit}>
      {/* No role picker here on purpose -- your role and (for
          administrators) your department come from your account in the
          database, not from a dropdown at login time. */}
      <label className="field" htmlFor="login-email"><span>Institutional Email Address</span><input id="login-email" required type="email" value={email} placeholder="you@thapar.edu" onChange={(event) => setEmail(event.target.value)} /></label>
      <PasswordField id="login-password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign In'} <Icon>arrow_forward</Icon></button>
      <button className="secondary-action" type="button" onClick={onSignUp}>Don't have an account? Sign Up <Icon>person_add</Icon></button>
    </form>
  </div></main>;
}

function SignUpView({ onLogin }) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Passwords must match.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = await apiPost('/api/auth/signup', { name, email, password, role });
      storeAuthAndRedirect(result);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return <main className="auth-main"><div className="signup-card auth-card">
    <div className="card-heading card-heading-left"><span className="eyebrow">Campus Identity Management</span><h1>Create UnivPulse Account</h1><p>Register with your institutional campus ID to report issues, upvote tickets, and track infrastructure repairs.</p></div>
    <form className="auth-form" onSubmit={submit}>
      {/* Administrator/Super-Admin accounts are provisioned directly in
          the database (see database/sql/seed.sql) since an administrator's
          department is a deployment decision, not self-service -- so only
          these two roles are offered here. */}
      <div className="role-selector"><span>Institutional Role</span><div>{['student', 'faculty'].map((item) => <button key={item} className={role === item ? 'active' : ''} type="button" onClick={() => setRole(item)}>{item === 'student' ? 'Student' : 'Faculty / Staff'}</button>)}</div></div>
      <label className="field" htmlFor="fullName"><span>Full Name</span><input id="fullName" required value={name} placeholder="Jane Doe" onChange={(event) => setName(event.target.value)} /></label>
      <label className="field" htmlFor="signup-email"><span>Institutional Email Address</span><input id="signup-email" required type="email" value={email} placeholder="you@thapar.edu" onChange={(event) => setEmail(event.target.value)} /></label>
      <div className="field-grid"><PasswordField id="signup-password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><PasswordField id="confirm-password" label="Confirm Password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
      <label className="remember"><input required type="checkbox" /> I agree to the Campus Community Guidelines and Infrastructure Reporting Conduct.</label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'} <Icon>arrow_forward</Icon></button>
      <p className="return-link">Already have an account? <button type="button" onClick={onLogin}>Sign In</button></p>
    </form>
  </div></main>;
}

function App() {
  const [view, setView] = useState(window.location.hash === '#signup' ? 'signup' : 'login');
  const changeView = (nextView) => { window.location.hash = nextView; setView(nextView); };
  return <div className="auth-page"><Header />{view === 'login' ? <LoginView onSignUp={() => changeView('signup')} /> : <SignUpView onLogin={() => changeView('login')} />}<Footer /></div>;
}

createRoot(document.getElementById('root')).render(<App />);
