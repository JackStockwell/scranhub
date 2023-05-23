// Map creation
let map;
let arrayID = []
let recentResults = []

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

// Places the marker on the map for all to see!

function locationMarker(placeObj) {

  // Gets the relevant infomation from the object parsed to create a map.
  const myLatLng = placeObj.geometry.location;
  let address = placeObj.formatted_address;
  let name = placeObj.name

  // Used when the standard placeObj isn't parsed, geolocation does return a name.
  if (!name) {
    name = "Current location"
  }

  // Makes a new marker.
  const marker = new google.maps.Marker({
    position: myLatLng,
    title: placeObj.name,
  });

  // Populates the marker with content
  const contentInfo = `
    <div id="content">
        <h3>${name}</h3>
        <p>${address}</p>
    </div>
    `;

  // Populates the infowindow with the above content.
  const infoWindow = new google.maps.InfoWindow({
    content: contentInfo,
    ariaLabel: name,
  });

  // Designates the marker to the map
  marker.setMap(map);

  // Event listener to display infowindow.
  marker.addListener("click", () => {
    infoWindow.open({
      anchor: marker,
      map,
    });
  });
}

// Searches for the location given a string and returns a lat and lng of the best matched area.
// Also parses the tags, radius, min, max to be used for the function run later.
function locationFinder(location, tags, radius, min, max) {
  var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=${location}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
    .then(response => response.json())
    .then(data => {
      // Status check. Returns if not "OK"
      if (data.status !== "OK") {
        invalidPara.innerHTML = `The error message ${data.status} has occured, please enter a valid location/cusine and try again`;
        return;
      } else {
        const name = location
        const placeObj = data.results[0]
        const placeLocation = data.results[0].geometry.location
        // Runs marker command.
        locationMarker(placeObj)
        // Pan's to location 
        map.panTo(placeLocation);
        // Creates an object to parse into the function.
        const recentSearchObj = 
        {
          name: name,
          coord: placeLocation,
          tags: tags,
          radius: radius,
          min: min,
          max: max
        }
        // Runs the nearbyPlaces func
        nearbyPlaces(recentSearchObj)
      }})
}

// Takes the lat/lng, tags, radius, min and max. Queries these values to get a filtered list of nearby locations that match.
function nearbyPlaces(recentSearchObj) {

  // Added current place where user has searched and added it to local storage
  recentResults.push(recentSearchObj);
  // Stores updated results in local storage
  localStorage.setItem('recentResults', JSON.stringify(recentResults))
  // Refreshes the list.

  var apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${recentSearchObj.coord.lat}%2C${recentSearchObj.coord.lng}&maxprice=${recentSearchObj.max}&minprice=${recentSearchObj.min}&radius=${recentSearchObj.radius}&keyword=${recentSearchObj.tags}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    });
}

// Completes a fetch for each value from array parsed into it, will not return until it is complete as it is a promise.
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

// Renders the results on screen.
async function renderData(locationObject) {
  // Clears previous cards if there are any.
  resultsElement.innerHTML = "";
  // Empty array for fetchDetails
  const arrayID = [];
  // Only displays 9 or fewer results.
  const slicedResults = locationObject.results.slice(0, 9);
  // Pushes the IDs into the array, for the fetchDetils async func.
  for (let i = 0; i < slicedResults.length; i++) {
    let placeID = slicedResults[i].place_id;
    arrayID.push(placeID);
  }
  // A small function to display the rating in stars.
  function renderRating(rate) {
    let star = "&#9733 "

    for (let i = 0; i <= 5; i++) {
      if (i === rate) {
        star = star.repeat(i)
        return star;
      }
    }
  }
  // A small function to display the price in pound signs.
  function renderPrice(price) {
    let pound = "&pound "

    for (let i = 0; i <= 4; i++) {
      if (i === price) {
        pound = pound.repeat(i)
        return pound;
      }
    }
  }
  // The main bulk of renderDetails func, will render the results on the page.
  fetchDetails(arrayID)
    .then(data => {
    // Local places infomation.
    const results = data
    console.log(results)
    // This allows to get the results and store it within local storage
    const storedResults = JSON.parse(localStorage.getItem('recentResults')) || [];
    
    for (let x = 0; x < results.length; x++) {
      const resultObj = results[x].result;
      let imageRef = resultObj.photos[0].photo_reference;

      locationMarker(resultObj);

      let imgAPI = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=300&photo_reference=${imageRef}&key=${keyAPI}`

      if (!imageRef) {
        let imgAPI = `https://placehold.co/300x300`
      }

      const cardContent =
        `
        <h3>${resultObj.name}</h3>
        <div class="result-content">
          <img class="result-img" src="${imgAPI}">
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
      console.log(cardContent)
      let newResult = document.createElement('article');
      newResult.classList.add('result-card');
      newResult.innerHTML = cardContent;
      resultsElement.appendChild(newResult)
    }


  });
}

// Loads the recentsearches from Local Storage.
function loadRecentSearches() {
  const storedResults = JSON.parse(localStorage.getItem('recentResults'));

  // Checks to see if there is any localstorage.
  if (storedResults) {
    recentResults = storedResults;
  } else {
    return;
  }
}

//Query Selector for result list
const resultList = document.querySelector(".result-list");

// Renders the list in HTML
function renderList() {
  // Loads the recentResults from localstorage.
  loadRecentSearches()
  // Clears the list.
  resultList.innerHTML =""
  // Gets the latest result from the array.
  let recentValue = recentResults.splice(-1)
  console.log(recentValue)
  // To add the results and display it with text
  const listElement = document.createElement('li');
  const name = recentValue[0].name

  listElement.textContent = name;
  listElement.classList.add('button')
  resultList.appendChild(listElement)

  listElement.addEventListener('click', () => {
    console.log(recentValue)
    nearbyPlaces(recentValue[0])
  })

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

// Slider attributes, automatically updates the value on the page.

const output = document.querySelector(".range-update");

output.innerHTML = radiusElement.value

radiusElement.oninput = function() {
  output.innerHTML = this.value
}
output.innerHTML = `${radiusElement.value}m`;

// Grabs the location specified to ensuring all fields have been inputted 
function locationSearch(event) {
  event.preventDefault();
  // Renders the list.
  renderList()
  // Reloads the map.
  initMap();
  // Retrieves the values needed to conduct the search.
  const location = locationElement.value;
  const tags = keywordsElement.value;
  const radius = radiusElement.value;
  const minPrice = minPriceElement.value;
  const maxPrice = maxPriceElement.value;

  console.log(radius);
  if (!location || !tags) {
    invalidPara.innerHTML = "Please enter a location or search term!";
    setTimeout(() => {
      invalidPara.innerHTML = "";
    }, 3000);
  } else {
    locationFinder(location, tags, radius, minPrice, maxPrice);
  }
}

renderList();