function formatTime(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Return a color code based on a confidence value.
 *
 * @param {number} v - Confidence score (0–100).
 * @returns {string} Hex color representing the confidence level: green, orange or red
 */
function confColor(v) {
  return v >= 90 ? '#22c55e' : v >= 75 ? '#f59e0b' : '#ef4444';
}

/**
 * Render an HTML badge indicating whether a flow is AI-generated or not
 *
 * @param {boolean} isAI : True if the flow is classified as AI-generated
 * @returns {string} HTML string representing a styled status badge
 */
function renderBadge(isAI) {
  const cls = isAI ? 'badge-ai' : 'badge-nonai';
  const color = isAI ? '#dc2626' : '#16a34a';
  const label = isAI ? 'AI' : 'Non-AI';
  return `<span class="badge ${cls}"><span class="badge-dot" style="background:${color}"></span>${label}</span>`;
}

/**
 * Render a confidence bar UI component
 *
 * @param {number} value : Confidence value (0–100)
 * @returns {string} HTML string representing a styled confidence bar
 */
function renderConfBar(value) {
  return `
    <div class="conf-wrap">
      <div class="conf-bar"><div class="conf-fill" style="width:${value}%;background:${confColor(value)}"></div></div>
      <span style="font-size:12px;font-weight:600;color:#374151;min-width:24px">${value}</span>
    </div>`;
}

/**
 * Render a single table row for a network flow entry.
 *
 * @param {Object} r - Flow record object.
 * @param {number} i - Index used for time formatting.
 * @returns {string} HTML string representing a table row.
 *
 * Displays:
 * - Timestamp (formatted index-based time)
 * - Source IP address
 * - AI / Non-AI badge
 * - Randomized confidence bar (for UI simulation)
 */
function renderFlowRow(r, i) {
  const isAI = r.prediction === 1;
  const conf = r.confidence ?? -2;
  return `<tr>
    <td>${formatTime(r.captured_at)}</td>
    <td class="mono">${r.SrcAddr || r.saddr || r.src_addr|| '—'}</td>
    <td>${renderBadge(isAI)}</td>
    <td>${renderConfBar(conf)}</td>
  </tr>`;
}

 /**
  * Render a traffic distribution summary component as HTML
  *
  * @param {number} aiFlows : Number of AI-classified flows.
  * @param {number} nonAi : Number of non-AI flows.
  * @param {number} total : Total number of flows captured.
  * @param {number} aiPercentage : Percentage of AI flows (0–100).
  * @returns {string} HTML string representing the distribution summary
  */
function renderDistribution(aiFlows, nonAi, total, aiPercentage) {
  return `
    <div class="dist-row">
      <div><span class="dist-dot" style="background:#ef4444"></span><span style="color:#374151">AI flows</span></div>
      <span style="font-weight:600;color:#111827">${aiFlows} <span style="color:#9ca3af;font-weight:400">${aiPercentage}%</span></span>
    </div>
    <div class="dist-row">
      <div><span class="dist-dot" style="background:#22c55e"></span><span style="color:#374151">Non-AI</span></div>
      <span style="font-weight:600;color:#111827">${nonAi} <span style="color:#9ca3af;font-weight:400">${100 - aiPercentage}%</span></span>
    </div>
    <div class="dist-row dist-sep">
      <span style="color:#6b7280">Total capturés</span>
      <span style="font-weight:700;color:#111827">${total}</span>
    </div>`;
}

function renderDashboard(results) {
  const total = results.length;
  const aiFlows = results.filter(r => r.prediction === 1).length;
  const nonAi = total - aiFlows;
  const aiPercentage = total > 0 ? Math.round(aiFlows / total * 100) : 0;
  const uniqSource = new Set(results.filter(r => r.prediction === 1).map(r => r.SrcAddr || r.saddr)).size;
  const avgConf = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.confidence || 0), 0) / results.length)
    : '—';

  // KPIs
  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-total-trend').textContent = `▲ +${aiPercentage}%`;
  document.getElementById('kpi-ai').textContent = aiFlows;
  document.getElementById('kpi-ai-trend').textContent = `▲ ${aiPercentage}%`;
  document.getElementById('kpi-uniq').textContent = uniqSource;
  document.getElementById('kpi-uniq-trend').textContent = `▲ +${Math.min(uniqSource, 3)}`;
  document.getElementById('donut-pct').textContent = aiPercentage + '%';
  document.getElementById('kpi-conf').textContent = avgConf + (avgConf !== '—' ? ' / 100' : '');

  // Charts
  updateDonutChart(aiFlows, nonAi);
  updateLineChart(results);
  document.getElementById('dist-rows').innerHTML = renderDistribution(aiFlows, nonAi, total, aiPercentage);

  // Flow table
  const recent = [...results].slice(0, 15);
  if (recent.length === 0) {
    document.getElementById('flow-tbody').innerHTML = '<tr><td colspan="6" class="empty">En attente de flows...</td></tr>';
    document.getElementById('table-footer').textContent = '';
    document.getElementById('live-label').style.display = 'none';
    return;
  }
  document.getElementById('live-label').style.display = 'flex';
  document.getElementById('flow-tbody').innerHTML = recent.map(renderFlowRow).join('');
  document.getElementById('table-footer').textContent = `Showing 1–${recent.length} of ${total} flows`;
}