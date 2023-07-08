function map() {
    var map = L.map('map').setView([44.49, 11.34], 13);
    var marker = L.marker([44.493, 11.36]).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

$( document ).ready(function (){

    map();
})