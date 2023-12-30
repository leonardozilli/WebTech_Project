import createGlobe from 'https://cdn.skypack.dev/cobe'

let phi = 0
let canvas = document.createElement("canvas")
canvas.setAttribute('width', '2000');
canvas.setAttribute('height', '2000');
canvas.style.width = '50vw';
canvas.style.height = '80vh';

$("#article-map").replaceWith(canvas)

const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: 2500,
  height: 2500,
  phi: 1,
  theta: 0,
  dark: 1,
  diffuse: 1.2,
  scale: 1,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [1, 1, 1],
  markerColor: [1, 0.5, 1],
  glowColor: [1, 1, 1],
  offset: [0, 0],
  markers: [
    { location: [37.7595, -122.4367], size: 0.03 },
    { location: [40.7128, -74.006], size: 0.1 },
  ],
  onRender: (state) => {
    // Called on every animation frame.
    // `state` will be an empty object, return updated params.
    state.phi = phi
    phi += 0.00
  },
})