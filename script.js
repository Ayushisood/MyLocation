'use strict';
import 'core-js/stable';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const form = document.querySelector('.form-control');
const searchBtn = document.querySelector('.btn-search');
const inputCountry = document.querySelector('.text-search');

///////////////////////////////////////

//AJAX calls to API

/*const countryAPI = function (countryName) {
  //using older way
  const request = XMLHttpRequest();
  request.open('GET', 'https://restcountries.eu/rest/v2/name/countryName');
  request.send();

  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText); //destructuring the received array
    console.log(data);

    const html = `<article class="country">
    <img class="country__img" src="${data.flag}" />
    <div class="country__data">
      <h3 class="country__name">${data.name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)} people</p>
      <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
      <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
    </div>
  </article>`;

    countriesContainer.insertAdjacentHTML('beforeend', html);
    countriesContainer.style.opacity = 1;
  });
};*/

///to make AJAX call one after another in an order, use callback hell
//i.e the nested callbacks to get rid of them use promises

//modern way of AJAX calls and fetching APIs

const showCountry = function (data, country = 'country') {
  const html = `<article class=${country}>
    <img class="country__img" src="${data.flag}" />
    <div class="country__data">
      <h3 class="country__name">${data.name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)} people</p>
      <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
      <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
    </div>
  </article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

//error me=sg
const displayError = function (errMsg) {
  //countriesContainer.insertAdjacentText('beforeend', errMsg);
  countriesContainer.textContent = `${errMsg}`;
  countriesContainer.style.opacity = 1;
  //countriesContainer.textContent = ``;
};

const showCityOnBtn = function (city, country) {
  btn.textContent = `You are in ${city}, ${country} 🤩`;
  btn.style.backgroundColor = 'darkgreen';
  btn.disabled = true;
  //btn.style.cursor = none;
  form.style.opacity = 1;
};

const noNeighbour = function () {
  const html = `<article class="no-neighbour">
    <img class="country__img" src = "img/flag.jpg" alt="No Neighbour Country Found😅" />
    <div class="country__data">
      <h3 class="country__name">---</h3>
      <h4 class="country__region">---</h4>
      <p class="country__row"><span>👫</span>---</p>
      <p class="country__row"><span>🗣️</span>---</p>
      <p class="country__row"><span>💰</span>---</p>
    </div>
  </article>`;

  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
};

//using geo location
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    // navigator.geolocation.getCurrentPosition(
    //   position => resolve(position),
    //   err => reject(err)
    // );
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
//using async - await
const whereAmI = async function () {
  //get geolocation
  try {
    countriesContainer.textContent = ``;
    const position = await getPosition();
    const { latitude: lat, longitude: lng } = position.coords;

    //reverse geoCoding
    const geoData = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);

    if (!geoData.ok)
      throw new Error(`Problem with geocoding ${geoData.status}`);
    const readData = await geoData.json();

    //fetch country
    showCityOnBtn(readData.city, readData.country);
    //console.log(`You are in ${data.city}, ${data.country}`);

    const getCountryName = await fetch(
      `https://restcountries.eu/rest/v2/name/${readData.country}`
    );

    if (!getCountryName.ok)
      throw new Error(`Country not found (${getCountryName.status})`);

    const readDataAgn = await getCountryName.json();

    //display country and neighbour
    showCountry(readDataAgn[readDataAgn.length - 1]);
    const neighbour = readDataAgn[readDataAgn.length - 1].borders[0];

    if (!neighbour) {
      noNeighbour();
      return;
    }

    //country 2
    const neighbourCountry = await fetch(
      `https://restcountries.eu/rest/v2/alpha/${neighbour}`
    ); //the fulfilled value of the promise is the value that returned from the .then() method

    const readD = await neighbourCountry.json(); //for handling returned fetched API
    showCountry(readD, 'neighbour');
  } catch (err) {
    displayError(
      `Something went wrong ☹ ${err.message} ! Try again after few minutes:D`
    );
  }
};

//using country
const getCountry = async function (countryName) {
  try {
    countriesContainer.textContent = ``;
    //country 1
    const countryByName = await fetch(
      `https://restcountries.eu/rest/v2/name/${countryName}`
    );

    //creating error manually for 404 status code
    if (!countryByName.ok)
      throw new Error(`Country not found (${countryByName.status})`);
    const data = await countryByName.json(); // return another promise as .json() is also asynchronous typ

    showCountry(data[data.length - 1]);
    const neighbour = data[data.length - 1].borders[0];

    if (!neighbour) {
      noNeighbour();
      return;
    }

    //country 2
    const neighbourC = await fetch(
      `https://restcountries.eu/rest/v2/alpha/${neighbour}`
    ); //the fulfilled value of the promise is the value that returned from the .then() method

    const data1 = await neighbourC.json(); //foe handling returned fetched API
    showCountry(data1, 'neighbour');
  } catch (err) {
    displayError(
      `Something went wrong ☹ ${err.message} ! Try again after few minutes:D`
    );
  }
};

btn.addEventListener('click', whereAmI);
searchBtn.addEventListener('click', function (event) {
  event.preventDefault();
  const countryName = inputCountry.value;
  getCountry(countryName);
  inputCountry.value = '';
});
