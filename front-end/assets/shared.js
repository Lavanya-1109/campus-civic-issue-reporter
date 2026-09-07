// UnivPulse shared client-side helpers.
// Loaded by reports/code.html, student_faculty/code.html, department_admin/code.html
// and super_admin/code.html so there's one source of truth instead of
// copy-pasted functions in every page.

// Central status -> color mapping, used by the card badge/select AND the
// shared detail panel, so all three always agree on what each status looks like.
const STATUS_STYLES = {
  'Pending':     { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' },
  'Assigned':    { dot: '#6366F1', bg: '#EEF2FF', text: '#3730A3', border: '#6366F1' },
  'In Progress': { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E', border: '#F59E0B' },
  'Resolved':    { dot: '#10B981', bg: '#ECFDF5', text: '#065F46', border: '#10B981' },
};

// Upvote/endorse toggle on feed cards.
function upvoteToggle(btn) {
  const countEl = btn.querySelector('.vote-count');
  let current = parseInt(countEl.textContent, 10);
  const isUpvoted = btn.classList.contains('bg-secondary-fixed');

  if (isUpvoted) {
    btn.classList.remove('bg-secondary-fixed', 'border-secondary');
    countEl.textContent = current - 1;
  } else {
    btn.classList.add('bg-secondary-fixed', 'border-secondary');
    countEl.textContent = current + 1;
  }
}

// Role-gated visibility: any element tagged data-role-visible="student,faculty"
// (comma separated role list) is shown only when the current role is in that
// list. TODO: replace with the real logged-in role from your auth/session --
// this currently reads a dev-only switcher / localStorage value.
//
// department_admin is additionally scoped by department: any element tagged
// data-department="electrical" is hidden unless it matches the admin's own
// department. This is what stops a department admin from seeing OR editing
// another department's reports -- the role-visible status dropdown alone
// only controlled who could see an edit control, not which reports they
// applied to, so this closes that gap.
function applyRole(role, department) {
  document.querySelectorAll('[data-role-visible]').forEach((el) => {
    const allowed = el.dataset.roleVisible.split(',').map((r) => r.trim());
    el.classList.toggle('hidden', !allowed.includes(role));
  });

  document.querySelectorAll('[data-department]').forEach((card) => {
    const isScopedRole = role === 'department_admin';
    card.classList.toggle('hidden', isScopedRole && card.dataset.department !== department);
  });

  localStorage.setItem('univpulse_dev_role', role);
  if (department) localStorage.setItem('univpulse_dev_department', department);

  // If the role switched away from an admin role, or department scoping now
  // hides the currently-open report, close the detail panel so it can't show
  // (or let someone edit) a report they shouldn't have access to anymore.
  const panel = document.getElementById('detail-panel');
  if (panel) {
    const openId = panel.dataset.openReportId;
    const stillAllowed = role === 'department_admin' || role === 'super_admin';
    const card = openId ? document.querySelector(`[data-report-id="${openId}"]`) : null;
    const cardVisible = card && !card.classList.contains('hidden');
    if (!stillAllowed || (openId && !cardVisible)) {
      clearDetailPanel();
    }
  }
}

// Applies status colors/text to the read-only badge shown to student/faculty.
function applyBadgeStyle(badge, status) {
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  badge.style.backgroundColor = s.bg;
  badge.style.color = s.text;
  const dot = badge.querySelector('[data-status-dot]');
  if (dot) dot.style.backgroundColor = s.dot;
  const label = badge.querySelector('[data-status-label]');
  if (label) label.textContent = status;
}

// Fires when a department/super admin changes a card's quick-status dropdown.
// Recolors the dropdown itself AND keeps the student/faculty read-only badge
// on the same card in sync. If this card is currently open in the detail
// panel, keeps that panel's status buttons in sync too.
// TODO: wire this to your real PATCH /reports/:id (or equivalent) endpoint
// once your backend exists -- see saveDetailUpdate() below for where that
// call belongs.
function statusChanged(select) {
  const status = select.value;
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  select.style.borderColor = s.dot + '66';
  select.style.backgroundColor = s.bg;
  select.style.color = s.text;

  const card = select.closest('[data-report-id]');
  if (card) {
    const badge = card.querySelector('[data-status-badge]');
    if (badge) applyBadgeStyle(badge, status);

    const panel = document.getElementById('detail-panel');
    if (panel && panel.dataset.openReportId === card.dataset.reportId) {
      highlightDetailStatusButton(status);
      updateDetailStatusPill(status);
    }
  }
}

// --- Shared detail/status panel --------------------------------------------
// Populated when an admin clicks "Manage Status" on a card in the feed.
// Shared by department_admin and super_admin since both fetch this same
// reports.html and get the panel via applyRole()'s role gating.

function highlightDetailStatusButton(status) {
  document.querySelectorAll('#detail-status-buttons [data-status-option]').forEach((btn) => {
    const isActive = btn.dataset.statusOption === status;
    const s = STATUS_STYLES[btn.dataset.statusOption];
    btn.classList.toggle('text-on-surface-variant', !isActive);
    btn.style.borderColor = isActive ? s.border : '#c5c6cd';
    btn.style.backgroundColor = isActive ? s.bg : '';
    btn.style.color = isActive ? s.text : '';
  });
}

function updateDetailStatusPill(status) {
  const pill = document.getElementById('detail-status-pill');
  if (!pill) return;
  const s = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  pill.textContent = 'Status: ' + status;
  pill.style.backgroundColor = s.bg;
  pill.style.color = s.text;
  pill.classList.remove('hidden');
}

// Opens the shared detail panel for the report whose "Manage Status" link
// was clicked, and fills it in from that card's own DOM + data attributes
// (single source of truth -- nothing is duplicated into JS constants).
function selectReportForReview(triggerEl) {
  const card = triggerEl.closest('[data-report-id]');
  if (!card) return;
  const panel = document.getElementById('detail-panel');
  if (!panel) return;

  // Highlight the selected card, clear any previous selection.
  document.querySelectorAll('[data-report-id]').forEach((c) => {
    c.classList.remove('border-secondary', 'border-2');
  });
  card.classList.add('border-secondary', 'border-2');

  panel.dataset.openReportId = card.dataset.reportId;

  document.getElementById('detail-id-label').textContent = '#' + card.dataset.reportId + ' DETAIL VIEW';
  document.getElementById('detail-title').textContent =
    card.querySelector('h3').textContent.trim();
  document.getElementById('detail-description').textContent = card.dataset.description || '';

  const cardImg = card.querySelector('img');
  const detailImg = document.getElementById('detail-photo');
  if (cardImg) detailImg.src = cardImg.src;

  const deptNames = {
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    hvac: 'HVAC',
    'av-it': 'AV/IT Equipment',
    civil: 'Civil Works',
  };
  document.getElementById('detail-department').textContent =
    deptNames[card.dataset.department] || card.dataset.department;

  const locationParts = Array.from(
    card.querySelectorAll('.text-body-sm.text-on-surface-variant > span:not(.material-symbols-outlined)')
  )
    .map((el) => el.textContent.trim())
    .filter((t) => t && t !== '•');
  document.getElementById('detail-location').textContent = locationParts.join(', ');

  const reporterStrong = card.querySelector('.text-outline strong, .text-label-sm strong');
  document.getElementById('detail-reporter').textContent = reporterStrong ? reporterStrong.textContent.trim() : '—';

  const voteCount = card.querySelector('.vote-count');
  document.getElementById('detail-upvotes').textContent =
    (voteCount ? voteCount.textContent.trim() : '0') + ' student upvotes';

  const currentStatus =
    card.querySelector('[data-status-select]')?.value ||
    card.querySelector('[data-status-label]')?.textContent.trim() ||
    'Pending';
  highlightDetailStatusButton(currentStatus);
  updateDetailStatusPill(currentStatus);

  const overrides = getReportOverrides();
  const savedNote = overrides[card.dataset.reportId]?.note || '';
  document.getElementById('detail-note').value = savedNote;

  document.getElementById('detail-empty-state').classList.add('hidden');
  const content = document.getElementById('detail-content');
  content.classList.remove('hidden');
  content.classList.add('flex');
  document.getElementById('detail-save-confirm').classList.add('hidden');

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Click handler for the 3 status buttons inside the detail panel. Only
// updates the panel's own UI + the underlying card -- saving still requires
// clicking "Save Status Update" below, same as the resolution note.
function setDetailStatus(btn) {
  const status = btn.dataset.statusOption;
  highlightDetailStatusButton(status);
  updateDetailStatusPill(status);

  const panel = document.getElementById('detail-panel');
  const card = document.querySelector(`[data-report-id="${panel.dataset.openReportId}"]`);
  const select = card?.querySelector('[data-status-select]');
  if (select) {
    select.value = status;
    statusChanged(select);
  }
}

function clearDetailPanel() {
  const panel = document.getElementById('detail-panel');
  if (!panel) return;
  delete panel.dataset.openReportId;
  document.getElementById('detail-content').classList.add('hidden');
  document.getElementById('detail-content').classList.remove('flex');
  document.getElementById('detail-empty-state').classList.remove('hidden');
  document.getElementById('detail-status-pill').classList.add('hidden');
  document.getElementById('detail-id-label').textContent = 'SELECT A REPORT';
  document.querySelectorAll('[data-report-id]').forEach((c) => {
    c.classList.remove('border-secondary', 'border-2');
  });
}

// --- Local persistence (TEMPORARY stand-in for the real backend) ----------
// There's no API yet, so status + resolution-note edits are saved to
// localStorage instead, keyed by report id, purely so the demo doesn't lose
// your edits on refresh. Everything in this section should be deleted once
// a real backend exists -- see the TODO markers below for the actual shape
// the API calls should take.

const REPORT_OVERRIDES_KEY = 'univpulse_report_overrides';

function getReportOverrides() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

// Called when an admin clicks "Save Status Update" in the detail panel.
function saveDetailUpdate() {
  const panel = document.getElementById('detail-panel');
  const id = panel.dataset.openReportId;
  if (!id) return;

  const card = document.querySelector(`[data-report-id="${id}"]`);
  const status = card?.querySelector('[data-status-select]')?.value || null;
  const note = document.getElementById('detail-note').value;

  // TODO: replace this whole block with a real API call once the backend
  // exists, e.g.:
  //   await fetch(`/api/reports/${id}`, {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ status, note }),
  //   });
  // and only fall back to localStorage if that request fails, as an offline
  // cache -- not as the primary store.
  const overrides = getReportOverrides();
  overrides[id] = { status, note, updatedAt: new Date().toISOString() };
  localStorage.setItem(REPORT_OVERRIDES_KEY, JSON.stringify(overrides));

  const confirmEl = document.getElementById('detail-save-confirm');
  confirmEl.classList.remove('hidden');
  confirmEl.classList.add('flex');
  setTimeout(() => {
    confirmEl.classList.add('hidden');
    confirmEl.classList.remove('flex');
  }, 2000);

  console.log('Saved locally (demo only, no backend yet) for', id, overrides[id]);
}

// Re-applies any locally saved status overrides to cards on page load, so a
// refresh doesn't silently discard an admin's status edits. (Resolution
// notes are restored per-report when that report is opened in the detail
// panel -- see selectReportForReview() above -- not globally, since they
// only ever live inside that one panel.)
// TODO: once a backend exists, replace this with a real GET /api/reports
// call and render from that response instead of static HTML + overrides.
function restoreLocalOverrides() {
  const overrides = getReportOverrides();
  document.querySelectorAll('[data-report-id]').forEach((card) => {
    const saved = overrides[card.dataset.reportId];
    if (!saved || !saved.status) return;

    const select = card.querySelector('[data-status-select]');
    if (select) {
      select.value = saved.status;
      statusChanged(select); // also syncs the read-only badge
    } else {
      const badge = card.querySelector('[data-status-badge]');
      if (badge) applyBadgeStyle(badge, saved.status);
    }
  });
}
