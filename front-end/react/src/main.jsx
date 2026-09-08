import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const loginRoles = {
  student: {
    title: 'Campus Member Access',
    description: 'Log in using your institutional address to report incidents, track repair tickets, and upvote existing complaints.',
    label: 'College ID / Email Address',
    placeholder: 'student.id@college.edu',
    demo: 'akash.sharma@college.edu',
    button: 'Sign In to Student Portal',
    icon: 'school',
  },
  dept: {
    title: 'Department Admin Console',
    description: 'Access assigned ticket queues, dispatch technicians, and update repair milestones for your specialized trade.',
    label: 'Technician Staff ID / Work Email',
    placeholder: 'admin.electrical@college.edu',
    demo: 'lead.electrical@college.edu',
    button: 'Sign In to Maintenance Console',
    icon: 'engineering',
    hasDepartment: true,
  },
  super: {
    title: 'Super-Admin Infrastructure Oversight',
    description: 'Review comprehensive audit visibility across electrical, HVAC, sanitation, and civil safety assets.',
    label: 'Super-Admin Credentials',
    placeholder: 'superadmin@college.edu',
    demo: 'dean.infrastructure@college.edu',
    button: 'Sign In to Central Oversight',
    icon: 'admin_panel_settings',
  },
};

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
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState(loginRoles.student.demo);
  const [password, setPassword] = useState('CampusPulse#2025');
  const config = loginRoles[role];

  function chooseRole(nextRole, demo = false) {
    setRole(nextRole);
    if (demo) {
      setIdentifier(loginRoles[nextRole].demo);
      setPassword('CampusPulse#2025');
    }
  }

  function submit(event) {
    event.preventDefault();
  }

  return <main className="auth-main"><div className="auth-card">
    <div className="card-heading"><span className="hero-mark"><Icon>domain_verification</Icon></span><h1>UnivPulse Portal</h1><p>College Infrastructure Issue Reporter</p></div>
    <div className="role-tabs" role="tablist" aria-label="Access level">
      {Object.entries(loginRoles).map(([key, value]) => <button key={key} className={role === key ? 'active' : ''} type="button" onClick={() => chooseRole(key)}><Icon>{value.icon}</Icon><span>{key === 'student' ? 'Student / Faculty' : key === 'dept' ? 'Dept Admin' : 'Super-Admin'}</span></button>)}
    </div>
    <div className="role-banner"><Icon>{config.icon}</Icon><div><strong>{config.title}</strong><p>{config.description}</p></div></div>
    <form className="auth-form" onSubmit={submit}>
      {config.hasDepartment && <label className="field"><span>Assigned Facility Domain</span><select><option>Division of Electrical & Power Utilities</option><option>Sanitation & Water Infrastructure</option><option>HVAC & Climate Control Systems</option></select></label>}
      <label className="field"><span>{config.label}</span><input required value={identifier} placeholder={config.placeholder} onChange={(event) => setIdentifier(event.target.value)} /></label>
      <PasswordField id="login-password" label="System Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <label className="remember"><input type="checkbox" defaultChecked /> Remember on campus network</label>
      <button className="primary-action" type="submit">{config.button} <Icon>arrow_forward</Icon></button>
      <button className="secondary-action" type="button" onClick={onSignUp}>Don't have an account? Sign Up <Icon>person_add</Icon></button>
    </form>
  </div></main>;
}

function SignUpView({ onLogin }) {
  const [role, setRole] = useState('student');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setError(password === confirmation ? '' : 'Passwords must match.');
  }

  return <main className="auth-main"><div className="signup-card auth-card">
    <div className="card-heading card-heading-left"><span className="eyebrow">Campus Identity Management</span><h1>Create UnivPulse Account</h1><p>Register with your institutional campus ID to report issues, upvote tickets, and track infrastructure repairs.</p></div>
    <form className="auth-form" onSubmit={submit}>
      <div className="role-selector"><span>Institutional Role</span><div>{['student', 'faculty'].map((item) => <button key={item} className={role === item ? 'active' : ''} type="button" onClick={() => setRole(item)}>{item === 'student' ? 'Student' : 'Faculty / Staff'}</button>)}</div></div>
      <label className="field"><span>Full Name</span><input required placeholder="Jane Doe" /></label>
      <label className="field"><span>Institutional Email Address</span><input required type="email" placeholder="user@college.edu" /></label>
      <div className="field-grid"><label className="field"><span>{role === 'student' ? 'Student ID' : 'Employee ID'}</span><input required placeholder={role === 'student' ? 'STU-2025-8841' : 'FAC-2025-1092'} /></label><label className="field"><span>Department / Block</span><select required defaultValue=""><option value="" disabled>Select Assignment</option><option>Computer Science & Eng</option><option>Electrical Eng</option><option>Sciences</option><option>Administrative Staff</option></select></label></div>
      <div className="field-grid"><PasswordField id="signup-password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><PasswordField id="confirm-password" label="Confirm Password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
      <label className="remember"><input required type="checkbox" /> I agree to the Campus Community Guidelines and Infrastructure Reporting Conduct.</label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-action" type="submit">Create Account <Icon>arrow_forward</Icon></button>
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
