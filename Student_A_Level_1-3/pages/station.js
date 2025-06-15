document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stationForm');
  const stationTable = document.querySelector('#stationTable tbody');
  const summaryTable = document.querySelector('#summaryTable tbody');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const state = document.getElementById('state').value;
    const latStart = parseFloat(document.getElementById('latStart').value);
    const latEnd = parseFloat(document.getElementById('latEnd').value);
    const metric = document.getElementById('metric').value;

    const response = await fetch('../data/climate_data.json');
    const data = await response.json();

    const lower = Math.min(latStart, latEnd);
    const upper = Math.max(latStart, latEnd);

    const filtered = data.filter(station =>
      station.state === state &&
      station.latitude >= lower &&
      station.latitude <= upper
    );

    // Fill Station Table
    stationTable.innerHTML = "";
    filtered.forEach(station => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${station.site_name}</td>
        <td>${station.region}</td>
        <td>${station.latitude.toFixed(2)}</td>
      `;
      stationTable.appendChild(row);
    });

    // Group by region and compute averages
    const regionMap = {};
    filtered.forEach(station => {
      const region = station.region;
      if (!regionMap[region]) {
        regionMap[region] = { count: 0, total: 0 };
      }
      regionMap[region].count += 1;
      regionMap[region].total += parseFloat(station[metric] || 0);
    });

    // Fill Summary Table
    summaryTable.innerHTML = "";
    for (const region in regionMap) {
      const { count, total } = regionMap[region];
      const avg = (total / count).toFixed(2);
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${region}</td>
        <td>${count}</td>
        <td>${avg}</td>
      `;
      summaryTable.appendChild(row);
    }
  });
});
