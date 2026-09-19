let ballRows = [];
let filteredBallRows = [];
let matchRows = [];
let filteredMatchRows = [];
let seasons = [];

let wonByChart;
let tossChart;
let venueChart;
let teamChart;

let seasonSelect;
let batterSelect;
let bowlerSelect;
let resetBtn;
let kpiContainer;
let battingValues;
let bowlingValues;

const RESULT_TYPES = ["Runs", "Wickets", "SuperOver", "NoResult"];
const resultColors = {
  Runs: "#7c4dff",
  Wickets: "#11c5ba",
  SuperOver: "#f7a928",
  NoResult: "#7b8ba3",
};

const teamBadges = [
  { name: "Chennai Super Kings", code: "CSK", colors: ["#f7c948", "#1656a2"], border: "#ffe58a" },
  { name: "Mumbai Indians", code: "MI", colors: ["#0668b7", "#d4af37"], border: "#7bd3ff" },
  { name: "Royal Challengers Bengaluru", code: "RCB", colors: ["#d71920", "#121212"], border: "#ff9f9f" },
  { name: "Kolkata Knight Riders", code: "KKR", colors: ["#3a1a6d", "#d8a629"], border: "#d8c0ff" },
  { name: "Rajasthan Royals", code: "RR", colors: ["#e91e8f", "#2452a3"], border: "#ffb9e1" },
  { name: "Sunrisers Hyderabad", code: "SRH", colors: ["#f26522", "#111827"], border: "#ffc09d" },
  { name: "Delhi Capitals", code: "DC", colors: ["#174ea6", "#d71920"], border: "#a9c7ff" },
  { name: "Punjab Kings", code: "PBKS", colors: ["#d71920", "#c8ced7"], border: "#ffd7d7" },
  { name: "Gujarat Titans", code: "GT", colors: ["#10233f", "#c7a756"], border: "#e6d49a" },
  { name: "Lucknow Super Giants", code: "LSG", colors: ["#24b8d8", "#f36f21"], border: "#a5efff" },
];

const iconSvg = {
  trophy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M5 5H3v2a4 4 0 0 0 4 4"/><path d="M19 5h2v2a4 4 0 0 1-4 4"/></svg>`,
  bat: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 21 9.5-9.5"/><path d="m13 4 7 7-3 3-7-7 3-3Z"/><path d="m4 20 2 2"/></svg>`,
  wicket: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v17"/><path d="M12 4v17"/><path d="M17 4v17"/><path d="M6 4h12"/><path d="M5 21h14"/></svg>`,
  six: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="14" r="4"/><path d="M17 6h.01"/><path d="M16 14h2a3 3 0 0 0 0-6h-2a3 3 0 0 0-3 3v3a4 4 0 0 0 8 0"/></svg>`,
  four: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4v16"/><path d="M5 14h14"/><path d="M14 4 5 14"/><path d="M20 20h-9"/></svg>`,
  batter: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="5" r="2"/><path d="M9 8 6 13l4 2 2 5"/><path d="m11 11 4 2"/><path d="m16 4 4 4"/><path d="M18 6 9 15"/></svg>`,
  bowler: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="15" cy="5" r="2"/><path d="m14 8-4 3 3 4-2 5"/><path d="m10 11-4-1"/><path d="M18 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>`,
};

const kpiCardConfig = {
  winner: { className: "kpi-card--winner", icon: iconSvg.trophy, label: "Tournament Winner" },
  orangeCap: { className: "kpi-card--orange", icon: iconSvg.bat, label: "Orange Cap" },
  purpleCap: { className: "kpi-card--purple", icon: iconSvg.wicket, label: "Purple Cap" },
  sixes: { className: "kpi-card--sixes", icon: iconSvg.six, label: "Tournament 6's" },
  fours: { className: "kpi-card--fours", icon: iconSvg.four, label: "Tournament 4's" },
};

