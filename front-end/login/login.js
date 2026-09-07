let currentRole = 'student';

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
  currentRole = role;
  ['student', 'dept', 'super'].forEach((tabName) => {
    const tab = document.getElementById(`tab-${tabName}`);
    if (!tab) return;
    tab.className = tabName === role
      ? 'flex flex-col items-center justify-center py-2.5 px-2 rounded font-label-sm text-label-sm transition-all duration-150 bg-surface-container-lowest text-primary shadow-sm border border-outline-variant font-semibold'
      : 'flex flex-col items-center justify-center py-2.5 px-2 rounded font-label-sm text-label-sm transition-all duration-150 text-on-surface-variant hover:text-primary';
  });

  const config = roleData[role];
  if (!config) return;
  document.getElementById('role-title').innerText = config.title;
  document.getElementById('role-subtext').innerText = config.subtext;
  document.getElementById('role-icon').innerText = config.icon;
  document.getElementById('label-identifier').innerText = config.identifierLabel;
  document.getElementById('identifier-input').placeholder = config.emailPlaceholder;
  document.getElementById('btn-text').innerText = config.btnText;
  document.getElementById('dept-selector-wrapper').classList.toggle('hidden', !config.hasDept);
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
  passwordIcon.innerText = visible ? 'visibility_off' : 'visibility';
}
