

//selection
let search = document.querySelector('.weather_search');
let city  = document.querySelector('.weather_city');
let day = document.querySelector('.weather_day');
let humidity = document.querySelector('.weather_ind--humidity>.value');
let wind = document.querySelector('.weather_ind--wind>.value');
let pressure = document.querySelector('.weather_ind--pressure>.value');
let temp = document.querySelector('.weather_temperature>.value');
let image = document.querySelector('.weather_image');
let forecastBlock = document.querySelector('.weather_forecast');
let datalist = document.getElementById('suggestions');

//API KEY and Base Endpoints
let weatherAPIkey = '97e19f65cddd344afc4a60a6ff1b31dc';
let weatherBaseEndpoint = "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" + weatherAPIkey;
let forecastBaseEndpoint = "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" + weatherAPIkey;
let iconBaseEndpoint = "http://openweathermap.org/img/wn/";    
let geocodingBaseEndpoint = "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" + weatherAPIkey + "&q="; //to increase the number of suggested cities here, change the value of limit (currently 5)



//Object of Image and their resp Weather Code from Forecast API
let weatherImages = [
  {
    url: 'images/thunderstorm.png',
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232]
  }
  ,{
    url: 'images/shower-rain.png',
    ids: [300, 301, 302, 310, 311, 312, 313, 314, 321]
  }
  ,{
    url: 'images/rain.png',
    ids: [500, 501, 502, 503, 504, 511, 520, 521, 522, 531]
  }
  ,{
    url: 'images/snow.png',
    ids: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]
  }

  ,{
    url: 'images/mist.png',
    ids: [701]
  }

  ,{
    url: 'images/mist.png',
    ids: [711, 721, 731, 741, 751, 761, 762, 771, 781]
  }
,{
   url: 'images/clear-sky.png',
   ids: [800]
}
,{
    url: 'images/few-clouds.png',
     ids: [801]
  }
  ,{
    url: 'images/scattered-clouds.png',
     ids: [802]
  }
,{
  url: 'images/broken-clouds.png',
   ids: [803, 804]
}];


//fetch from Weather API
let getWeatherByCityName = async (city)=>{
  let endpoint = weatherBaseEndpoint + "&q=" + city;
  return await ( await fetch(endpoint)).json();
}

//Fetch from Forecast API
let getForecastByCityID = async (id)=>{

  let endpoint = forecastBaseEndpoint + "&id=" + id;
  let forecast = await (await fetch(endpoint)).json();

  //The API is an array of 40 with 5 day forecast at 3 hours interval
  //For each day we choose one time to get an array of 5(currently 12:00 PM)
  let forecastList = forecast.list;
  let arr = [];
  forecastList.forEach( day =>{
    let date = new Date(day.dt_txt.replace(' ','T'));
    let hour = date.getHours();
   if(hour === 12) arr.push(day);
  })
  return arr;
}


//updates Weather on HTML
let updateWeather = (weather) =>{

  city.textContent = weather.name + ", " + weather.sys.country;
  day.textContent = theDay();
  humidity.textContent = weather.main.humidity;
  pressure.textContent = weather.main.pressure;
  wind.textContent = windDirection(weather.wind.deg) + ", " + weather.wind.speed;
  temp.textContent = weather.main.temp > 0 ? "+" + Math.round(weather.main.temp) :
  Math.round(weather.main.temp);
  let imgID = weather.weather[0].id;
  weatherImages.forEach( set =>{
    if(set.ids.includes(imgID)){
      image.src = set.url;
    }
  }
  )
}

//Updates Forecast on HTML
let updateForecast = (forecast) => {

  forecastBlock.innerHTML = '';
  forecast.forEach( day =>{

    let icon = iconBaseEndpoint + day.weather[0].icon + "@2x.png";
    let dayOfWeek = theDay(day.dt * 1000);
    let temperature = day.main.temp > 0 ? 
                "+" + Math.round(day.main.temp) : Math.round(day.main.temp);
    let forecastItem  = `
    <article class="weather_forecast_item">
    <img src="${icon}" alt="${day.weather[0].description}" class="weather_forecast_icon">
    <h3 class="weather_forecast_day">${dayOfWeek}</h3>
    <p class="weather_forecast_temperature">
      <span class="value">${temperature}</span> &deg;C
    </p>
    </article>
    `;
    forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
  })
}

//When a city is searched with the press of Key - Enter(code 13)
search.addEventListener('keydown', async (e)=>{
if(e.keyCode == 13){
  let weather = await getWeatherByCityName(search.value);

  //If the city doesn't exist
  if(weather.cod == 404){
    return;
  }

  let cityID = weather.id;
  let forecast = await getForecastByCityID(cityID);

   updateWeather(weather);
   updateForecast(forecast);
  } 
})

//Geocoding API working as soon as there is input
search.addEventListener('input', async () =>{

 if(search.value.length <= 2 ){
  datalist.innerHTML = '';
   return;
  }

  let endpoint = geocodingBaseEndpoint + search.value;
  let result = await fetch(endpoint);
  let location = await result.json();
  console.log(location);
  datalist.innerHTML = '';
  location.forEach(city =>{
    let option = document.createElement('option');
    option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
    datalist.appendChild(option);
  })

})

//returns the day of the week
let theDay = (dt = new Date().getTime()) =>{
  return new Date(dt).toLocaleDateString('en-En', { 'weekday' : 'long'});
}

//determines wind directino according to degree
let windDirection =  (degrees) =>{
if(degrees > 270 ) return "North-West";
if(degrees === 270 ) return "West";
if(degrees > 180) return "South-West";
if(degrees === 180 ) return "South";
if(degrees > 90) return "South-East";
if(degrees === 90 ) return "East";
if(degrees > 0 ) return "North-East";
if(degrees === 0 ) return "North";

}

let init = async (cityName) => {

  let weather = await getWeatherByCityName(cityName);
  
  let cityID = weather.id;
  let forecast = await getForecastByCityID(cityID);

   updateWeather(weather);
   updateForecast(forecast);

}

let blurFilter = async () =>{
 await init('Delhi');
 document.body.style.filter = ` blur(${0})`;
}

blurFilter();