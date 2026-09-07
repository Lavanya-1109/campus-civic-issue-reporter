document.addEventListener('DOMContentLoaded', () => {
  const roleSwitcher = document.getElementById('dev-role-switcher');
  const departmentSwitcher = document.getElementById('dev-department-switcher');
  const savedRole = localStorage.getItem('univpulse_dev_role') || 'student';
  const savedDepartment = localStorage.getItem('univpulse_dev_department') || 'electrical';

  function syncRole(role) {
    departmentSwitcher.classList.toggle('hidden', role !== 'department_admin');
    applyRole(role, departmentSwitcher.value);
    restoreLocalOverrides();
  }

  roleSwitcher.value = savedRole;
  departmentSwitcher.value = savedDepartment;
  syncRole(savedRole);
  roleSwitcher.addEventListener('change', (event) => syncRole(event.target.value));
  departmentSwitcher.addEventListener('change', () => syncRole(roleSwitcher.value));
});
