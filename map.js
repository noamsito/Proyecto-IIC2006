const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

function getColor(d) {
  return d > 20 ? '#800026' :
         d > 15 ? '#BD0026' :
         d > 10 ? '#E31A1C' :
         d > 5  ? '#FC4E2A' :
         d > 1  ? '#FD8D3C' :
         d > 0  ? '#FEB24C' :
                  '#FFEDA0';
}

function style(feature) {
  const pais = feature.properties.name;
  const conflictos = conflictosPorPais[pais] || 0;
  return {
    fillColor: getColor(conflictos),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  };
}

function onEachFeature(feature, layer) {
  const pais = feature.properties.name;
  const conflictos = conflictosPorPais[pais] || 0;
  layer.bindPopup(`<b>${pais}</b><br>Conflictos: ${conflictos}`);
}

fetch('countries.geo.json')
  .then(res => res.json())
  .then(geojson => {
    L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  });
