// weather.js is the only js as the main to initialize/handle localstorage data, add a button per submit, sort the city buttons, 
// and show weather forcasts.  If the APIs or invalid input, it will throw a message above the search button.

// Global variables:
// searchButtonEl, navEl, reminderEl, todayEl, fiveDaysEl, cityInputEl - references of html elements shared across functions 
// emptyInputReminder, geoFailedReminder, invalidNameReminder, weatherFailedReminder, invalidGeoReminder - error messages for error handling
// cityButtons - an array holds the searched cities.  10 items max. 

const searchButtonEl = document.querySelector("#search-city");
const navEl = document.querySelector("#nav-cities");
const reminderEl = document.querySelector("#reminder");
const todayEl = document.querySelector("#weather-today");
const fiveDaysEl = document.querySelector("#weather-5days");
const cityInputEl = document.querySelector('#search-city-name');
const emptyInputReminder = "^^ Type something up here , plz 🥺 ^^";
const geoFailedReminder = "Geocoding failed.  Come back in 5 mins.";
const invalidNameReminder = "Invalid city name. Try again.";
const weatherFailedReminder = "OpenWeather failed.  Check the API call?"
const invalidGeoReminder = "OpenWeather failed with the lat+lon.  Check it?"

let cityButtons = JSON.parse(localStorage.getItem("cities"));

function checkCity() {
  const cityInput = document.querySelector('#search-city-name').value.trim();
  if (cityInput.length === 0) {
    showReminder(emptyInputReminder);
    return;
  } 
  convertCityToCoordinate(cityInput);
  cityInputEl.value = "";
}

function showReminder(text) {
  reminderEl.textContent = text;
}

function addCityButton(city) {
  // 1. search existing buttons for the same name. if so, move the found index to 0.
  // 2. if not, shift to 0.  
  // Optional, if length > 10, pop.
  const dupeIndex = cityButtons.findIndex( (button) => button.name === city.name);
  if (dupeIndex > 0) {
    const dupe = cityButtons[dupeIndex];
    cityButtons.splice(dupeIndex, 1);
    cityButtons.unshift(dupe);
  } else if (dupeIndex === 0) {
    return;
  } else {
    cityButtons.unshift(city);
  }
  if (cityButtons.length > 10) cityButtons.pop();
  localStorage.setItem("cities", JSON.stringify(cityButtons));
  loadCityButton();
}

function convertCityToCoordinate(cityName) {
  let geoURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=1b40ae1a60514ea8a70f1b260e3d46bb&limit=1";
  fetch(geoURL).then(function (response) {
    if (response.status = 200) {
      return response.json();
    } else {
      showReminder(geoFailedReminder);
    }
  }) .then(function(data) {
    if (data.length > 0) {
      // nested ternary syntax to check whther the geocoding return has local names.  If so, return en. if not, return the user input or the only name.  
      const city = {
        "name": ((Object.hasOwn(data[0], "local_names")) ? ((Object.hasOwn(data[0].local_names, "en")) ? data[0].local_names.en : city) : data[0].name), 
        "lat": data[0].lat, 
        "lon": data[0].lon,
      }
      addCityButton(city);
      getCoordinateWeather(city);
    } else {
      showReminder(invalidNameReminder);
    }
  });
}

function getCoordinateWeather(city) {
  let weatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + city.lat + "&lon=" + city.lon + "&appid=1b40ae1a60514ea8a70f1b260e3d46bb&units=imperial";
  fetch(weatherURL).then(function (response) {
    if (response.status = 200) {
      return response.json();
    } else {
      showReminder(weatherFailedReminder);
    }
  }) .then(function(data) {
    if (data.list.length > 0) {
      printTodayWeather(city, data.list[0]);
      printFiveDaysWeather(data.list);
    } else {
      showReminder(invalidGeoReminder);
    }
  });
}

