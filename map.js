const map = L.map('map', {
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  maxBoundsViscosity: 1.0,
  worldCopyJump: false
}).setView([20, 0], 2);

map.setMinZoom(2);

// Agregar título al mapa con estilo llamativo
const title = L.control({ position: 'topleft' });
title.onAdd = function () {
  const div = L.DomUtil.create('div', 'map-title');
  div.innerHTML = `
    <h2 style="
      text-align: center; 
      margin: 0; 
      font-size: 24px; 
      color: #333; 
      background: rgba(255, 255, 255, 0.8); 
      padding: 10px 20px; 
      border-radius: 8px; 
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    ">
      🌍 Mapa de Conflictos por País 🌍
    </h2>`;
  div.style.position = 'fixed';
  div.style.top = '10px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.zIndex = '1000';
  return div;
};
title.addTo(map);

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

// Agregar índice de colores
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  const grades = [0, 1, 5, 10, 15, 20];

  div.innerHTML = `
    <div style="background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 8px;">
      <strong>Conflictos</strong><br>
      ${grades.map((grade, i) => `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <i style="background:${getColor(grade + 1)}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i>
          ${grade}${grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'}
        </div>
      `).join('')}
    </div>
  `;
  return div;
};
legend.addTo(map);

fetch('countries.geo.json')
  .then(res => res.json())
  .then(geojson => {
    L.geoJson(geojson, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  });
