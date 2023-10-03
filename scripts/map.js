function map() {
    var map = L.map('map').setView([30, 0], 2);
    var marker = L.marker([44.493, 11.36]).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

function mapbox() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw',
        center: [0, 30],
        zoom: 1,
        attributionControl: false
    });

    new mapboxgl.Marker()
        .setLngLat([11.36, 44.493])
        .addTo(map);
}


$( document ).ready(function (){
    mapbox();
})