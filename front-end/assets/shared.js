// UnivPulse shared client-side logic.
// Loaded (after assets/api.js) by reports.html, student_faculty.html,
// department_admin.html and super_admin.html, so the issue feed, upvote/
// status actions, and the notification/account menus have one
// implementation instead of four copies.
//
// Design note: earlier drafts of this file assumed the feed was static
// HTML baked into reports.html, with dashboards fetching that page and
// splicing its <main> in. Now that cards are rendered from the real API,
// that approach breaks (scripts inside a fetched-and-inserted fragment
// don't execute) -- so instead every page that shows the feed includes
// this script directly and calls initIssuesFeed(user) itself, targeting
// whichever of the optional element ids below happen to exist on that
// page. A page missing an id just skips that piece.

// --- Status model --------------------------------------------------------
// Matches issues.status / issues.priority in database/sql/schema.sql
// exactly -- there is no "Pending"/"Assigned" distinction in the real
// schema, just Reported -> Ongoing -> Finished.
const STATUS_ORDER = ['reported', 'ongoing', 'finished'];
const STATUS_META = {
  reported: { label: 'Reported', dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
  ongoing: { label: 'Ongoing', dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  finished: { label: 'Finished', dot: '#10B981', bg: '#ECFDF5', text: '#065F46' },
};

function initials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// --- Departments cache -----------------------------------------------------
// Fetched once per page load and reused by the filter dropdown, the
// submission form's department-override dropdown, and the department-admin
// header label.
let _departmentsPromise = null;
function loadDepartments() {
  if (!_departmentsPromise) _departmentsPromise = apiFetch('/api/departments');
  return _departmentsPromise;
}

let _categoriesPromise = null;
function loadCategories() {
  if (!_categoriesPromise) _categoriesPromise = apiFetch('/api/categories');
  return _categoriesPromise;
}

// --- Issue card rendering ---------------------------------------------------

function renderIssueCard(issue, user) {
  const meta = STATUS_META[issue.status];
  const isAdmin = user.role === 'administrator' || user.role === 'super_admin';
  const canUpvote = user.role === 'student' || user.role === 'faculty';

  const statusControl = isAdmin
    ? `<select
         class="text-label-sm font-label-sm font-semibold py-0.5 px-2 rounded-full border cursor-pointer focus:ring-1 focus:ring-secondary"
         style="border-color:${meta.dot}66;background:${meta.bg};color:${meta.text}"
         data-status-select data-issue-id="${issue.id}">
         <option value="${issue.status}" selected>&#9679; ${meta.label}</option>
         ${
           issue.next_status
             ? `<option value="${issue.next_status}">&#9679; Advance to ${STATUS_META[issue.next_status].label}</option>`
             : ''
         }
       </select>`
    : `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sm font-label-sm" style="background:${meta.bg};color:${meta.text}">
         <span class="w-1.5 h-1.5 rounded-full" style="background:${meta.dot}"></span>${meta.label}
       </span>`;

  const priorityBadge =
    issue.priority === 'high'
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-[#FEF2F2] text-[#991B1B] font-bold">
           <span class="material-symbols-outlined text-[14px]">priority_high</span>High Priority
         </span>`
      : '';

  const thumb = issue.photo_url
    ? `<img class="w-full h-full object-cover" src="${API_BASE}${issue.photo_url}" alt="">`
    : `<div class="w-full h-full flex items-center justify-center text-outline"><span class="material-symbols-outlined text-[28px]">image_not_supported</span></div>`;

  const upvoteControl = canUpvote
    ? `<button
         type="button"
         class="flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all active:scale-[0.98] ${
           issue.upvoted_by_me
             ? 'bg-secondary-fixed border-secondary text-on-secondary-fixed'
             : 'border-outline-variant bg-surface hover:bg-surface-container-low text-on-surface'
         }"
         data-upvote-btn data-issue-id="${issue.id}" data-upvoted="${issue.upvoted_by_me}">
         <span class="material-symbols-outlined text-[16px] text-secondary">thumb_up</span>
         <span class="text-label-sm font-label-sm font-bold vote-count">${issue.upvote_count}</span>
         <span class="text-label-sm font-label-sm text-outline hidden sm:inline">${issue.upvoted_by_me ? 'Endorsed' : 'Endorse'}</span>
       </button>`
    : `<span class="text-label-sm font-label-sm text-outline">${issue.upvote_count} upvote${issue.upvote_count === 1 ? '' : 's'}</span>`;

  return `
    <article class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-sm hover:border-outline transition-all duration-150" data-report-id="${issue.id}">
      <div class="flex flex-col sm:flex-row items-start gap-4">
        <div class="w-full sm:w-28 h-28 shrink-0 rounded overflow-hidden bg-surface-container border border-outline-variant relative">${thumb}</div>
        <div class="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                ${statusControl}
                ${priorityBadge}
                <span class="px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-mono">${escapeHtml(issue.category.name)}</span>
              </div>
              <span class="text-label-sm font-label-sm text-outline flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">schedule</span> ${timeAgo(issue.created_at)}
              </span>
            </div>
            <h3 class="text-title-md font-title-md text-primary tracking-tight">${escapeHtml(issue.title)}</h3>
            <p class="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-relaxed">${escapeHtml(issue.description)}</p>
            <div class="flex items-center gap-2 mt-1.5 text-body-sm font-body-sm text-on-surface-variant flex-wrap">
              <span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
              <span class="font-semibold text-on-surface">${escapeHtml(issue.building)}</span>
              <span class="text-outline">&bull;</span>
              <span>Floor ${escapeHtml(issue.floor)}, ${escapeHtml(issue.area_room)}</span>
              <span class="text-outline">&bull;</span>
              <span class="px-1.5 py-0.5 rounded bg-surface-container text-label-sm">${escapeHtml(issue.department.name)}</span>
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-outline-variant/60 pt-2.5 mt-3">
            <div class="flex items-center gap-2 text-label-sm font-label-sm text-outline">
              <span class="w-5 h-5 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-[10px]">${initials(issue.reporter.name)}</span>
              <span>Reported by <strong class="text-on-surface font-medium">${escapeHtml(issue.reporter.name)}</strong></span>
            </div>
            ${upvoteControl}
          </div>
        </div>
      </div>
    </article>`;
}

// --- Feed loading + wiring ---------------------------------------------------

async function fetchFeed(filters = {}) {
  const params = new URLSearchParams();
  if (filters.departmentId) params.set('department_id', filters.departmentId);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return apiFetch(`/api/issues${qs ? `?${qs}` : ''}`);
}

function applySearchFilter(issues, term) {
  if (!term) return issues;
  const needle = term.trim().toLowerCase();
  if (!needle) return issues;
  return issues.filter((issue) =>
    [issue.title, issue.description, issue.building, issue.area_room, issue.reporter.name]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  );
}

/**
 * Wires up the feed list, department filter, search box, and (if present)
 * the "Report an Issue" submission form on whichever of these element ids
 * exist in the current page:
 *
 *   #issues-feed-list        (required -- nothing renders without it)
 *   #issues-feed-empty       optional empty-state element to toggle
 *   #department-filter       optional <select>, populated from the API
 *   #department-scope-label  optional read-only label (department_admin)
 *   #search-input            optional text filter (client-side only)
 *   #report-form             optional submission form -- see wireReportForm
 *
 * Missing ids are silently skipped so the same function works whether a
 * page has the full Reports layout or only a subset of it.
 */
async function initIssuesFeed(user) {
  const listEl = document.getElementById('issues-feed-list');
  if (!listEl) return null;

  // initIssuesFeed can be called again later (e.g. to refresh the feed
  // after submitting a new report) -- guard the one-time wiring below
  // with this flag so a second call doesn't attach a second set of
  // event listeners to the same persistent listEl (which would fire
  // every upvote/status-change request twice, three times, etc.). Use
  // the returned render() function to refresh instead of calling this
  // again.
  if (listEl.dataset.wired === 'true') {
    await listEl._univpulseRender?.();
    return listEl._univpulseRender;
  }
  listEl.dataset.wired = 'true';

  const emptyEl = document.getElementById('issues-feed-empty');
  const searchInput = document.getElementById('search-input');
  const departmentFilter = document.getElementById('department-filter');
  const departmentScopeLabel = document.getElementById('department-scope-label');

  let currentIssues = [];

  async function render() {
    const filters = {};
    if (departmentFilter && departmentFilter.value) filters.departmentId = departmentFilter.value;

    listEl.innerHTML = `<div class="flex items-center justify-center gap-2 py-16 text-on-surface-variant text-body-sm font-body-sm">
      <span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>Loading reports&hellip;
    </div>`;

    try {
      currentIssues = await fetchFeed(filters);
    } catch (err) {
      listEl.innerHTML = `<div class="text-center py-16 text-error text-body-sm font-body-sm">${escapeHtml(err.message)}</div>`;
      return;
    }

    const visible = applySearchFilter(currentIssues, searchInput ? searchInput.value : '');
    if (visible.length === 0) {
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');
    listEl.innerHTML = visible.map((issue) => renderIssueCard(issue, user)).join('');
  }

  // Department filter: student/faculty/super_admin get a real dropdown;
  // administrator is scoped server-side to their own department no matter
  // what, so show a read-only label instead of a filter that couldn't
  // change anything.
  if (departmentFilter) {
    if (user.role === 'administrator') {
      departmentFilter.classList.add('hidden');
    } else {
      try {
        const departments = await loadDepartments();
        departmentFilter.innerHTML =
          '<option value="">All Departments</option>' +
          departments.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
      } catch {
        /* filter just stays on "All Departments" if this fails */
      }
      departmentFilter.addEventListener('change', render);
    }
  }

  if (departmentScopeLabel && user.role === 'administrator') {
    try {
      const departments = await loadDepartments();
      const mine = departments.find((d) => d.id === user.department_id);
      departmentScopeLabel.textContent = mine ? mine.name : 'Your department';
      departmentScopeLabel.classList.remove('hidden');
    } catch {
      /* label just stays hidden if this fails */
    }
  }

  if (searchInput) searchInput.addEventListener('input', () => render());

  // Event delegation for upvote + status-change, since cards are
  // re-rendered wholesale on every render() call.
  listEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-upvote-btn]');
    if (!btn) return;
    const issueId = btn.dataset.issueId;
    const alreadyUpvoted = btn.dataset.upvoted === 'true';
    btn.disabled = true;
    try {
      await apiFetch(`/api/issues/${issueId}/upvote`, { method: alreadyUpvoted ? 'DELETE' : 'POST' });
      await render();
    } catch (err) {
      alert(err.message);
      btn.disabled = false;
    }
  });

  listEl.addEventListener('change', async (event) => {
    const select = event.target.closest('[data-status-select]');
    if (!select) return;
    const issueId = select.dataset.issueId;
    const newStatus = select.value;
    select.disabled = true;
    try {
      await apiFetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await render();
    } catch (err) {
      alert(err.message);
      select.disabled = false;
    }
  });

  listEl._univpulseRender = render; // exposed so a re-entrant call above can reuse it
  await render();
  return render;
}

