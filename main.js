import { getLongLat } from "./utils/getLongLat.js";
import { getLocation } from "./utils/getLocation.js";
import { getMap } from "./utils/getMap.js";

const form = document.querySelector("form");
const output = document.querySelector("#post-code");
const county = document.querySelector("#county");
const current = document.querySelector("#current");
const currentsun = document.querySelector("#currentsun");

let image = null;
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  current.innerHTML = "";
  currentsun.innerHTML = "";
  output.innerHTML = "";
  county.innerHTML = "";

  const formData = new FormData(form);
  const searchedPostcode = formData.get("postcode");

  output.innerHTML = searchedPostcode;
  form.reset();

  try {
    const location = await getLocation(searchedPostcode);
    let loc = location.admin_district;
    county.innerHTML = loc;
    const coordinates = await getLongLat(searchedPostcode);
    let lat = coordinates.latitude;
    let lon = coordinates.longitude;
    const imageURL = await getMap(lat, lon);
    const mapDiv = document.querySelector("#map");
    const newImage = document.createElement("img");
    newImage.src = imageURL;
    newImage.alt = "map of searched postcode";
    if (image) {
      // If a previous map exists, remove it from the DOM
      mapDiv.removeChild(image);
    }
    // Append the new map to the mapDiv
    image = newImage; // Update the reference to the new map
    mapDiv.appendChild(newImage);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;
    // const enddate = `${year}-${month}-${day+7}`;
    console.log(date);

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone=Europe%2FLondon`

    const response = await fetch(apiUrl);

    if (response.ok) {
      const resData = await response.json();
      console.log(resData);

      let current_temp = resData.current_weather.temperature;
      let current_windSpeed = resData.current_weather.windspeed;
      let s_rise = resData.daily.sunrise;
      let s_set = resData.daily.sunset;
      let fore_max = resData.daily.temperature_2m_max
      let fore_min = resData.daily.temperature_2m_min

      const temperatureHeading = document.createElement("h4");
      temperatureHeading.textContent = `Temperature: ${current_temp} °C`;

      const windSpeedHeading = document.createElement("h4");
      windSpeedHeading.textContent = `Wind Speed: ${current_windSpeed} km/h`;

      const sunrise = document.createElement("h4");
      const sunriseTime = s_rise[0].split("T")[1].slice(0, 5);
      sunrise.textContent = `Sunrise: ${sunriseTime}`;

      const sunset = document.createElement("h4");
      const sunsetTime = s_set[0].split("T")[1].slice(0, 5);
      sunset.textContent = `Sunset: ${sunsetTime}`;

      // forecast
      for (let i=1;i<8;i++){
        const day = document.createElement("div");
        const forecast_max = document.createElement("h4");
        forecast_max.textContent = `Max temp: ${fore_max[i-1]}`;
        day.appendChild(forecast_max);

        const forecast_min = document.createElement("h4");
        forecast_min.textContent = `Min temp: ${fore_min[i-1]}`;
        day.appendChild(forecast_min);

        document.querySelector(`#day${i}`).appendChild(day);

      }

      current.appendChild(temperatureHeading);
      current.appendChild(windSpeedHeading);
      currentsun.appendChild(sunrise);
      currentsun.appendChild(sunset);

    } else {
      throw new Error(response.status);
    }
  } catch (error) {
    console.log(error);
  }
});