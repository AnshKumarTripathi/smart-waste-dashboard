// hotspots.js
document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("hotspot-map").setView([23.0225, 72.5714], 10); // Initial map view
  const tableBody = document.getElementById("hotspot-table-body");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  hotspots.forEach((hotspot) => {
    L.marker([hotspot.Latitude, hotspot.Longitude])
      .addTo(map)
      .bindPopup(
        `<b>${hotspot.Location}</b><br>Average Fill: ${parseFloat(
          hotspot["Average Fill"]
        ).toFixed(2)}%`
      );

    const row = `<tr>
          <td>${hotspot["Bin ID"]}</td>
          <td>${hotspot.Location}</td>
          <td>${parseFloat(hotspot["Average Fill"]).toFixed(2)}%</td>
          <td>${hotspot.Region}</td>
      </tr>`;
    tableBody.innerHTML += row;
  });
});