// --- "Report an Issue" submission form ---------------------------------------

/**
 * Wires the submission form if the page has one. Expected element ids
 * inside the form:
 *   #report-form, #report-category, #report-department-override,
 *   #report-title, #report-description, #report-building, #report-floor,
 *   #report-area-room, #report-photo, #report-submit, #report-error
 */
async function wireReportForm(onCreated) {
  const form = document.getElementById('report-form');
  if (!form) return;

  const categorySelect = document.getElementById('report-category');
  const departmentSelect = document.getElementById('report-department-override');
  const errorEl = document.getElementById('report-error');
  const submitBtn = document.getElementById('report-submit');

  try {
    const [categories, departments] = await Promise.all([loadCategories(), loadDepartments()]);
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="" disabled selected>Select category&hellip;</option>' +
        categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    }
    if (departmentSelect) {
      departmentSelect.innerHTML =
        '<option value="">Auto-suggest from category (recommended)</option>' +
        departments.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
    }
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = `Couldn't load categories/departments: ${err.message}`;
      errorEl.classList.remove('hidden');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
      let photoUrl = null;
      const photoInput = document.getElementById('report-photo');
      if (photoInput && photoInput.files && photoInput.files[0]) {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        const uploadResult = await apiFetch('/api/uploads', { method: 'POST', body: formData });
        photoUrl = uploadResult.url;
      }

      const payload = {
        category_id: categorySelect.value,
        title: document.getElementById('report-title').value.trim(),
        description: document.getElementById('report-description').value.trim(),
        building: document.getElementById('report-building').value.trim(),
        floor: document.getElementById('report-floor').value.trim(),
        area_room: document.getElementById('report-area-room').value.trim(),
      };
      if (departmentSelect && departmentSelect.value) payload.department_id = departmentSelect.value;
      if (photoUrl) payload.photo_url = photoUrl;

      await apiFetch('/api/issues', { method: 'POST', body: JSON.stringify(payload) });

      form.reset();
      if (onCreated) await onCreated();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      } else {
        alert(err.message);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// --- Header: account menu + notifications -----------------------------------
// Attaches to whatever button already carries title="Account" / title=
// "Notifications" in the page's header markup, so no per-page HTML changes
// are needed beyond removing the old dev-only role switcher.

function wireAccountMenu(user) {
  const accountBtn = document.querySelector('[title="Account"]');
  if (!accountBtn) return;

  const menu = document.createElement('div');
  menu.className =
    'hidden absolute right-4 top-14 z-50 w-56 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-3 text-body-sm font-body-sm';
  menu.innerHTML = `
    <p class="font-semibold text-on-surface">${escapeHtml(user.name)}</p>
    <p class="text-on-surface-variant text-label-sm mb-2">${escapeHtml(user.email)} &middot; ${escapeHtml(user.role.replace('_', ' '))}</p>
    <button type="button" id="logout-btn" class="w-full text-left px-2 py-1.5 rounded hover:bg-surface-container text-error font-medium flex items-center gap-1.5">
      <span class="material-symbols-outlined text-[18px]">logout</span>Log out
    </button>`;
  accountBtn.insertAdjacentElement('afterend', menu);
  accountBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelector('#logout-btn').addEventListener('click', logout);
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && event.target !== accountBtn) menu.classList.add('hidden');
  });
}

