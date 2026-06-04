let lineChart = null;
let donutChart = null;

const TIME_LABELS = ['10h','12h','14h','16h','18h','20h','22h','00h','02h','04h','06h','08h'];

/**
   * Initialize the donut (doughnut) chart used to visualize AI vs Non-AI flows.
   *
   * This function creates doughnut chart instance with:
   * - Initial placeholder data
   * - Custom colors for AI and Non-AI categories
   * - Disabled legend and tooltips for a minimal UI
   * - No animation for real-time update performance
   *
   * The chart is stored in the global `donutChart` variable for later updates.
   */
function initDonutChart() {
  donutChart = new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [1, 0],
        backgroundColor: ['#ef4444', '#22c55e'],
        borderWidth: 0,
        cutout: '65%'
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: false
    }
  });
}

/**
 * Update the donut chart with the latest AI vs Non-AI flow counts.
 *
 * If no data is available, the chart is set to a neutral grey state.
 * Otherwise, it updates the dataset and restores category colors.
 *
 * @param {number} aiFlows : Number of AI-classified flows.
 * @param {number} nonAi : Number of non-AI flows.
 */
function updateDonutChart(aiFlows, nonAi) {
  if (!donutChart) initDonutChart();

  if (aiFlows === 0 && nonAi === 0) {
    donutChart.data.datasets[0].data = [1, 0];
    donutChart.data.datasets[0].backgroundColor = ['#e5e7eb', '#e5e7eb'];
    document.getElementById('donut-pct').textContent = '-%';
  } else {
    donutChart.data.datasets[0].data = [aiFlows || 1, nonAi];
    donutChart.data.datasets[0].backgroundColor = ['#ef4444', '#22c55e'];
  }
  donutChart.update();
}

/**
 * Generate an array of hourly time labels for the last 12 hours.
 * @returns {string[]} Array of 12 hourly labels.
 */
function getTimeLabels() {
  const labels = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const hour = new Date(now - i * 3600 * 1000).getHours();
    labels.push(hour + 'h');
  }
  return labels;
}

/**
 * Initialize the line chart used to track AI vs Non-AI flows over time.
 *
 * Creates a Chart.js line chart with two datasets:
 * - AI flows (red line)
 * - Non-AI flows (green line)
 *
 * The chart is stored in the global `lineChart` variable.
 */
function initLineChart() {
  lineChart = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: getTimeLabels(),
      datasets: [
        {
          label: 'AI flows',
          data: [],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.07)',
          borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4
        },
        {
          label: 'Non-AI flows',
          data: [],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.07)',
          borderWidth: 2, pointRadius: 0, fill: true, tension: 0.4
        }
      ]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
        y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, color: '#9ca3af' } }
      },
      animation: false
    }
  });
}

/**
 * Update the line chart with the latest flow results.
 *
 * Aggregates AI and Non-AI flows by hour and updates the chart datasets.
 * If no results are available, the chart is reset to a neutral grey state.
 *
 * @param {Array<Object>} results : List of flow records containing timestamps and predictions.
 */
function updateLineChart(results) {
  if (!lineChart) initLineChart();

  // If there is no results yet
  if (results.length === 0) {
    lineChart.data.datasets[0].data = TIME_LABELS.map(() => 0);
    lineChart.data.datasets[1].data = TIME_LABELS.map(() => 0);
    lineChart.data.datasets[0].borderColor = '#e5e7eb';
    lineChart.data.datasets[0].backgroundColor = 'rgba(229,231,235,0.07)';
    lineChart.data.datasets[1].borderColor = '#e5e7eb';
    lineChart.data.datasets[1].backgroundColor = 'rgba(229,231,235,0.07)';
    lineChart.update();
    return;
  }

  // Put back the right colors
  lineChart.data.datasets[0].borderColor = '#ef4444';
  lineChart.data.datasets[0].backgroundColor = 'rgba(239,68,68,0.07)';
  lineChart.data.datasets[1].borderColor = '#22c55e';
  lineChart.data.datasets[1].backgroundColor = 'rgba(34,197,94,0.07)';

  const aiByHour = {};
  const nonAiByHour = {};
  results.forEach(r => {
    if (!r.captured_at) return;
    const hour = new Date(r.captured_at).getHours() + 'h';
    if (r.prediction === 1) {
      aiByHour[hour] = (aiByHour[hour] || 0) + 1;
    } else {
      nonAiByHour[hour] = (nonAiByHour[hour] || 0) + 1;
    }
  });

  // updateLineChart
  const labels = getTimeLabels();
  lineChart.data.labels = labels;
  lineChart.data.datasets[0].data = labels.map(h => aiByHour[h] || 0);
  lineChart.data.datasets[1].data = labels.map(h => nonAiByHour[h] || 0);
  lineChart.update();
}