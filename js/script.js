// Map creation
let map;
let arrayID = []

// Map initialiser
function initMap() {
  var options = {
    zoom: 15,
    center: {
      lat: 51.5072,
      lng: -0.1276,
    },
  };
  map = new google.maps.Map(document.getElementById("map"), options);
}

function locationMarker(placeObj) {

  const myLatLng = placeObj.geometry.location;
  let address = placeObj.formatted_address;
  let name = placeObj.name

  // Used when a standard placeObj isn't parsed due to Geolocation.
  if (!name) {
    name = "Current location"
  }

  const marker = new google.maps.Marker({
    position: myLatLng,
    title: placeObj.name,
  });

  const contentInfo = `
    <div id="content">
        <h3>${name}</h3>
        <p>${address}</p>
    </div>
    `;
  const infoWindow = new google.maps.InfoWindow({
    content: contentInfo,
    ariaLabel: name,
  });

  marker.setMap(map);

  marker.addListener("click", () => {
    infoWindow.open({
      anchor: marker,
      map,
    });
  });
}

function locationFinder(location, tags, radius, min, max) {
  var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=${location}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
      .then(response => response.json())
      .then(data => {

        if (data.status !== "OK") {
          invalidPara.innerHTML = `The error message ${data.status} has occured, please enter a valid location/cusine and try again`;
            return;
        } else {
            const placeObj = data.results[0]
            const location = data.results[0].geometry.location
            console.log(placeObj)
            locationMarker(placeObj)
            map.panTo(location);
            nearbyPlaces(location, tags, radius, min, max)
        }})
}

function nearbyPlaces(input, tags, radius, min, max) {
  const lat = input.lat;
  const lng = input.lng;
  console.log(min)
  console.log(max)

  var apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat}%2C${input.lng}&maxprice=${max}&minprice=${min}&radius=${radius}&keyword=${tags}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    });
}

async function fetchDetails(arrayID) {

  const requests = [];

  try {
    for (let i = 0; i < arrayID.length; i++) {
      const apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[i]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,place_id,opening_hours&key=${keyAPI}`
    
      requests.push(
        new Promise((resolve, reject) => {
          fetch(apiURL)
            .then((response) => response.json())
            .then((data) => {
              resolve(data)
            })
        })
      )
    }
    const result = await Promise.all(requests);

    const responseArray = result.flatMap((page) => page)
    return responseArray;
    
  } catch {
      throw Error("Failed to load API, please refresh and try again.")
  }
}

// Query Selector for the results tab.

const resultsElement = document.getElementById("results");

async function renderData(locationObject) {
  // Clears previous cards if there are any.
  resultsElement.innerHTML = "";

  console.log(locationObject);

  const arrayID = [];

  const slicedResults = locationObject.results.slice(0, 9);

  for (let i = 0; i < slicedResults.length; i++) {
    let placeID = slicedResults[i].place_id;
    arrayID.push(placeID);
  }

    function renderRating(rate) {

      let star = "&#9733 "

      for (let i = 0; i <= 5; i++) {
        if (i === rate) {
          star = star.repeat(i)
          return star;
        }
      }
    }

    function renderPrice(price) {

      let pound = "&pound "

      for (let i = 0; i <= 4; i++) {
        if (i === price) {
          pound = pound.repeat(i)
          return pound;
        }
      }
    }

    fetchDetails(arrayID)
      .then(data => {
        // Local places infomation.
        const results = data
        console.log(results);

      const storedResults = JSON.parse(localStorage.getItem('recentResults')) || []; // This allows to get the results and store it within local storage

      for (let x = 0; x < results.length; x++) {
        const resultObj = results[x].result;
        locationMarker(resultObj);
        const cardContent =
          `
          <h3>${resultObj.name}</h3>
          <div class="result-content">
            <img class="result-img" src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${resultObj.photos[0].photo_reference}&key=${keyAPI}">
            <div class="result-content-info">
              <a href="https://www.google.com/maps/dir/?api=1&origin=${locationElement.value}&destination=${resultObj.formatted_address}&destination_place_id=${resultObj.place_id}" target="_blank">Directions <i class="fa-solid fa-route"></i></a>
              <a href="${resultObj.website}" target="_blank">Website <i class="fa-solid fa-globe"></i></a>
              <p>Price Level: <span class="rating">${(renderPrice(resultObj.price_level) || "N/A")}</span></p>
              <p>Rating: <span class="rating">${resultObj.rating || "N/A"}</span></p>
              <div class="result-review">
                <p>${resultObj.reviews[0].text}</p>
                <i>- ${resultObj.reviews[0].author_name} ${(renderRating(resultObj.reviews[0].rating))}</i> 
              </div>
              </div>
          </div>
          `

          storedResults.push(resultObj); // Added current place where user has searched and added it to local storage

          let newResult = document.createElement('article');
          newResult.classList.add('result-card');
          newResult.innerHTML = cardContent;

          resultsElement.appendChild(newResult);
      }

      localStorage.setItem('recentResults', JSON.stringify(storedResults)); // Stores updated results in local storage
    });
}


// Query Selectors
const locationElement = document.querySelector("#location");
const keywordsElement = document.querySelector("#cuisine");
const radiusElement = document.querySelector('#radius')
const minPriceElement = document.querySelector('#price-min')
const maxPriceElement = document.querySelector('#price-max')
const invalidPara = document.querySelector("#error-msg");

function locationGet(event) {
    event.preventDefault()
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((data) => {
            console.log(data)
            locationElement.value = `${data.coords.latitude} ${data.coords.longitude}`
        })
    } else {

    }
}

// Slider

const output = document.querySelector(".range-update");

output.innerHTML = radiusElement.value

radiusElement.oninput = function() {
  output.innerHTML = this.value
}

output.innerHTML = `${radiusElement.value}m`;

// Grabs the location specified to ensuring all fields have been inputted 
function locationSearch(event) {
  event.preventDefault();
  // Reloads the map.
  initMap();

  const location = locationElement.value;
  const tags = keywordsElement.value;
  const radius = radiusElement.value;
  const minPrice = minPriceElement.value;
  const maxPrice = maxPriceElement.value;

  console.log(radius);
  if (!location || !tags || !radius) {
    invalidPara.innerHTML = "Please enter a location or search term!";
    setTimeout(() => {
      invalidPara.innerHTML = "";
    }, 3000);
  } else {
    locationFinder(location, tags, radius, minPrice, maxPrice);
  }
}
