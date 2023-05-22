// Map creation
let map;

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

function locationMarker(latlng, name) {
  const myLatLng = latlng;

  const marker = new google.maps.Marker({
    position: myLatLng,
    title: `${name}`,
  });

  const contentInfo = `
    <div id="content">
        <h3>${name}</h3>
        <p></p>
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

function locationFinder(location, tags) {
  var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=${location}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      var location = data.results[0].geometry.location;
      locationMarker(location, map);
      map.panTo(location);
      nearbyPlaces(location, tags);
    });
}

function nearbyPlaces(input, tags) {
  const lat = input.lat;
  const lng = input.lng;
  var keywords = tags;

  var apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat}%2C${input.lng}&radius=1500&keyword=${keywords}&key=${keyAPI}`;
  console.log(apiURL);
  fetch(apiURL)
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
    });
}

async function fetchDetails(arrayID) {
  try {
    const result = await Promise.all([
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[0]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[1]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[2]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[3]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[4]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
      fetch(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[5]}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`
      ),
    ]);
    const data = await Promise.all(result.map((response) => response.json()));
    // console.log(data)
    return data;
  } catch {
    throw Error("Failed to load API, please refresh and try again.");
  }
}

// Query Selector for the results tab.

const resultsElement = document.getElementById("results");

async function renderData(locationObject) {
  resultsElement.innerHTML = "";

  console.log(locationObject);

  let arrayID = [];

  const topSix = locationObject.results.slice(0, 6);

  for (let i = 0; i < topSix.length; i++) {
    const place = topSix[i];
    const cardContent = `
        <h1>${place.name}</h1>
         <p>${place.vicinity}</p>
      `;
    let newResult = document.createElement("article");
    newResult.classList.add("result-card");
    newResult.innerHTML = cardContent;
    resultsElement.appendChild(newResult);
  }

  console.log(arrayID);
  fetchDetails(arrayID).then((data) => {
    const results = data;
    console.log(results);
  });
}

// for (let i = 0; i < topSix.length; i++) {

//     let placeID = topSix[i].place_id

//     console.log(placeID)

//     const apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${placeID}&fields=name,formatted_address,type,editorial_summary,reviews,opening_hours&key=${keyAPI}`

//     fetch(apiURL)
//         .then(response => response.json)
//         .then(data => {

//             console.log(data)
//             // const cardContent =

//             // `
//             // <h3>${places[i].name}</h3>
//             // <p>Lorem</p>
//             // `
//             // let newResult = document.createElement('article')
//             // newResult.classList.add('result-card')
//             // newResult.innerHTML = cardContent

//             // resultsElement.appendChild(newResult)

//             // locationMarker(places[i].geometry.location, data.name)
//         })

// }
console.log(resultsElement);

// Query Selectors
const locationElement = document.querySelector("#location");
const keywordsElement = document.querySelector("#cuisine");

function locationSearch(event) {
  event.preventDefault();
  var location = locationElement.value;
  var tags = keywordsElement.value;
  console.log(tags);
  if (!location || !tags) {
    var invalidPara = document.querySelector("#error-msg");
    invalidPara.innerHTML = "Please enter a location or search term!";
    setTimeout(() => {
      invalidPara.innerHTML = "";
    }, 3000);
  } else {
    locationFinder(location, tags);
  }
}

window.initMap = initMap;
