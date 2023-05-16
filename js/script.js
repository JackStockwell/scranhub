var keyAPI = "AIzaSyD0LvDbL349Bf8FNEras65YzLL6M_p-Cgc"

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

function locationSearch(event) {
    event.preventDefault()
    if (locationElement.value === "") {
        var invalidPara = document.querySelector('#error-msg')
        invalidPara.innerHTML = "Please enter a location!"
        setTimeout(() => {
            invalidPara.innerHTML = ""
        }, 3000)
    }
}

function locationFinder(location) {
    var apiURL = `https://maps.googleapis.com/maps/api/geocode/json?&address=4+eastern+boulevard+southend&key=${keyAPI}`
    console.log(apiURL)
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })

}

window.initMap = initMap;``