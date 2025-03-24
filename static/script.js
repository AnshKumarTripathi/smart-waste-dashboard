let map;
let markers = [];
let routeLayer = L.featureGroup();
let myChart;
const bins = JSON.parse(document.getElementById("map").dataset.bins);

function initMap() {
  map = L.map("map").setView([23.0225, 72.5714], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
  map.addLayer(routeLayer);

  updateMap();
  createFillLevelChart(bins);
  createMapLegend();
}

function updateMap() {
  const selectedRegion = document.getElementById("region").value;
  const filteredBins =
    selectedRegion === "all"
      ? bins
      : bins.filter((bin) => bin.Region === selectedRegion);

  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];

  addBinMarkers(filteredBins);
  filterTable();
  createFillLevelChart(bins);

  // Center map on the selected region
  if (filteredBins.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds());
  } else {
    map.setView([23.0225, 72.5714], 13); // Default view if no markers
  }
}

function addBinMarkers(binsToDisplay) {
  binsToDisplay.forEach((bin) => {
    const lat = parseFloat(bin.Latitude);
    const lng = parseFloat(bin.Longitude);

    let markerColor = "green";
    if (parseFloat(bin["Fill Level"]) > 50) markerColor = "yellow";
    if (parseFloat(bin["Fill Level"]) > 80) markerColor = "red";

    const marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    }).addTo(map);

    marker.bindPopup(
      `Bin ID: ${bin["Bin ID"]}<br>Location: ${bin.Location}<br>Fill Level: ${bin["Fill Level"]}%`
    );
    markers.push(marker);
  });
}

function normalizeLng(lng) {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

function validateCoord(coord) {
  return {
    lat: Math.max(-90, Math.min(90, coord.lat)),
    lng: normalizeLng(coord.lng),
  };
}

async function calculateRoute() {
  const includeLow = document.getElementById("include-low").checked;
  const includeMedium = document.getElementById("include-medium").checked;
  const includeHigh = document.getElementById("include-high").checked;

  const selectedMarkers = markers.filter((marker, index) => {
    const bin = bins.find(
      (b) =>
        parseFloat(b.Latitude) === marker.getLatLng().lat &&
        parseFloat(b.Longitude) === marker.getLatLng().lng
    );
    if (!bin) return false;
    if (parseFloat(bin["Fill Level"]) <= 50 && includeLow) return true;
    if (
      parseFloat(bin["Fill Level"]) > 50 &&
      parseFloat(bin["Fill Level"]) <= 80 &&
      includeMedium
    )
      return true;
    if (parseFloat(bin["Fill Level"]) > 80 && includeHigh) return true;
    return false;
  });

  if (selectedMarkers.length < 2) {
    alert("Please select at least 2 bins to calculate a route.");
    return;
  }

  try {
    const coordinates = selectedMarkers.map((marker) =>
      validateCoord(marker.getLatLng())
    );
    const routeData = await getRoute(coordinates);

    routeLayer.clearLayers();
    L.polyline(routeData.coordinates, { color: "#e74c3c", weight: 5 }).addTo(
      routeLayer
    );
    map.fitBounds(routeLayer.getBounds());

    const distanceKm = (routeData.distance / 1000).toFixed(2);
    document.getElementById("distance-value").textContent = distanceKm;
  } catch (error) {
    console.error("Routing error:", error);
    alert("Error calculating route: " + error.message);
    document.getElementById("distance-value").textContent = "0";
  }
}

async function getRoute(coordinates) {
  const osrmUrl = "https://router.project-osrm.org/route/v1/driving/";
  const locs = coordinates
    .map((coord) => `${coord.lng},${coord.lat}`)
    .join(";");

  try {
    const response = await fetch(
      `${osrmUrl}${locs}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== "Ok") throw new Error(data.message);

    return {
      coordinates: data.routes[0].geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]),
      distance: data.routes[0].distance,
    };
  } catch (error) {
    console.error("OSRM API error:", error);
    throw error; // Re-throw the error to be caught by calculateRoute
  }
}

function clearAll() {
  markers.forEach((marker) => map.removeLayer(marker));
  markers = [];
  routeLayer.clearLayers();
  document.getElementById("distance-value").textContent = "0";
}

function filterTable() {
  const filterId = document.getElementById("filter-id").value.toLowerCase();
  const filterLocation = document
    .getElementById("filter-location")
    .value.toLowerCase();
  const tableBody = document.getElementById("bin-table-body");
  //check if table has child nodes, if it does then clear it.
  if (tableBody.hasChildNodes()) {
    tableBody.innerHTML = "";
  }

  const selectedRegion = document.getElementById("region").value;
  const filteredBins =
    selectedRegion === "all"
      ? bins
      : bins.filter((bin) => bin.Region === selectedRegion);

  filteredBins.forEach((bin) => {
    if (
      (bin["Bin ID"].toString().toLowerCase().includes(filterId) ||
        filterId === "") &&
      (bin.Location.toLowerCase().includes(filterLocation) ||
        filterLocation === "")
    ) {
      const row = `<tr><td>${bin["Bin ID"]}</td><td>${bin.Location}</td><td>${bin["Fill Level"]}</td></tr>`;
      tableBody.innerHTML += row;
    }
  });
}

function sortTable(ascending) {
  const selectedRegion = document.getElementById("region").value;
  const filteredBins =
    selectedRegion === "all"
      ? bins
      : bins.filter((bin) => bin.Region === selectedRegion);

  filteredBins.sort((a, b) => {
    if (ascending) {
      return parseFloat(a["Fill Level"]) - parseFloat(b["Fill Level"]);
    } else {
      return parseFloat(b["Fill Level"]) - parseFloat(a["Fill Level"]);
    }
  });

  filterTable();
}

function createFillLevelChart(bins) {
  const selectedRegion = document.getElementById("region").value;
  const filteredBins =
    selectedRegion === "all"
      ? bins
      : bins.filter((bin) => bin.Region === selectedRegion);

  const lowCount = filteredBins.filter(
    (bin) => parseFloat(bin["Fill Level"]) <= 50
  ).length;
  const mediumCount = filteredBins.filter(
    (bin) =>
      parseFloat(bin["Fill Level"]) > 50 && parseFloat(bin["Fill Level"]) <= 80
  ).length;
  const highCount = filteredBins.filter(
    (bin) => parseFloat(bin["Fill Level"]) > 80
  ).length;

  const ctx = document.getElementById("fillLevelChart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Low (0-50%)", "Medium (51-80%)", "High (81-100%)"],
      datasets: [
        {
          label: "Number of Bins",
          data: [lowCount, mediumCount, highCount],
          backgroundColor: ["green", "yellow", "red"],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
        },
      },
    },
  });
}

function createMapLegend() {
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "info legend");
    div.innerHTML += "<h4>Fill Level</h4>";
    div.innerHTML +=
      '<i style="background: green"></i><span>Low (0-50%)</span><br>';
    div.innerHTML +=
      '<i style="background: yellow"></i><span>Medium (51-80%)</span><br>';
    div.innerHTML +=
      '<i style="background: red"></i><span>High (81-100%)</span><br>';
    return div;
  };

  legend.addTo(map);
}

// Add event listeners to input fields for filtering.
document.getElementById("filter-id").addEventListener("input", filterTable);
document
  .getElementById("filter-location")
  .addEventListener("input", filterTable);

// Add event listener to region selection.
document.getElementById("region").addEventListener("change", updateMap);

// Initialize map when page loads
initMap();
