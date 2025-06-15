document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("analysisForm");
  const tbody = document.getElementById("comparisonBody");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const station = document.getElementById("station").value;
    const metric = document.getElementById("metric").value;
    const start = parseInt(document.getElementById("startPeriod").value);
    const end = parseInt(document.getElementById("endPeriod").value);
    const num = parseInt(document.getElementById("numStations").value);

    try {
      const response = await fetch("../data/climate_data.json");
      const data = await response.json();

      const grouped = groupByStation(data, metric, start, end);
      const reference = grouped.find(item => item.station === station);

      if (!reference) {
        alert("Reference station not found in dataset.");
        return;
      }

      const results = grouped
        .filter(d => d.station !== station)
        .map(d => ({
          ...d,
          difference: Math.abs(d.change - reference.change)
        }))
        .sort((a, b) => a.difference - b.difference)
        .slice(0, num);

      tbody.innerHTML = "";
      [reference, ...results].forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.station}${i === 0 ? " (Ref)" : ""}</td>
          <td>${row.startAvg.toFixed(2)}</td>
          <td>${row.endAvg.toFixed(2)}</td>
          <td>${(row.change * 100).toFixed(2)}%</td>
          <td>${(row.difference * 100).toFixed(2)}%</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Error fetching data", err);
    }
  });

  function groupByStation(data, metric, start, end) {
    const stations = [...new Set(data.map(d => d.station))];

    return stations.map(station => {
      const startPeriod = data.filter(d => d.station === station && d.year >= start && d.year < (start + 5));
      const endPeriod = data.filter(d => d.station === station && d.year >= end && d.year < (end + 5));

      const startAvg = average(startPeriod.map(d => parseFloat(d[metric])));
      const endAvg = average(endPeriod.map(d => parseFloat(d[metric])));
      const change = (endAvg - startAvg) / startAvg;

      return { station, startAvg, endAvg, change };
    });
  }

  function average(arr) {
    const valid = arr.filter(v => !isNaN(v));
    return valid.reduce((sum, val) => sum + val, 0) / valid.length || 0;
  }
});
