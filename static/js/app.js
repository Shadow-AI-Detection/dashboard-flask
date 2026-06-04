/**
 * Switch the visible page in the single-page dashboard UI.
 *
 * @param {string} name - Name of the page to display.
 * @param {HTMLElement} el - Navigation element that was clicked.
 *
 * Updates:
 * - Hides all pages
 * - Marks selected page as active
 * - Updates navigation active state
 * - Updates breadcrumb display
 */
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  el.classList.add('active');

  document.getElementById('breadcrumb-page').textContent =
    name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Initialize the dashboard once the DOM is fully loaded.
 *
 * Starts periodic API polling to fetch live results.
 */
document.addEventListener('DOMContentLoaded', () => {
  startPolling();
  fetchUsers();
});