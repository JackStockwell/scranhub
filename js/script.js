// Map creation
var map;

// Map initialiser
function initMap() {

    var options = {
        zoom: 8,
        center: {
            lat: 51.5072,
            lng: -0.1276,
        }
    }
    map = new google.maps.Map(document.getElementById("map"), options)
};

function setMarker(value) {
    const myLatLng = value;
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: myLatLng,
    });
    new google.maps.Marker({
      position: myLatLng,
      map,
      title: "Hello World!",
    });
    map.panTo(value);
  }

function locationFinder(location, tags) {
    var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=${location}&key=${keyAPI}`
    console.log(apiURL)
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            var location = data.results[0].geometry.location
            setMarker(location, map)
            places(location, tags)
        })

}

// Query Selector for the results tab.

const resultsElement = document.getElementById('results')

function renderData(data) {
    
    const places = data.results.slice(0, 12)

    console.log(places)
    
    for (let i = 0; i < places.length; i++) {

        const cardContent = 
        `
        <h3>${places[i].name}</h3>
        <p>Lorem</p>
        `
        let newResult = document.createElement('article')
        newResult.classList.add('result-card')
        newResult.innerHTML = cardContent

        console.log(resultsElement)
        resultsElement.appendChild(newResult)
    }
}

function places(input, tags) {
    const lat = input.lat
    const lng = input.lng
    console.log(lat)
    var keywords = tags
    console.log(keywords)
    var apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat}%2C${input.lng}&radius=1500&keyword=${keywords}&key=${keyAPI}`
    console.log(apiURL)
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            renderData(data)
        })
}

// Query Selectors
const locationElement = document.querySelector('#location')
const keywordsElement = document.querySelector('#cuisine')

function locationSearch(event) {
    event.preventDefault()
    var location = locationElement.value
    var tags = keywordsElement.value
    console.log(tags)
    if (!location || !tags) {
        var invalidPara = document.querySelector('#error-msg')
        invalidPara.innerHTML = "Please enter a location or search term!"
        setTimeout(() => {
            invalidPara.innerHTML = ""
        }, 3000)
    } else {
        locationFinder(location, tags)
    }
}

window.initMap = initMap;