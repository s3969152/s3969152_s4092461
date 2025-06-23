document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("analysisForm");
  const tbody = document.getElementById("comparisonBody");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const stationInput = document.getElementById("station").value.trim().toLowerCase();
    const metric = document.getElementById("metric").value;
    const start = parseInt(document.getElementById("startPeriod").value);
    const end = parseInt(document.getElementById("endPeriod").value);
    const num = parseInt(document.getElementById("numStations").value);

    try {
      const response = await fetch("../data/climate_data.json");
      const data = await response.json();

      const grouped = groupByStation(data, metric, start, end);

      // Normalize station names for comparison
      const reference = grouped.find(item => item.station.trim().toLowerCase() === stationInput);

      if (!reference) {
        const availableStations = grouped.map(d => d.station).join(", ");
        alert(`Reference station not found in dataset.\n\nYou entered: "${stationInput}"\n\nAvailable stations:\n${availableStations}`);
        return;
      }

      const results = grouped
        .filter(d => d.station.trim().toLowerCase() !== stationInput)
        .map(d => ({
          station: d.station,
          difference: Math.abs(d.average - reference.average)
        }))
        .sort((a, b) => a.difference - b.difference)
        .slice(0, num);

      tbody.innerHTML = "";
      results.forEach(result => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${result.station}</td>
          <td>${result.difference.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error("Error loading or processing data:", error);
      alert("Failed to process data. Please check console for details.");
    }
  });

  function groupByStation(data, metric, start, end) {
    const grouped = {};
    data.forEach(entry => {
      const year = new Date(entry.date).getFullYear();
      if (year >= start && year <= end && entry[metric] != null) {
        const key = entry.station;
        if (!grouped[key]) {
          grouped[key] = { station: key, total: 0, count: 0 };
        }
        grouped[key].total += entry[metric];
        grouped[key].count += 1;
      }
    });
    return Object.values(grouped).map(group => ({
      station: group.station,
      average: group.count ? group.total / group.count : 0
    }));
  }
});
