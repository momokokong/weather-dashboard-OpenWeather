// api key: 1b40ae1a60514ea8a70f1b260e3d46bb

// http://api.openweathermap.org/geo/1.0/direct?q=boston&appid=1b40ae1a60514ea8a70f1b260e3d46bb&limit=1

// api.openweathermap.org/data/2.5/forecast?lat=53.9590555&lon=-1.0815361&appid=1b40ae1a60514ea8a70f1b260e3d46bb&units=imperial

// localstorage:
// buttons: city name, lat, lon

const searchButtonEl = document.querySelector("#search-city");
const navEl = document.querySelector("#nav-cities");
const reminderEl = document.querySelector("#reminder");
const todayEl = document.querySelector("#weather-today");
const fiveDaysEl = document.querySelector("#weather-5days");
const cityInputEl = document.querySelector('#search-city-name');
const emptyInputReminder = "^^ Type something up here , plz 🥺 ^^";
const geoFailedReminder = "Geocoding failed.  Come back in 5 mins.";
const invalidNameReminder = "Invalid city name. Try again.";

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
  } else {
    cityButtons.unshift(city);
  }
  if (cityButtons.length > 10) cityButtons.pop();
  localStorage.setItem("cities", JSON.stringify(cityButtons));
  loadCityButton();
}

function convertCityToCoordinate(cityName) {
  let geoURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=1b40ae1a60514ea8a70f1b260e3d46bb&limit=1";
  fetch(geoURL).then(function (response) {
    if (response.status = 200) {
      return response.json();
    } else {
      showReminder(geoFailedReminder);
    }
  }) .then(function(data) {
    if (data.length > 0) {
      // nested ternary syntax to check whther the geocoding return has local names.  If so, return en. if not, return the user input or the only name.  
      console.log({"name": ((Object.hasOwn(data[0], "local_names")) ? ((Object.hasOwn(data[0].local_names, "en")) ? data[0].local_names.en : city) : data[0].name), "lat": data[0].lat, "lon": data[0].lon});
      const city = {
        "name": ((Object.hasOwn(data[0], "local_names")) ? ((Object.hasOwn(data[0].local_names, "en")) ? data[0].local_names.en : city) : data[0].name), 
        "lat": data[0].lat, 
        "lon": data[0].lon
      }
      addCityButton(city);
    } else {
      showReminder(invalidNameReminder);
    }
  });
}

function getCoordinateWeather(city) {
  let weatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + city.lat + "&lon=" + city.lon + "&appid=1b40ae1a60514ea8a70f1b260e3d46bb&units=imperial"
}

function printTodayWeather() {

}

function printFiveDaysWeather() {

}

function wipeDashboard() {
  reminderEl.textContent = "";
  todayEl.innerHTML = "";
  fiveDaysEl.innerHTML = "";
  navEl.innerHTML = "";
}

function loadCityButton() {
  wipeDashboard();
  
  cityButtons.forEach(city => {
    const button = document.createElement("button");
    button.textContent = city.name;
    button.setAttribute("class", "w-full my-3 focus:ring-0 bg-orange-300 rounded-full border-1");
    button.setAttribute("type", "button");
    button.setAttribute("data-lat", city.lat);
    button.setAttribute("data-lon", city.long);
    navEl.append(button);
  })
  
}

function init() {
  // console.log(cityButtons.length);
  if (cityButtons === null){
    localStorage.setItem("cities",JSON.stringify([]));
    cityButtons = JSON.parse(localStorage.getItem("cities"));
  } else if (cityButtons[0] != null ) {
    loadCityButton();
  }
  searchButtonEl.addEventListener('click', checkCity);
  cityInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchButtonEl.click();
    }
  });
}

init();