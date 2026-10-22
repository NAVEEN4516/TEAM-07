/**
 * Chart Configuration Builder
 * Pure configuration factory for Chart.js burndown chart (no DOM, no Chart global).
 * Supports accessible light and dark theme styling tokens.
 */

/**
 * Clamps the current day to a valid integer within [0, durationDays].
 *
 * @param {number|string} currentDay - Current day value
 * @param {number|string} durationDays - Total sprint duration in days
 * @returns {number} Clamped integer day
 */
export function getMarkerDay(currentDay, durationDays) {
  const maxDays = Math.max(0, Math.floor(Number(durationDays) || 0));
  const parsedDay = Math.floor(Number(currentDay) || 0);

  if (isNaN(parsedDay) || parsedDay < 0) {
    return 0;
  }
  if (parsedDay > maxDays) {
    return maxDays;
  }
  return parsedDay;
}

/**
 * Pure function: Builds a Chart.js v4 line chart configuration object.
 *
 * @param {Object} series - Burndown series data
 * @param {Array<{day: number, value: number}>} series.ideal - Ideal burndown points
 * @param {Array<{day: number, value: number}>} series.actual - Actual burndown points
 * @param {number} [series.durationDays] - Optional sprint duration override
 * @param {number|string} currentDay - Current sprint day
 * @param {'light'|'dark'} [theme='light'] - Active UI theme
 * @returns {Object} Chart.js configuration object
 */
export function buildChartConfig(series = {}, currentDay = 0, theme = 'light') {
  const idealSeries = Array.isArray(series?.ideal) ? series.ideal : [];
  const actualSeries = Array.isArray(series?.actual) ? series.actual : [];

  let durationDays = Number(series?.durationDays);
  if (isNaN(durationDays) || durationDays <= 0) {
    durationDays = idealSeries.length > 0
      ? Math.max(...idealSeries.map(p => Number(p.day) || 0))
      : 0;
  }

  const validCurrentDay = getMarkerDay(currentDay, durationDays);
  const labels = Array.from({ length: durationDays + 1 }, (_, i) => i);

  // Theme color tokens
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f2937' : '#e2e8f0';
  const axisTextColor = isDark ? '#9ca3af' : '#64748b';
  const axisTitleColor = isDark ? '#e5e7eb' : '#475569';
  const legendTextColor = isDark ? '#f9fafb' : '#0f172a';
  const idealColor = isDark ? '#94a3b8' : '#64748b';
  const actualColor = isDark ? '#60a5fa' : '#2563eb';
  const tooltipBg = isDark ? '#111827' : '#ffffff';
  const tooltipTitle = isDark ? '#f9fafb' : '#0f172a';
  const tooltipBody = isDark ? '#9ca3af' : '#475569';
  const tooltipBorder = isDark ? '#374151' : '#e2e8f0';

  // Ideal dataset: dashed line, no point markers
  const idealData = labels.map(day => {
    const pt = idealSeries.find(p => p.day === day);
    return pt !== undefined && pt.value !== null ? pt.value : null;
  });

  // Actual dataset: solid line, points visible, only <= currentDay
  const actualData = labels.map(day => {
    if (day > validCurrentDay) {
      return null;
    }
    const pt = actualSeries.find(p => p.day === day);
    return (pt !== undefined && pt.value !== null && pt.value !== undefined) ? pt.value : null;
  });

  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Ideal',
          data: idealData,
          borderColor: idealColor,
          backgroundColor: idealColor,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0
        },
        {
          label: 'Actual',
          data: actualData,
          borderColor: actualColor,
          backgroundColor: actualColor,
          borderWidth: 2.5,
          borderDash: [],
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: actualColor,
          spanGaps: false,
          fill: false,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 20,
            usePointStyle: false,
            color: legendTextColor,
            font: {
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 13,
              weight: '500'
            }
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Sprint Day',
            color: axisTitleColor,
            font: {
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 13,
              weight: '600'
            }
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: axisTextColor
          }
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: 'Remaining Story Points',
            color: axisTitleColor,
            font: {
              family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              size: 13,
              weight: '600'
            }
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: axisTextColor,
            precision: 0
          }
        }
      }
    }
  };
}
