// Map creation
let map;

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
        })

}

window.initMap = initMap;``