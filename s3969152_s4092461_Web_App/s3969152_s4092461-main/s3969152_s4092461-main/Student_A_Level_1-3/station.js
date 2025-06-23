document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stationForm");
  const stationTableBody = document.querySelector("#stationTable tbody");
  const summaryTableBody = document.querySelector("#summaryTable tbody");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const state = document.getElementById("state").value;
    const latStart = parseFloat(document.getElementById("latStart").value);
    const latEnd = parseFloat(document.getElementById("latEnd").value);
    const selectedMetric = document.getElementById("metric").value;

    const titleElement = document.getElementById("summaryMetricTitle");
    if (titleElement && metricTitleMap[selectedMetric]) {
      titleElement.textContent = metricTitleMap[selectedMetric];
    } else {
      console.warn("⚠️ Could not update metric title");
    }

    try {
      const response = await fetch("../data/climate_data.json");
      const data = await response.json();

      // Filter data by state and latitude
      const filtered = data.filter(entry =>
        entry.state === state &&
        entry.lat >= latStart &&
        entry.lat <= latEnd &&
        entry[selectedMetric] != null
      );

      // Build station table (unique sites only)
      const uniqueStations = {};
      filtered.forEach(entry => {
        uniqueStations[entry.site_name] = {
          region: entry.region,
          lat: entry.lat
        };
      });

      stationTableBody.innerHTML = "";
      Object.entries(uniqueStations).forEach(([site, info]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${site}</td>
          <td>${info.region}</td>
          <td>${info.lat}</td>
        `;
        stationTableBody.appendChild(row);
      });

      // Build summary table by region
      const regionGroups = {};
      filtered.forEach(entry => {
        const region = entry.region;
        if (!regionGroups[region]) {
          regionGroups[region] = { total: 0, count: 0, stations: new Set() };
        }
        regionGroups[region].total += entry[selectedMetric];
        regionGroups[region].count++;
        regionGroups[region].stations.add(entry.site_name);
      });

      summaryTableBody.innerHTML = "";
      Object.entries(regionGroups).forEach(([region, stats]) => {
        const avg = stats.total / stats.count;
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${region}</td>
          <td>${stats.stations.size}</td>
          <td>${avg.toFixed(1)}</td>
        `;
        summaryTableBody.appendChild(row);
      });

    } catch (error) {
      console.error("❌ Data load error:", error);
      alert("Could not load data.");
    }
  });
});
