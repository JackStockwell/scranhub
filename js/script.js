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
      .then(response => response.json())
      .then(data => {

        if (data.status !== "OK") {
            return;
        } else {
            console.log(data)
            var location = data.results[0].geometry.location
            var address = data.results[0].formatted_address
            locationMarker(location, address)
            map.panTo(location);
            nearbyPlaces(location, tags)
        }})
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
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[0]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`),
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[1]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`),
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[2]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`),
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[3]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`),
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[4]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`),
            fetch(`https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?&place_id=${arrayID[5]}&fields=geometry,name,formatted_address,type,rating,price_level,website,photo,reviews,opening_hours&key=${keyAPI}`)
        ]);
        const data = await Promise.all(result.map(response => response.json()))
        // console.log(data)
        return data;
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

  let arrayID = [];

  const topSix = locationObject.results.slice(0, 6);

  for (let i = 0; i < topSix.length; i++) {
    const place = topSix[i];
    const cardContent = `
        <h1>${place.name}</h1>
        <p>${place.vicinity}</p>
        <p>Price Level: ${place.price_level || "N/A"}</p>
        <p>Rating: ${place.rating || "N/A"}</p>
        <a href="${place.website}" target="_blank">Website</a>
      `;
    let newResult = document.createElement("article");
    newResult.classList.add("result-card");
    newResult.innerHTML = cardContent;
    resultsElement.appendChild(newResult);

    arrayID.push(place.place_id);
  }
}
console.log(arrayID);
fetchDetails(arrayID).then((data) => {
  // Local places infomation.
  const results = data;
  console.log(results);

  for (x = 0; x < results.length; x++) {
    locationMarker(results[x].result.geometry.location, results[x].result.name);


                const cardContent =

                `
                <h3>${results[x].result.name}</h3>
                <p></p>
                `
              
                let newResult = document.createElement('article')
                newResult.classList.add('result-card')
                newResult.innerHTML = cardContent
        
                resultsElement.appendChild(newResult)    

            }
        })


    console.log(resultsElement)
}

// fUNCTION working on local storage
const storedResults = JSON.parse(localStorage.getItem('recentResults'));

if (storedResults != null) {
  arrayID.push(...storedResults)
}

function saveRecentResults(location) {

    const location = locationElement.value
    const index = searchedLocations.indexOf(location)

    if (index === -1) {
      arrayID.push(location);
      localStorage.setItem('recentResults' , JSON.stringify(arrayID));
    }

}

// Query Selectors
const locationElement = document.querySelector("#location");
const keywordsElement = document.querySelector("#cuisine");

function locationGet(event) {
    event.preventDefault()
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((data) => {
            console.log(data)
            locationElement.value = `${data.coords.latitude} ${data.coords.longitude} `
        })
    } else {

    }
}

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
