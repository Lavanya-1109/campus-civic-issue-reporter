const roleData = {
  student: {
    title: 'Campus Member Access',
    subtext: 'Log in using institutional @college.edu address to report incidents, track live repair tickets, and upvote existing infrastructure complaints.',
    identifierLabel: 'College ID / Email Address',
    emailPlaceholder: 'student.id@college.edu',
    demoEmail: 'akash.sharma@college.edu',
    btnText: 'Sign In to Student Portal',
    hasDept: false,
    icon: 'school'
  },
  dept: {
    title: 'Department Admin Console',
    subtext: 'Authorized maintenance personnel. Access assigned ticket queues, dispatch ground technicians, and update repair milestones for your specialized trade.',
    identifierLabel: 'Technician Staff ID / Work Email',
    emailPlaceholder: 'admin.electrical@college.edu',
    demoEmail: 'lead.electrical@college.edu',
    btnText: 'Sign In to Maintenance Console',
    hasDept: true,
    icon: 'engineering'
  },
  super: {
    title: 'Super-Admin Infrastructure Oversight',
    subtext: 'Central Administration and Dean of Campus Infrastructure. Comprehensive audit visibility across electrical, HVAC, sanitation, and civil safety assets.',
    identifierLabel: 'Super-Admin Credentials',
    emailPlaceholder: 'superadmin@college.edu',
    demoEmail: 'dean.infrastructure@college.edu',
    btnText: 'Sign In to Central Oversight',
    hasDept: false,
    icon: 'admin_panel_settings'
  }
};

function selectTab(role) {
  const config = roleData[role];
  if (!config) return;
  document.querySelectorAll('[data-role-tab]').forEach((tab) => {
    const active = tab.dataset.roleTab === role;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.getElementById('role-title').textContent = config.title;
  document.getElementById('role-subtext').textContent = config.subtext;
  document.getElementById('role-icon').textContent = config.icon;
  document.getElementById('label-identifier').textContent = config.identifierLabel;
  document.getElementById('identifier-input').placeholder = config.emailPlaceholder;
  document.getElementById('btn-text').textContent = config.btnText;
  document.getElementById('dept-selector-wrapper').hidden = !config.hasDept;
}

function setRole(role) {
  selectTab(role);
  document.getElementById('identifier-input').value = roleData[role].demoEmail;
  document.getElementById('password-input').value = 'CampusPulse#2025';
}

function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password-input');
  const passwordIcon = document.getElementById('pwd-icon');
  const visible = passwordInput.type === 'password';
  passwordInput.type = visible ? 'text' : 'password';
  passwordIcon.textContent = visible ? 'visibility_off' : 'visibility';
  document.getElementById('password-toggle').setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
}

document.querySelectorAll('[data-role-tab]').forEach((tab) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.roleTab));
});
document.querySelectorAll('[data-demo-role]').forEach((button) => {
  button.addEventListener('click', () => setRole(button.dataset.demoRole));
});
document.getElementById('password-toggle').addEventListener('click', togglePasswordVisibility);
document.getElementById('login-form').addEventListener('submit', (event) => event.preventDefault());
