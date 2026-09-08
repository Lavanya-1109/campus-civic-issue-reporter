function setRole(role) {
  const studentButton = document.getElementById('roleStudent');
  const facultyButton = document.getElementById('roleFaculty');
  const idLabel = document.getElementById('idLabel');
  const idInput = document.getElementById('idNumber');
  const isStudent = role === 'student';

  studentButton.classList.toggle('is-active', isStudent);
  facultyButton.classList.toggle('is-active', !isStudent);
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

document.querySelectorAll('[data-signup-role]').forEach((button) => {
  button.addEventListener('click', () => setRole(button.dataset.signupRole));
});
document.querySelectorAll('.password-toggle').forEach((button) => {
  button.addEventListener('click', () => togglePasswordVisibility(button.closest('.password-field').querySelector('input').id, button));
});
document.getElementById('signup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const password = document.getElementById('password').value;
  const confirmation = document.getElementById('confirmPassword').value;
  const error = document.getElementById('signup-error');
  error.hidden = password === confirmation;
  error.textContent = error.hidden ? '' : 'Passwords must match.';
});
