const locEl = document.getElementById('location');
const errEl = document.getElementById('error');
const curTemp = document.getElementById('current-temp');
const curText = document.getElementById('current-text');
const curDetails = document.getElementById('current-details');
const daysEl = document.querySelector('.days');

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'weather-forecast-app' } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function handleError(err) {
  console.error(err);
  errEl.textContent = err.message;
}

async function loadWeather(lat, lon) {
  try {
    locEl.textContent = `Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`;
    const p = await fetchJSON(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
    const { forecast, forecastHourly, observationStations } = p.properties;

    const obs = await fetchJSON(observationStations);
    const station = obs.features[0]?.properties.stationIdentifier;
    const obsNow = await fetchJSON(`https://api.weather.gov/stations/${station}/observations/latest`);
    const o = obsNow.properties;
    curTemp.textContent = `🌡️ ${o.temperature.value.toFixed(1)} °C`;
    curText.textContent = o.textDescription;
    curDetails.textContent = `Wind: ${o.windSpeed.value.toFixed(1)} m/s, Humidity: ${o.relativeHumidity.value.toFixed(1)} %`;

    const f7 = await fetchJSON(forecast);
    const days = f7.properties.periods.filter(p => p.isDaytime).slice(0,7);
    daysEl.innerHTML = days.map(d => `
      <div class="day">
        <div class="date">${d.name}</div>
        <div class="icon">${d.icon ? `<img src="${d.icon}" alt="${d.shortForecast}" width=50>` : ''}</div>
        <div class="temp">${d.temperature} °${d.temperatureUnit}</div>
        <div class="desc">${d.shortForecast}</div>
      </div>
    `).join('');
  } catch(err) {
    handleError(err);
  }
}

function init() {
  if (!navigator.geolocation) return handleError(new Error('Geolocation not supported'));
  navigator.geolocation.getCurrentPosition(
    pos => loadWeather(pos.coords.latitude, pos.coords.longitude),
    err => handleError(new Error(`Geolocation error (${err.code}): ${err.message}`)),
    { enableHighAccuracy:true, timeout:10000 }
  );
}

init();