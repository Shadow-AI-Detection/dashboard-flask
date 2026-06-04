const POLL_INTERVAL = 5000;

let allResults = [];
let ipStats = {};

/**
 * Takes the list of all flows and builds a dictionary grouped by source IP.
 * For each flow, it increments the total counter, and if the flow is predicted as AI,
 * it also increments the AI counter.
 *
 * @param {Array<Object>} results - List of flow result objects.
 * @returns {Object} stats - Aggregated statistics indexed by IP.
 */
function buildIpStats(results) {
  const stats = {};
  results.forEach(r => {
    const ip = r.SrcAddr || r.saddr || r.src_addr;

    if (!ip) {
      return ;
    }
    if (!stats[ip]) {
      stats[ip] = {
        total: 0,
        ai: 0
      }
    }

    // Incrementation of the number of flows
    stats[ip].total++;

    // Incrementation of the number of AI flows
    if (r.prediction === 1){
      stats[ip].ai++;
    }
  });

  return stats;
}


/**
 * Update the live status indicator in the UI.
 *
 * @param {boolean} on - Whether the system is live/active.
 * @param {string} text - Status text to display.
 */
function setLiveStatus(on, text) {
  const dot = document.getElementById('live-dot');
  const label = document.getElementById('live-text');

  dot.classList.toggle('on', on);
  label.textContent = text;
}

/**
 * Fetch flow results from the backend API and update the dashboard state.
 *
 * Updates: allResults with the full dataset, ipStats with aggregated per-IP
 * statistics and the live status indicator
 */
async function fetchResults() {
  try {
    const res = await fetch('/results');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      allResults = data;
      ipStats = buildIpStats(data);
      setLiveStatus(true, 'capture in progress');
    } else {
      setLiveStatus(false, 'waiting for data');
    }
  } catch {
    setLiveStatus(false, 'API unreachable');
  }
  renderDashboard(allResults);
  renderUsers(ipStats);
}

/**
 * Start periodic polling of the backend results API.
 * Calls fetchResults immediately, then repeats at a fixed interval.
 */
function startPolling() {
  fetchResults();
  setInterval(fetchResults, POLL_INTERVAL);
}