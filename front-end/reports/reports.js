document.addEventListener('DOMContentLoaded', async () => {
  // Anyone logged in can view Reports -- role-specific behavior (upvote
  // button vs. status dropdown, submission form visibility) is decided
  // inside initUnivPulsePage/initIssuesFeed based on the real role.
  const auth = await initUnivPulsePage(['student', 'faculty', 'administrator', 'super_admin']);
  if (!auth) return;

  // Only student/faculty report issues (README: roles table) -- admins
  // land on this page too via the "Reports" nav link, but shouldn't see
  // a submission form.
  const panel = document.getElementById('report-panel');
  if (panel) {
    panel.classList.toggle('hidden', !['student', 'faculty'].includes(auth.user.role));
  }
});
