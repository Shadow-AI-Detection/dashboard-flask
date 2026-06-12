let allUsers = [];
let allIpStats = {};

/**
 * Fetch user statistics from the backend API and update the users view
 */
async function fetchUsers() {
  const res = await fetch('/users/');
  allUsers = await res.json();
  renderUsers(allIpStats);
}

 /**
  * Generate initials from a user's name. Extracts the first letter of each word,
  * keeps the first two initials, and converts them to uppercase.
  *
  * @param {string} name : Full name of the user
  * @returns {string} User initials
  */
function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/**
 * Delete a user from the backend and refresh the users list.
 *
 * @param {number|string} id : Identifier of the user to delete.
 * @returns {Promise<void>}
 */
async function deleteUser(id) {
  if (!confirm('Supprimer cet utilisateur ?')) return;
  await fetch(`/users/${id}/`, { method: 'DELETE' });
  fetchUsers();
}

/**
 * Render a table row displaying user information and associated flow statistics.
 *
 * For each user, displays:
 * - Avatar with generated initials
 * - Name, email, IP address, and device
 * - Total number of captured flows
 * - Percentage of AI-classified flows
 * - Delete action button
 *
 * @param {Object} u : User object.
 * @param {Object} ipStats : Aggregated flow statistics indexed by IP address.
 * @returns {string} HTML string representing a user table row.
 */
function renderUserRow(u, ipStats) {
  const stats = ipStats[u.ip_address] || { total: 0, ai: 0 };
  const aiShare = stats.total > 0 ? Math.round(stats.ai / stats.total * 100) : 0;
  const color = aiShare >= 50 ? '#ef4444' : '#f59e0b';
  const initials = getInitials(u.name);
  const bgColor = '#9ca3af';

  return `<tr>
    <td>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:26px;height:26px;border-radius:50%;background:${bgColor};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>
        <span style="font-weight:500;color:#111827">${u.name}</span>
      </div>
    </td>
    <td style="color:#6b7280">${u.email || '—'}</td>
    <td class="mono">${u.ip_address}</td>
    <td style="color:#6b7280">${u.device || '—'}</td>
    <td style="font-weight:600;color:#111827">${stats.total}</td>
    <td>
      <div class="ai-bar-wrap">
        <div class="ai-bar"><div class="ai-bar-fill" style="width:${aiShare}%;background:${color}"></div></div>
        <span style="font-size:11px;font-weight:600;color:#374151">${aiShare}%</span>
      </div>
    </td>
    <td>
      <span onclick="deleteUser(${u.id})" style="cursor:pointer;color:#9ca3af;font-size:14px" title="Supprimer">
          <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3.5H10M5 5.5V8.5M7 5.5V8.5M2.5 3.5L3 9.5C3 9.76522 3.10536 10.0196 3.29289 10.2071C3.48043 10.3946 3.73478 10.5 4 10.5H8C8.26522 10.5 8.51957 10.3946 8.70711 10.2071C8.89464 10.0196 9 9.76522 9 9.5L9.5 3.5M4.5 3.5V2C4.5 1.86739 4.55268 1.74021 4.64645 1.64645C4.74021 1.55268 4.86739 1.5 5 1.5H7C7.13261 1.5 7.25979 1.55268 7.35355 1.64645C7.44732 1.74021 7.5 1.86739 7.5 2V3.5" stroke="#EF4444" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>
       </span>
    </td>
  </tr>`;
}

/**
 * Render the users table and update user-related dashboard statistics.
 *
 * Users can be filtered by name, IP address, or device. The function
 * also computes summary metrics. If no users match the filter criteria,
 * an empty-state message is displayed.
 *
 * @param {Object} ipStats : Aggregated flow statistics indexed by IP address.
 */
function renderUsers(ipStats) {
  allIpStats = ipStats;
  const search = document.getElementById('user-search').value.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search) ||
    u.ip_address.includes(search) ||
    (u.device || '').toLowerCase().includes(search)
  );

  const heavy = filtered.filter(u => {
    const stats = ipStats[u.ip_address] || { total: 0, ai: 0 };
    return stats.total > 0 && (stats.ai / stats.total) >= 0.5;
  }).length;
  const totalAttr = filtered.reduce((s, u) => s + (ipStats[u.ip_address]?.ai || 0), 0);

  document.getElementById('u-mapped').textContent = filtered.length;
  document.getElementById('u-heavy').textContent = heavy;
  document.getElementById('u-attr').textContent = totalAttr;

  if (filtered.length === 0) {
    document.getElementById('user-tbody').innerHTML = '<tr><td colspan="8" class="empty">No users</td></tr>';
    return;
  }
  document.getElementById('user-tbody').innerHTML = filtered.map(u => renderUserRow(u, ipStats)).join('');
}

 /**
  * Open the "Add User" modal by displaying it.
  */
function openAddUserModal() {
  document.getElementById('user-modal').style.display = 'flex';
}

/**
 * Close the "Add User" modal by hiding it.
 */
  documen
function closeAddUserModal() {
  document.getElementById('user-modal').style.display = 'none';
}

/**
 * Submit a new user to the backend API.
 *
 * Collects form values, validates required fields (name and IP address),
 * sends a POST request to create the user, then refreshes the user list.
 */
async function submitAddUser() {
  const name       = document.getElementById('input-name').value.trim();
  const email      = document.getElementById('input-email').value.trim();
  const ip_address = document.getElementById('input-ip').value.trim();
  const device     = document.getElementById('input-device').value.trim();

  if (!name || !ip_address) return alert('Name and IP are required');

  await fetch('/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, ip_address, device })
  });

  closeAddUserModal();
  fetchUsers();
}