function wireNotifications() {
  const bellBtn = document.querySelector('[title="Notifications"]');
  if (!bellBtn) return;

  bellBtn.style.position = 'relative';
  const badge = document.createElement('span');
  badge.className =
    'hidden absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center';
  bellBtn.appendChild(badge);

  const panel = document.createElement('div');
  panel.className =
    'hidden absolute right-4 top-14 z-50 w-80 max-h-96 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-2 text-body-sm font-body-sm';
  bellBtn.insertAdjacentElement('afterend', panel);

  async function refresh() {
    let notifications = [];
    try {
      notifications = await apiFetch('/api/notifications');
    } catch {
      return;
    }
    const unread = notifications.filter((n) => !n.read_status).length;
    badge.textContent = unread > 9 ? '9+' : String(unread);
    badge.classList.toggle('hidden', unread === 0);

    panel.innerHTML = notifications.length
      ? notifications
          .slice(0, 20)
          .map(
            (n) => `
        <button type="button" data-notif-id="${n.id}" class="w-full text-left p-2 rounded hover:bg-surface-container flex gap-2 ${n.read_status ? 'opacity-60' : ''}">
          <span class="material-symbols-outlined text-[16px] text-secondary mt-0.5">${n.read_status ? 'mark_email_read' : 'mark_email_unread'}</span>
          <span class="flex-1">
            <span class="block text-on-surface">${escapeHtml(n.message)}</span>
            <span class="block text-label-sm text-outline mt-0.5">${timeAgo(n.created_at)}</span>
          </span>
        </button>`
          )
          .join('')
      : `<p class="text-center text-outline py-6">No notifications yet.</p>`;
  }

  bellBtn.addEventListener('click', async () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) await refresh();
  });
  panel.addEventListener('click', async (event) => {
    const item = event.target.closest('[data-notif-id]');
    if (!item) return;
    try {
      await apiFetch(`/api/notifications/${item.dataset.notifId}/read`, { method: 'PATCH' });
      await refresh();
    } catch {
      /* non-critical -- leave it unread rather than break the UI */
    }
  });
  document.addEventListener('click', (event) => {
    if (!panel.contains(event.target) && event.target !== bellBtn) panel.classList.add('hidden');
  });

  refresh();
  setInterval(refresh, 20000); // polling, per the project's no-websockets decision
}

// --- Page bootstrap -----------------------------------------------------------
// Call this once per protected page: checks auth, wires the header menus,
// loads the feed, and wires the submission form if present.
async function initUnivPulsePage(allowedRoles) {
  const auth = requireAuth(allowedRoles);
  if (!auth) return null; // requireAuth already redirected

  wireAccountMenu(auth.user);
  wireNotifications();
  const refreshFeed = await initIssuesFeed(auth.user);
  // Reuse the same render() closure returned above rather than calling
  // initIssuesFeed(auth.user) again here -- a second call would (used
  // to) re-attach the feed's click/change listeners on top of the
  // existing ones, so every upvote/status-change after submitting a
  // report fired one extra request per prior submission.
  await wireReportForm(refreshFeed);

  return auth;
}
