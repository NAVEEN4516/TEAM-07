/**
 * Chart Manager UI Component
 * Manages Chart.js lifecycle, re-renders lines, and handles current-day marker.
 * Supports dynamic theme switching (Light / Dark) without chart destruction.
 */

import { buildChartConfig, getMarkerDay } from './chartConfig.js';

/**
 * Cached Chart.js instance.
 * @type {Object|null}
 */
let chartInstance = null;

/**
 * Current marker day cache.
 * @type {number}
 */
let currentMarkerDay = 0;

/**
 * Current active theme cache.
 * @type {'light'|'dark'}
 */
let currentTheme = 'light';

/**
 * Cached latest series data.
 * @type {Object|null}
 */
let cachedSeries = null;

/**
 * Inline Chart.js plugin for rendering a prominent current-day marker (BDC-F-014).
 */
const currentDayMarkerPlugin = {
  id: 'currentDayMarker',
  afterDatasetsDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    const xScale = scales?.x;
    const yScale = scales?.y;
    if (!xScale || !yScale || !chartArea) {
      return;
    }

    const durationDays = xScale.ticks ? (xScale.ticks.length - 1) : 10;
    const day = getMarkerDay(currentMarkerDay, durationDays);
    const xPixel = xScale.getPixelForValue(day);

    if (xPixel === undefined || isNaN(xPixel) || xPixel < chartArea.left || xPixel > chartArea.right) {
      return;
    }

    const isDark = currentTheme === 'dark';
    const markerColor = isDark ? '#ef4444' : '#dc2626';

    ctx.save();

    // 1. Thick, high-contrast vertical marker line
    ctx.beginPath();
    ctx.strokeStyle = markerColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 3]);
    ctx.moveTo(xPixel, chartArea.top);
    ctx.lineTo(xPixel, chartArea.bottom);
    ctx.stroke();

    // 2. High-contrast "Day N" badge at top
    const label = `Day ${day}`;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const textMetrics = ctx.measureText(label);
    const badgeWidth = textMetrics.width + 14;
    const badgeHeight = 22;
    const badgeX = Math.max(chartArea.left + 2, Math.min(chartArea.right - badgeWidth - 2, xPixel - badgeWidth / 2));
    const badgeY = chartArea.top + 3;

    // Badge background
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
    } else {
      ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
    }
    ctx.fill();

    // Badge label text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

    ctx.restore();
  }
};

/**
 * Renders or updates the burndown line chart on the given canvas.
 * Creates the chart once and updates datasets on subsequent calls (no destroy/re-create).
 *
 * @param {HTMLCanvasElement} canvas - Target canvas element
 * @param {Object} series - Burndown series with ideal and actual points
 * @param {number|string} [currentDay=0] - Current sprint day
 * @param {'light'|'dark'} [theme] - Theme override
 * @returns {Object|null} Chart instance
 */
export function renderChart(canvas, series, currentDay = 0, theme = null) {
  if (!canvas) {
    return null;
  }

  if (theme) {
    currentTheme = theme;
  } else if (typeof document !== 'undefined') {
    currentTheme = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'dark' : 'light';
  }

  cachedSeries = series;
  const durationDays = series?.durationDays ?? (series?.ideal?.length ? series.ideal.length - 1 : 10);
  currentMarkerDay = getMarkerDay(currentDay, durationDays);

  const config = buildChartConfig(series, currentMarkerDay, currentTheme);

  if (chartInstance) {
    // Update existing instance cleanly on state changes
    chartInstance.data.labels = config.data.labels;
    chartInstance.data.datasets = config.data.datasets;

    // Synchronize scales and theme tokens
    if (chartInstance.options?.scales) {
      chartInstance.options.scales.x.grid.color = config.options.scales.x.grid.color;
      chartInstance.options.scales.x.ticks.color = config.options.scales.x.ticks.color;
      chartInstance.options.scales.x.title.color = config.options.scales.x.title.color;
      chartInstance.options.scales.y.grid.color = config.options.scales.y.grid.color;
      chartInstance.options.scales.y.ticks.color = config.options.scales.y.ticks.color;
      chartInstance.options.scales.y.title.color = config.options.scales.y.title.color;
    }

    if (chartInstance.options?.plugins?.legend?.labels) {
      chartInstance.options.plugins.legend.labels.color = config.options.plugins.legend.labels.color;
    }

    if (chartInstance.options?.plugins?.tooltip) {
      chartInstance.options.plugins.tooltip.backgroundColor = config.options.plugins.tooltip.backgroundColor;
      chartInstance.options.plugins.tooltip.titleColor = config.options.plugins.tooltip.titleColor;
      chartInstance.options.plugins.tooltip.bodyColor = config.options.plugins.tooltip.bodyColor;
      chartInstance.options.plugins.tooltip.borderColor = config.options.plugins.tooltip.borderColor;
    }

    chartInstance.update();
    return chartInstance;
  }

  // Create new chart instance using global Chart
  if (typeof Chart === 'undefined') {
    return null;
  }

  config.plugins = [currentDayMarkerPlugin];
  chartInstance = new Chart(canvas, config);
  return chartInstance;
}

/**
 * Updates the current day marker position without full page reload.
 *
 * @param {number|string} currentDay - New current day
 */
export function updateMarker(currentDay) {
  if (!chartInstance) {
    return;
  }
  const durationDays = chartInstance.scales?.x?.ticks ? (chartInstance.scales.x.ticks.length - 1) : 10;
  currentMarkerDay = getMarkerDay(currentDay, durationDays);
  chartInstance.update('none');
}

/**
 * Updates the chart colors to reflect a new active theme.
 *
 * @param {'light'|'dark'} theme - New active theme
 */
export function updateChartTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  if (!chartInstance || !cachedSeries) {
    return;
  }
  const canvas = chartInstance.canvas;
  renderChart(canvas, cachedSeries, currentMarkerDay, currentTheme);
}

/**
 * Returns the current Chart.js instance.
 *
 * @returns {Object|null} Chart instance
 */
export function getChartInstance() {
  return chartInstance;
}