const percentageLabelsPlugin = {
  id: "percentageLabels",
  afterDatasetsDraw(chart) {
    if (!chart.options.plugins.percentageLabels?.display) return;

    const { ctx } = chart;
    const values = chart.data.datasets[0].data;
    const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
    if (!total) return;

    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 13px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    chart.getDatasetMeta(0).data.forEach((arc, index) => {
      const value = Number(values[index] || 0);
      if (!value || value / total < 0.04) return;
      const position = arc.tooltipPosition();
      ctx.fillText(`${((value / total) * 100).toFixed(1)}%`, position.x, position.y);
    });

    ctx.restore();
  },
};

const valueLabelsPlugin = {
  id: "valueLabels",
  afterDatasetsDraw(chart) {
    if (!chart.options.plugins.valueLabels?.display) return;

    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = "#f4fbff";
    ctx.font = "800 12px Inter, sans-serif";
    ctx.textBaseline = "middle";

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((bar, index) => {
        const value = Number(dataset.data[index] || 0);
        if (!value) return;
        const props = bar.getProps(["x", "y"], true);
        ctx.textAlign = "left";
        ctx.fillText(formatNumber(value), props.x + 8, props.y);
      });
    });

    ctx.restore();
  },
};

Chart.register(percentageLabelsPlugin, valueLabelsPlugin);

function createOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function normalizedText(value) {
  const text = String(value ?? "").trim();
  return text.toLowerCase() === "nan" ? "" : text;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function shortenLabel(label, maxLength = 24) {
  const text = normalizedText(label) || "Unknown";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function loadData() {
  fetch("../data/IPL.csv")
    .then((response) => (response.ok ? response.text() : Promise.reject(new Error("CSV load error"))))
    .then((text) => {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      ballRows = cleanData(parsed.data);
      matchRows = buildMatchRows(ballRows);
      initDashboard();
      applySeasonAndRender();
    })
    .catch((error) => {
      console.error(error);
      const container = kpiContainer || document.getElementById("kpi-cards");
      if (container) {
        container.innerHTML = `<div class="kpi-card kpi-card--winner"><div class="kpi-card__label">Data Error</div><div class="kpi-card__value">Unable to load IPL.csv</div></div>`;
      }
    });
}

function cleanData(rows) {
  const numberFields = [
    "match_id",
    "innings",
    "runs_batter",
    "balls_faced",
    "valid_ball",
    "runs_extras",
    "runs_total",
    "runs_bowler",
    "bowler_wicket",
    "year",
  ];

  return rows
    .filter((row) => normalizedText(row.match_id) && normalizedText(row.season))
    .map((row) => {
      Object.keys(row).forEach((key) => {
        if (typeof row[key] === "string") row[key] = row[key].trim();
      });
      numberFields.forEach((field) => {
        if (field in row) row[field] = toNumber(row[field]);
      });
      return row;
    });
}

function buildMatchRows(rows) {
  const byMatch = new Map();

  rows.forEach((row) => {
    if (!byMatch.has(row.match_id)) byMatch.set(row.match_id, row);
  });

  return [...byMatch.values()].map((row) => ({
    match_id: row.match_id,
    date: normalizedText(row.date),
    season: normalizedText(row.season),
    winner: normalizedText(row.match_won_by),
    win_outcome: normalizedText(row.win_outcome),
    result_type: normalizedText(row.result_type),
    superover_winner: normalizedText(row.superover_winner),
    toss_winner: normalizedText(row.toss_winner),
    toss_decision: normalizedText(row.toss_decision),
    venue: normalizedText(row.venue) || "Unknown venue",
    stage: normalizedText(row.stage),
    year: row.year,
  }));
}

function initDashboard() {
  seasonSelect = document.getElementById("season-select");
  batterSelect = document.getElementById("batter-select");
  bowlerSelect = document.getElementById("bowler-select");
  resetBtn = document.getElementById("reset-filters");
  kpiContainer = document.getElementById("kpi-cards");
  battingValues = document.getElementById("batting-values");
  bowlingValues = document.getElementById("bowling-values");

  renderTeamBadges();
  document.querySelector('[data-icon="batter"]').innerHTML = iconSvg.batter;
  document.querySelector('[data-icon="bowler"]').innerHTML = iconSvg.bowler;

  seasons = [...new Set(ballRows.map((row) => row.season).filter(Boolean))].sort(sortSeasons);
  seasons.forEach((season) => seasonSelect.appendChild(createOption(season, season)));

  seasonSelect.addEventListener("change", applySeasonAndRender);
  batterSelect.addEventListener("change", updateBattingStats);
  bowlerSelect.addEventListener("change", updateBowlingStats);
  resetBtn.addEventListener("click", resetFilters);
}

function renderTeamBadges() {
  const strip = document.getElementById("team-logo-strip");

  strip.innerHTML = "";

  teamBadges.forEach((team) => strip.appendChild(createBadge(team)));
}

function createBadge(team) {
  const badge = document.createElement("span");
  badge.className = "team-badge";
  badge.textContent = team.code;
  badge.title = team.name;
  badge.style.setProperty("--badge-a", team.colors[0]);
  badge.style.setProperty("--badge-b", team.colors[1]);
  badge.style.setProperty("--badge-border", team.border);
  return badge;
}

function sortSeasons(a, b) {
  return getSeasonYear(a) - getSeasonYear(b) || String(a).localeCompare(String(b));
}

function getSeasonYear(season) {
  const text = String(season);
  const years = text.match(/\d{4}/g);
  if (!years) return 0;
  return Math.max(...years.map(Number));
}

function resetFilters() {
  seasonSelect.value = "all";
  batterSelect.value = "all";
  bowlerSelect.value = "all";
  applySeasonAndRender();
}

function applySeasonAndRender() {
  const selectedSeason = seasonSelect.value;
  filteredBallRows = selectedSeason === "all" ? ballRows : ballRows.filter((row) => row.season === selectedSeason);
  filteredMatchRows = selectedSeason === "all" ? matchRows : matchRows.filter((row) => row.season === selectedSeason);

  populatePlayerSelects();
  renderKPI();
  updateBattingStats();
  updateBowlingStats();
  renderCharts();
}

function populatePlayerSelects() {
  const selectedBatter = batterSelect.value;
  const selectedBowler = bowlerSelect.value;
  const batters = [...new Set(filteredBallRows.map((row) => normalizedText(row.batter)).filter(Boolean))].sort();
  const bowlers = [...new Set(filteredBallRows.map((row) => normalizedText(row.bowler)).filter(Boolean))].sort();

  replaceOptions(batterSelect, "All Batters", batters);
  replaceOptions(bowlerSelect, "All Bowlers", bowlers);

  batterSelect.value = batters.includes(selectedBatter) ? selectedBatter : "all";
  bowlerSelect.value = bowlers.includes(selectedBowler) ? selectedBowler : "all";
}

function replaceOptions(select, allLabel, values) {
  select.innerHTML = "";
  select.appendChild(createOption("all", allLabel));
  values.forEach((value) => select.appendChild(createOption(value, value)));
}

function renderKPI() {
  const winner = calculateWinner();
  const orangeCap = calculateOrangeCap();
  const purpleCap = calculatePurpleCap();
  const totalSixes = calculateTotalSixes();
  const totalFours = calculateTotalFours();

  const cards = [
    {
      key: "winner",
      value: winner.team,
      support: winner.support,
    },
    {
      key: "orangeCap",
      value: orangeCap.player,
      support: `${formatNumber(orangeCap.runs)} Runs`,
    },
    {
      key: "purpleCap",
      value: purpleCap.player,
      support: `${formatNumber(purpleCap.wickets)} Wickets`,
    },
    {
      key: "sixes",
      value: formatNumber(totalSixes),
      support: "Sixes hit",
    },
    {
      key: "fours",
      value: formatNumber(totalFours),
      support: "Fours hit",
    },
  ];

  kpiContainer.innerHTML = cards.map(createKpiCard).join("");
}

function createKpiCard(card) {
  const config = kpiCardConfig[card.key];
  return `
    <article class="kpi-card ${config.className}">
      <div class="kpi-card__content">
        <div class="kpi-card__icon">${config.icon}</div>
        <div class="kpi-card__label">${config.label}</div>
        <div class="kpi-card__value">${card.value}</div>
        <div class="kpi-card__support">${card.support}</div>
      </div>
    </article>
  `;
}

function calculateWinner() {
  if (seasonSelect.value === "all") {
    const champions = {};
    seasons.forEach((season) => {
      const champion = calculateSeasonChampion(season);
      if (champion) champions[champion] = (champions[champion] || 0) + 1;
    });
    const [team, titles] = Object.entries(champions).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] || ["N/A", 0];
    return { team, support: `${titles} titles across seasons` };
  }

  const team = calculateSeasonChampion(seasonSelect.value) || "N/A";
  return { team, support: `Champion: ${seasonSelect.value}` };
}

function calculateSeasonChampion(season) {
  const matches = matchRows.filter((match) => match.season === season && match.winner);
  const final = matches.find((match) => match.stage.toLowerCase() === "final");
  if (final) return final.winner;

  const latest = [...matches].sort((a, b) => {
    const dateDiff = Date.parse(b.date || 0) - Date.parse(a.date || 0);
    return dateDiff || b.match_id - a.match_id;
  })[0];

  return latest?.winner || "";
}

function calculateOrangeCap() {
  const runs = sumBy(filteredBallRows, "batter", (row) => row.runs_batter);
  const [player, total] = sortedEntries(runs)[0] || ["N/A", 0];
  return { player, runs: total };
}

function calculatePurpleCap() {
  const wickets = sumBy(filteredBallRows, "bowler", (row) => row.bowler_wicket === 1 ? 1 : 0);
  const [player, total] = sortedEntries(wickets)[0] || ["N/A", 0];
  return { player, wickets: total };
}

function calculateTotalSixes() {
  return filteredBallRows.filter((row) => row.runs_batter === 6).length;
}

function calculateTotalFours() {
  return filteredBallRows.filter((row) => row.runs_batter === 4).length;
}

function calculateBatterStats(player) {
  const rows = player === "all" ? filteredBallRows : filteredBallRows.filter((row) => row.batter === player);
  const runs = rows.reduce((sum, row) => sum + row.runs_batter, 0);
  const sixes = rows.filter((row) => row.runs_batter === 6).length;
  const fours = rows.filter((row) => row.runs_batter === 4).length;
  const balls = rows.reduce((sum, row) => sum + row.balls_faced, 0);
  const strikeRate = balls ? ((runs / balls) * 100).toFixed(2) : "0.00";
  return { runs, sixes, fours, strikeRate };
}

function updateBattingStats() {
  const stats = calculateBatterStats(batterSelect.value);
  battingValues.innerHTML = [
    ["Total Runs", formatNumber(stats.runs)],
    ["6's", formatNumber(stats.sixes)],
    ["4's", formatNumber(stats.fours)],
    ["Strike Rate", stats.strikeRate],
  ].map(createStatBox).join("");
}

function calculateBowlerStats(player) {
  const rows = player === "all" ? filteredBallRows : filteredBallRows.filter((row) => row.bowler === player);
  const wickets = rows.reduce((sum, row) => sum + (row.bowler_wicket === 1 ? 1 : 0), 0);
  const runsConceded = rows.reduce((sum, row) => sum + row.runs_bowler, 0);
  const legalBalls = rows.reduce((sum, row) => sum + (row.valid_ball === 1 ? 1 : 0), 0);
  const overs = legalBalls / 6;
  return {
    wickets,
    economy: overs ? (runsConceded / overs).toFixed(2) : "0.00",
    average: wickets ? (runsConceded / wickets).toFixed(2) : "0.00",
    strikeRate: wickets ? (legalBalls / wickets).toFixed(2) : "0.00",
  };
}

function updateBowlingStats() {
  const stats = calculateBowlerStats(bowlerSelect.value);
  bowlingValues.innerHTML = [
    ["Total Wickets", formatNumber(stats.wickets)],
    ["Economy", stats.economy],
    ["Average", stats.average],
    ["Strike Rate", stats.strikeRate],
  ].map(createStatBox).join("");
}

function createStatBox([label, value]) {
  return `
    <div class="stat-box">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
}

function getResultType(match) {
  const result = normalizedText(match.result_type).toLowerCase();
  const outcome = normalizedText(match.win_outcome).toLowerCase();

  if (result.includes("no result") || outcome.includes("no result")) return "NoResult";
  if (result.includes("tie") || normalizedText(match.superover_winner)) return "SuperOver";
  if (outcome.includes("wicket")) return "Wickets";
  if (outcome.includes("run")) return "Runs";
  return "NoResult";
}

function aggregateResultTypes() {
  return filteredMatchRows.reduce((counts, match) => {
    counts[getResultType(match)] += 1;
    return counts;
  }, baseResultCounts());
}

function aggregateTossDecision() {
  return filteredMatchRows.reduce((counts, match) => {
    const decision = normalizedText(match.toss_decision);
    if (!decision) return counts;
    const label = decision.charAt(0).toUpperCase() + decision.slice(1).toLowerCase();
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {});
}

function aggregateVenueWinTypes() {
  const venueWinTypeData = {};

  filteredMatchRows.forEach((match) => {
    const venue = match.venue || "Unknown venue";
    if (!venueWinTypeData[venue]) venueWinTypeData[venue] = baseResultCounts();
    venueWinTypeData[venue][getResultType(match)] += 1;
  });

  return venueWinTypeData;
}

function aggregateTeamWins() {
  return filteredMatchRows.reduce((counts, match) => {
    if (match.winner) counts[match.winner] = (counts[match.winner] || 0) + 1;
    return counts;
  }, {});
}

function baseResultCounts() {
  return { Runs: 0, Wickets: 0, SuperOver: 0, NoResult: 0 };
}

function sumBy(rows, key, valueGetter) {
  return rows.reduce((totals, row) => {
    const label = normalizedText(row[key]);
    if (label) totals[label] = (totals[label] || 0) + valueGetter(row);
    return totals;
  }, {});
}

function sortedEntries(object) {
  return Object.entries(object).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderCharts() {
  renderWonByChart();
  renderTossChart();
  renderVenueChart();
  renderTeamChart();
}

function renderWonByChart() {
  const counts = aggregateResultTypes();
  const dataValues = RESULT_TYPES.map((type) => counts[type]);

  wonByChart = replaceChart(wonByChart, "won-by-chart", {
    type: "doughnut",
    data: {
      labels: RESULT_TYPES,
      datasets: [{
        data: dataValues,
        backgroundColor: RESULT_TYPES.map((type) => resultColors[type]),
        borderColor: "#07182d",
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: doughnutOptions(false),
  });
}

function renderTossChart() {
  const counts = aggregateTossDecision();
  const labels = Object.keys(counts);
  const values = labels.map((label) => counts[label]);

  tossChart = replaceChart(tossChart, "toss-chart", {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ["#11c5ba", "#7c4dff", "#f7a928"],
        borderColor: "#07182d",
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: doughnutOptions(true),
  });
}

function renderVenueChart() {
  const venueMap = aggregateVenueWinTypes();
  const sortedVenues = Object.entries(venueMap)
    .map(([venue, counts]) => ({
      venue,
      counts,
      total: RESULT_TYPES.reduce((sum, type) => sum + counts[type], 0),
    }))
    .sort((a, b) => b.total - a.total || a.venue.localeCompare(b.venue))
    .slice(0, 14);

  venueChart = replaceChart(venueChart, "venue-chart", {
    type: "bar",
    data: {
      labels: sortedVenues.map((item) => shortenLabel(item.venue, 30)),
      datasets: RESULT_TYPES.map((type) => ({
        label: type,
        data: sortedVenues.map((item) => item.counts[type]),
        backgroundColor: resultColors[type],
        borderRadius: 5,
        borderSkipped: false,
      })),
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: gridStyle(), ticks: tickStyle() },
        y: { stacked: true, grid: { display: false }, ticks: tickStyle() },
      },
      plugins: {
        legend: legendStyle("bottom"),
        tooltip: tooltipStyle(),
        valueLabels: { display: false },
      },
    },
  });
}

function renderTeamChart() {
  const sortedTeams = sortedEntries(aggregateTeamWins());

  teamChart = replaceChart(teamChart, "team-chart", {
    type: "bar",
    data: {
      labels: sortedTeams.map(([team]) => shortenLabel(team, 28)),
      datasets: [{
        label: "Wins",
        data: sortedTeams.map(([, wins]) => wins),
        backgroundColor: "#7c4dff",
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 34 } },
      scales: {
        x: { grid: gridStyle(), ticks: tickStyle() },
        y: { grid: { display: false }, ticks: tickStyle() },
      },
      plugins: {
        legend: { display: false },
        tooltip: tooltipStyle(),
        valueLabels: { display: true },
      },
    },
  });
}

function replaceChart(existingChart, canvasId, config) {
  if (existingChart) existingChart.destroy();
  const context = document.getElementById(canvasId).getContext("2d");
  return new Chart(context, config);
}

function doughnutOptions(showPercentLabels) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: legendStyle("right", true),
      tooltip: tooltipStyle(true),
      percentageLabels: { display: showPercentLabels },
      valueLabels: { display: false },
    },
  };
}

function legendStyle(position, includePercentages = false) {
  const config = {
    position,
    labels: {
      color: "#d9efff",
      boxWidth: 12,
      boxHeight: 12,
      padding: 16,
      font: { family: "Inter", size: 12, weight: "700" },
    },
  };

  if (includePercentages) {
    config.labels.generateLabels = function generatePercentageLabels(chart) {
      const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
      const data = chart.data.datasets[0]?.data || [];
      const total = data.reduce((sum, value) => sum + Number(value || 0), 0);

      return labels.map((label) => {
        const value = Number(data[label.index] || 0);
        const percentage = total ? ((value / total) * 100).toFixed(1) : "0.0";
        return { ...label, text: `${label.text}  ${percentage}%` };
      });
    };
  }

  return config;
}

function tooltipStyle(showPercentage = false) {
  return {
    backgroundColor: "rgba(5, 16, 30, 0.94)",
    borderColor: "rgba(142, 227, 255, 0.28)",
    borderWidth: 1,
    titleColor: "#ffffff",
    bodyColor: "#d9efff",
    callbacks: {
      label(context) {
        const value = Number(context.raw || 0);
        if (!showPercentage) return `${context.dataset.label || context.label}: ${formatNumber(value)}`;
        const total = context.dataset.data.reduce((sum, item) => sum + Number(item || 0), 0);
        const percentage = total ? ((value / total) * 100).toFixed(1) : "0.0";
        return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
      },
    },
  };
}

function gridStyle() {
  return {
    color: "rgba(159, 179, 200, 0.14)",
    drawBorder: false,
  };
}

function tickStyle() {
  return {
    color: "#bfd6ea",
    font: { family: "Inter", size: 11, weight: "700" },
  };
}

function enableKpiTilt() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || reducedMotion.matches) return;
    const card = event.target.closest(".kpi-card");
    if (!card) return;

    const bounds = card.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    card.style.setProperty("--tilt-x", `${relativeY * -5}deg`);
    card.style.setProperty("--tilt-y", `${relativeX * 7}deg`);
  });

  document.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    const card = event.target.closest(".kpi-card");
    if (!card || card.contains(event.relatedTarget)) return;

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  enableKpiTilt();
  loadData();
});
