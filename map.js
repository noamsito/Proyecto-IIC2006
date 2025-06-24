const map = L.map("map", {
  maxBounds: [[-90, -180], [90, 180]],
  maxBoundsViscosity: 1.0,
  worldCopyJump: false,
}).setView([20, 0], 2);

map.setMinZoom(2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let geoJsonLayer;
let currentMinFilter = 0;

function getColor(conflicts) {
  const colors = {
    0: "#f1f5f9",       
    1: "#fef3c7",      
    5: "#fed7aa",      
    10: "#fca5a5",     
    15: "#f87171",     
    20: "#dc2626"      
  };
  
  if (conflicts === 0) return colors[0];
  if (conflicts >= 1 && conflicts < 5) return colors[1];
  if (conflicts >= 5 && conflicts < 10) return colors[5];
  if (conflicts >= 10 && conflicts < 15) return colors[10];
  if (conflicts >= 15 && conflicts < 20) return colors[15];
  return colors[20];
}

function getCountryStyle(feature) {
  const countryName = feature.properties.name || feature.properties.NAME;
  const conflicts = conflictosPorPais[countryName] || 0;
  const isVisible = conflicts >= currentMinFilter;
  
  return {
    fillColor: isVisible ? getColor(conflicts) : "#f8fafc",
    weight: 1,
    opacity: isVisible ? 1 : 0.3,
    color: "#e2e8f0",
    fillOpacity: isVisible ? 0.8 : 0.2,
  };
}

function onEachCountry(feature, layer) {
  const countryName = feature.properties.name || feature.properties.NAME;
  const conflicts = conflictosPorPais[countryName] || 0;
  
  const popupContent = `
    <div class="popup-header">${countryName}</div>
    <div class="popup-stats">
      <strong>Conflictos registrados:</strong> ${conflicts}<br>
      <strong>Nivel de intensidad:</strong> ${getIntensityLabel(conflicts)}
    </div>
    ${soundSystem.enabled ? '<div class="popup-sound-info">💭 Haga clic para escuchar la sonificación</div>' : ''}
  `;
  
  layer.bindPopup(popupContent);
  
  layer.on({
    click: () => {
      if (conflicts >= currentMinFilter) {
        soundSystem.play(conflicts);
      }
    },
    mouseover: (e) => {
      if (conflicts >= currentMinFilter) {
        e.target.setStyle({
          weight: 2,
          color: '#1e293b',
          fillOpacity: 0.9
        });
      }
    },
    mouseout: (e) => {
      if (geoJsonLayer) {
        geoJsonLayer.resetStyle(e.target);
      }
    }
  });
}

function getIntensityLabel(conflicts) {
  if (conflicts === 0) return "Sin conflictos registrados";
  if (conflicts < 5) return "Muy baja";
  if (conflicts < 10) return "Baja";
  if (conflicts < 15) return "Media";
  if (conflicts < 20) return "Alta";
  return "Muy alta";
}

function updateLegend() {
  const legendContent = document.getElementById('legendContent');
  const levels = [
    { min: 0, max: 0, label: "Sin conflictos", color: getColor(0) },
    { min: 1, max: 4, label: "1-4 conflictos", color: getColor(1) },
    { min: 5, max: 9, label: "5-9 conflictos", color: getColor(5) },
    { min: 10, max: 14, label: "10-14 conflictos", color: getColor(10) },
    { min: 15, max: 19, label: "15-19 conflictos", color: getColor(15) },
    { min: 20, max: 25, label: "20+ conflictos", color: getColor(20) }
  ];
  
  legendContent.innerHTML = levels.map(level => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${level.color}"></div>
      <div class="legend-label">${level.label}</div>
    </div>
  `).join('');
}

function updateStats() {
  const totalCountries = Object.keys(conflictosPorPais).length;
  const visibleCountries = Object.values(conflictosPorPais).filter(c => c >= currentMinFilter).length;
  const totalConflicts = Object.values(conflictosPorPais).reduce((sum, c) => sum + c, 0);
  
  document.getElementById('totalCountries').textContent = totalCountries;
  document.getElementById('visibleCountries').textContent = visibleCountries;
  document.getElementById('totalConflicts').textContent = totalConflicts;
}

function updateMap() {
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer(layer => {
      const style = getCountryStyle(layer.feature);
      layer.setStyle(style);
    });
  }
  updateStats();
}

fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .then(response => response.json())
  .then(data => {
    geoJsonLayer = L.geoJson(data, {
      style: getCountryStyle,
      onEachFeature: onEachCountry,
    }).addTo(map);
    
    updateLegend();
    updateStats();
  })
  .catch(error => {
    console.error('Error cargando datos geográficos:', error);
    if (typeof countries !== 'undefined') {
      geoJsonLayer = L.geoJson(countries, {
        style: getCountryStyle,
        onEachFeature: onEachCountry,
      }).addTo(map);
      updateLegend();
      updateStats();
    }
  });

const minConflictsSlider = document.getElementById('minConflicts');
const minConflictsDisplay = document.getElementById('minConflictsDisplay');

minConflictsSlider.addEventListener('input', function() {
  currentMinFilter = parseInt(this.value);
  minConflictsDisplay.textContent = currentMinFilter === 0 ? 
    '0 conflictos' : 
    `${currentMinFilter}+ conflictos`;
  updateMap();
});

const soundToggle = document.getElementById('soundToggle');
soundToggle.addEventListener('click', function() {
  soundSystem.toggle();
  this.classList.toggle('active');
});

function adjustMapHeight() {
  const header = document.querySelector('.map-header');
  const headerHeight = header ? header.offsetHeight : 0;
  
  if (window.innerWidth <= 768) {
    document.getElementById('map').style.height = `calc(100vh - ${headerHeight + 20}px)`;
    document.getElementById('map').style.marginTop = `${headerHeight + 10}px`;
  } else {
    document.getElementById('map').style.height = '100vh';
    document.getElementById('map').style.marginTop = '0';
  }
}

window.addEventListener('load', adjustMapHeight);
window.addEventListener('resize', adjustMapHeight);