function printTodayWeather(city, data) {
  wipeWeather();

  const cityName = city.name;
  const date = "(" + dayjs.unix(data.dt).format("MM/DD/YYYY") + ")";
  const iconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
  const temp = "Temp: " + data.main.temp;
  const wind = "Wind: " + data.wind.speed + " MPH";
  const humidity = "Humidity: " + data.main.humidity + " %";
  
  const headerEl = document.createElement("h2");
  headerEl.textContent = cityName + " " + date + " ";
  headerEl.setAttribute("class", "text-3xl font-black");

  const emojiEl = document.createElement("img");
  emojiEl.setAttribute("src", iconURL);
  emojiEl.setAttribute("class", "inline-block");
  headerEl.append(emojiEl);

  const tempEl = document.createElement("p");
  tempEl.textContent = temp;
  tempEl.setAttribute("class", "leading-loose text-xl");

  const windEl = document.createElement("p");
  windEl.textContent = wind;
  windEl.setAttribute("class", "leading-loose text-xl");

  const huminityEl = document.createElement("p");
  huminityEl.textContent = humidity;
  huminityEl.setAttribute("class", "leading-loose text-xl");

  todayEl.append(headerEl, tempEl, windEl, huminityEl);
}

function printFiveDaysWeather(data) {
  for (let i = 7; i < 40; i = i + 8) {
    fiveDaysEl.append(prepForecastCard(data[i]));
  } 
}

function prepForecastCard(data) {
  const cardEl = document.createElement("section");
  cardEl.setAttribute("class", "border-b-slate-400 border-solid border bg-stone-600 text-gray-200 p-2");

  if (typeof(data) === "undefined") {
    cardEl.textContent = "Data not available T_T";

  } else {
    const date = dayjs.unix(data.dt).format("MM/DD/YYYY");
    const iconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";
    const temp = "Temp: " + data.main.temp;
    const wind = "Wind: " + data.wind.speed + " MPH";
    const humidity = "Humidity: " + data.main.humidity + " %";

    const headerEl = document.createElement("h3");
    headerEl.textContent = date;
    headerEl.setAttribute("class", "text-2xl font-semibold");

    const emojiEl = document.createElement("img");
    emojiEl.setAttribute("src", iconURL);

    const tempEl = document.createElement("p");
    tempEl.textContent = temp;
    tempEl.setAttribute("class", "leading-loose");
  
    const windEl = document.createElement("p");
    windEl.textContent = wind;
    windEl.setAttribute("class", "leading-loose");
  
    const huminityEl = document.createElement("p");
    huminityEl.textContent = humidity;
    huminityEl.setAttribute("class", "leading-loose");

    cardEl.append(headerEl, emojiEl, tempEl, windEl, huminityEl);
  } 
  return cardEl;
}

function wipeWeather() {
  todayEl.innerHTML = "";
  fiveDaysEl.innerHTML = "";
}

function wipeDashboard() {
  reminderEl.textContent = "";
  todayEl.innerHTML = "Submit a city name to the left or pick a button from the list.";
  fiveDaysEl.innerHTML = "";
  navEl.innerHTML = "";
}

function loadCityButton() {
  wipeDashboard();
  
  cityButtons.forEach(city => {
    const button = document.createElement("button");
    button.textContent = city.name;
    button.setAttribute("class", "w-full my-3 hover:ring-2 hover:ring-gray-800 bg-orange-300 rounded-full border-1");
    button.setAttribute("type", "button");
    button.setAttribute("data-lat", city.lat);
    button.setAttribute("data-lon", city.lon);
    navEl.append(button);
  })
}

function clickToWeather (event) {
  if (event.target.tagName === "BUTTON" || event.target.tagName === "button") {
    const buttonEl = event.target;
    const city = {
      "name": buttonEl.textContent,
      "lat": buttonEl.dataset.lat, 
      "lon": buttonEl.dataset.lon
    }
    addCityButton(city);
    getCoordinateWeather(city);
  }
}

function init() {
  if (cityButtons === null){
    localStorage.setItem("cities",JSON.stringify([]));
    cityButtons = JSON.parse(localStorage.getItem("cities"));
  } else if (cityButtons[0] != null ) {
    loadCityButton();
  }
  searchButtonEl.addEventListener("click", checkCity);
  navEl.addEventListener("click", clickToWeather);
  cityInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchButtonEl.click();
    }
  });
}

init();