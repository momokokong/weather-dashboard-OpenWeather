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

// Page initialization
// Function: init()
// parameter: none
// return: none
// Initiate cityButtons as an empty array if it is null.  Render the buttons if cityButtons contains something. Add click and enter listeners
// to the respective elements.
function init() {
  wipeDashboard();
  if (cityButtons === null){
    localStorage.setItem("cities",JSON.stringify([]));
    cityButtons = JSON.parse(localStorage.getItem("cities"));
  } else if (cityButtons[0] != null ) {
    loadCityButton();
  }
  navEl.addEventListener("click", clickToWeather);

  // a click listener on the search button and redirect an keypress:enter event to the search button. 
  searchButtonEl.addEventListener("click", checkCity);
  cityInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchButtonEl.click();
    }
  });
}

// Take user input for the city name
// Function: checkCity()
// parameter: none
// return: none
// Check whether the user enters a valid input.  If so, pass it to convertCityToCoordinate to fetch geocoding, create buttons and show forecasts.
// If not, show a reminder.
function checkCity() {
  const cityInput = document.querySelector('#search-city-name').value.trim();
  if (cityInput.length === 0) {
    showReminder(emptyInputReminder);
    return;
  } 
  convertCityToCoordinate(cityInput);
  cityInputEl.value = "";
}

// Show a reminder text
// Function: showReminder(text)
// parameter: text - the reminder string that being shown above the Search button
// return: none
// It's a simple function but used by multiple other functions to deliver the reminders/warnings.
function showReminder(text) {
  reminderEl.textContent = text;
}

// Fetch the geocode latitude and longitude 
// Function: convertCityToCoordinate(cityName)
// parameter: cityName - String that contains the city name input from the form
// return: none
// Fetch only 1 set of geocode from OpenWeather.  We don't care about whether there are multiple cities sharing the name, therefore only interested in 1.
// Once response is 200, check whether it's an array given it's the format when a city geocode is returned.  If not an array,
// it Can be an object returning error code or empty for city not found.  Collect the city name, latitude and longitude, wrap it in 
// the city object then pass onto addCityButton(city) and getCoordinateWeather(city).  There might be more corner cases should be included
// in error handling.
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

// Add/sort a button to nav
// Function: addCityButton(city)
// parameter: city - the object wrapper containing city name, latitude and longitude
// return: none
// Search existing buttons for the same name. if so, move the found button index to 0.  If it's 0, do nothing to the list.
// If not found from the list of buttons(cityButtons), insert to index 0.  Pop 1 button if length is greater than 10. Then save to localstorage.
// Render the buttons (loadCityButton()) onto the nav bar at the end.  
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

// Render existing city buttons
// Function: loadCityButton()
// parameter: none
// return: none
// First, wipe clen the whole page.  Then, for each of the cities in cityButtons, add a button by the city anme and include latitude and
// longitude in the button's data attributes. 
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

// Get weather info by latitude and longitude
// Function: getCoordinateWeather(city) 
// parameter: city - the object wrapper containing city name, latitude and longitude
// return: none
// Fetch the weather info by latitude and longitude from OpenWeather.  If response is well received, move onto printTodayWeather(city, data.list[0])
// printFiveDaysWeather(data.list) to show the weather info on the page.
function getCoordinateWeather(city) {
  let weatherURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + city.lat + "&lon=" + city.lon + "&appid=1b40ae1a60514ea8a70f1b260e3d46bb&units=imperial";
  fetch(weatherURL).then(function (response) {
    if (response.status = 200) {
      return response.json();
    } else {
      showReminder(weatherFailedReminder);
    }
  }) .then(function(data) {
    // > 0 indicates the return data contains at least 1 count of weather data for the given geocode.  If = 0, most likely it's a invalid geocode.
    // There might be more corner cases that are not catched by this but should suffice a large percentage of use cases. 
    // convertCityToCoordinate(cityName) should filter out mose of invalid geocode already.
    if (data.list.length > 0) {
      printTodayWeather(city, data.list[0]);
      printFiveDaysWeather(data.list);
    } else {
      showReminder(invalidGeoReminder);
    }
  });
}

// Render today's weather
// Function: printTodayWeather(city, data)
// parameter: city - the object wrapper containing city name, latitude and longitude, data - the first set of weather info return from OpenWeather which
// contains the most recent weather info.
// return: none
// Wipe clean the weather info sections then append today's weather.
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

// Render 5 days forecast
// Function: printFiveDaysWeather(data)
// parameter: data - the array contains the whole returned data from OpenWeather.  In most of cases it has 40 counts of 3 hour forecase that spread 
// over the next 5 days.
// return: none
// Pick 1 set of the data from each days, then append the info to the fiveDaysEl section.
function printFiveDaysWeather(data) {
  for (let i = 7; i < 40; i = i + 8) {
    fiveDaysEl.append(prepForecastCard(data[i]));
  } 
}

// Render individual card for the 5 day forecast
// Function: prepForecastCard(data)
// parameter: data - the set of weather info that represents one day in the next 5 days.
// return: cardEl - the html element wrapper contains individual day forecast info.
// Interpret the data and prep the html elements accordingly.  If it's undefined, that means OpenWeather does not have future forecast for that date.  
// Then return the card element.
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

// wipe clean the weather info
// Function: wipeWeather()
// parameter: none
// return: none
function wipeWeather() {
  todayEl.innerHTML = "";
  fiveDaysEl.innerHTML = "";
}

// wipe clean the whole dashboard
// Function: wipeWeather()
// parameter: none
// return: none
function wipeDashboard() {
  reminderEl.textContent = "";
  todayEl.innerHTML = "Submit a city name to the left or pick a button from the list.";
  fiveDaysEl.innerHTML = "";
  navEl.innerHTML = "";
}

// Show weather for a specific city button
// Function: clickToWeather (event)
// parameter: event - the click event
// return: none.
// Interpret the city name, latitude and longitude from the button html attributes, then pass onto addCityButton(city) and getCoordinateWeather(city)
// to sort the buttons and show weather info.
function clickToWeather (event) {
  // some browser use upper case for tagname
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

init();