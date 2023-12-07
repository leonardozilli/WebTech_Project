function mapbox() {
    mapboxgl.accessToken = 'pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw',
        center: [0, 30],
        zoom: 1,
        attributionControl: false,
        dragRotate: false
    });

    new mapboxgl.Marker()
        .setLngLat([11.36, 44.493])
        .addTo(map);

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
}

$( document ).ready(function (){
    mapbox();
})