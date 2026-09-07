function setRole(role) {
  const studentButton = document.getElementById('roleStudent');
  const facultyButton = document.getElementById('roleFaculty');
  const idLabel = document.getElementById('idLabel');
  const idInput = document.getElementById('idNumber');
  const isStudent = role === 'student';

  studentButton.className = isStudent
    ? 'flex items-center justify-center gap-2 py-2 px-3 rounded text-label-md font-label-md transition-all bg-primary text-on-primary shadow-sm'
    : 'flex items-center justify-center gap-2 py-2 px-3 rounded text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-all';
  facultyButton.className = isStudent
    ? 'flex items-center justify-center gap-2 py-2 px-3 rounded text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-all'
    : 'flex items-center justify-center gap-2 py-2 px-3 rounded text-label-md font-label-md transition-all bg-primary text-on-primary shadow-sm';
  idLabel.textContent = isStudent ? 'Student ID' : 'Employee ID';
  idInput.placeholder = isStudent ? 'STU-2025-8841' : 'FAC-2025-1092';
}

function togglePasswordVisibility(fieldId, triggerButton) {
  const field = document.getElementById(fieldId);
  const icon = triggerButton.querySelector('span');
  const visible = field.type === 'password';
  field.type = visible ? 'text' : 'password';
  icon.textContent = visible ? 'visibility_off' : 'visibility';
}
