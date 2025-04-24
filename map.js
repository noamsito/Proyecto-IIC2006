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

  let legendContent = '<div style="background: rgba(255, 255, 255, 0.9); padding: 10px; border-radius: 5px; font-family: Arial, sans-serif; font-size: 12px;">';
  legendContent += '<strong>Conflictos</strong><br>';

  for (let i = 0; i < grades.length; i++) {
    const from = grades[i];
    const to = grades[i + 1];

    legendContent += `
      <div style="margin-bottom: 5px; display: flex; align-items: center;">
      <span style="
        display: inline-block; 
        width: 16px; 
        height: 16px; 
        background-color: ${getColor(from)}; 
        margin-right: 8px; 
        border: 1px solid #ccc;">
      </span>
      ${from}${to ? (from === 0 && to - 1 === 0 ? '' : `&ndash;${to - 1}`) : '+'}
      </div>
    `;
  }

  legendContent += '</div>';
  div.innerHTML = legendContent;
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
