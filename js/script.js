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



var locationElement = document.querySelector('#location')

function newSearch (event) {
    event.preventDefault()
    locationSearch(locationElement.value)
}

function locationSearch(value) {

    if (value === "") {
        var invalidPara = document.querySelector('#error-msg')
        invalidPara.innerHTML = "Please enter a location!"
        setTimeout(() => {
            invalidPara.innerHTML = ""
        }, 3000)
    } else {
        locationFinder(value)
    }
}

function locationFinder(location) {
    var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=${location}&key=${keyAPI}`
    console.log(apiURL)
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            var location = data.results[0].geometry.location
            setMarker(location, map)
        })

}

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
    places(myLatLng)
  }


function places(input) {
    const lat = input.lat
    const lng = input.lng
    var apiURL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.lat}%2C${input.lng}&radius=1500&keyword=restaurant&key=${keyAPI}`
    console.log(apiURL)
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
}

window.initMap = initMap;