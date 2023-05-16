

let map;
// initMap is now async
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

window.initMap = initMap;