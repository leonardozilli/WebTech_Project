var globe,
  globeCount = 0;

var globeData = true;

function createGlobe() {
  var newData = [];
  globeCount++;
  $("#article-map canvas").remove();
  if (globeData) {
    newData = data.slice();
  }

  globe = new ENCOM.Globe(window.innerWidth, window.innerHeight, {
    font: "Inconsolata",
    data: newData, // copy the data array
    tiles: grid.tiles,
    baseColor: "#ffcc00",
    markerColor: "#ffcc00",
    pinColor: "#8FD8D8",
    satelliteColor: "#ff0000",
    scale: 1.0,
    dayLength: 1000 * 28,
    introLinesDuration: 2000,
    maxPins: 500,
    maxMarkers: 4,
    viewAngle: 0.1,
  });

  $(".article-map").append(globe.domElement);
  globe.init(start);
}

function onWindowResize() {
  globe.camera.aspect = window.innerWidth / window.innerHeight;
  globe.camera.updateProjectionMatrix();
  globe.renderer.setSize(window.innerWidth, window.innerHeight);
}

function roundNumber(num) {
  return Math.round(num * 100) / 100;
}

function projectionToLatLng(width, height, x, y) {
  return {
    lat: 90 - 180 * (y / height),
    lon: 360 * (x / width) - 180,
  };
}

function animate() {
  if (globe) {
    globe.tick();
  }

  lastTickTime = Date.now();

  requestAnimationFrame(animate);
}

function start() {
  if (globeCount == 1) {
    // only do this for the first globe that's created. very messy
    $("#apply-button").click(function (e) {
      globe.destroy(function () {
        createGlobe();
      });
    });
    $(".projection").click(function (e) {
      var offset = $(this).offset();
      var latLon = projectionToLatLng(
        $(".projection").width(),
        $(".projection").height(),
        e.clientX - offset.left,
        e.clientY - offset.top
      );

      var selectedId = $("#add-element .selected").attr("id");

      if (selectedId == "add-pin") {
        globe.addPin(latLon.lat, latLon.lon, "User Dropped Pin");
      } else if (selectedId == "add-marker") {
        globe.addMarker(latLon.lat, latLon.lon, "User Marker", true);
      } else if (selectedId == "add-satellite") {
        var opts = {
          coreColor: "#ff0000",
          numWaves: 8,
        };
        globe.addSatellite(
          latLon.lat,
          latLon.lon,
          1.3,
          opts
        );
      }
    });

    $("#add-element li").click(function (e) {
      $("#add-element li").removeClass("selected");
      $(e.currentTarget).addClass("selected");
    });

    animate();

    /* add pins at random locations */
    setInterval(function () {
      if (!globe || !globeData) {
        return;
      }

      var lat = Math.random() * 180 - 90,
        lon = Math.random() * 360 - 180,
        name = "Test " + Math.floor(Math.random() * 100);

      globe.addPin(lat, lon, name);
    }, 5000);
  }

  /* add 6 satellites in random locations */

  if (globeData) {
    setTimeout(function () {
      var constellation = [];
      var opts = {
        coreColor: "#ff0000",
        numWaves: 8,
      };
      var alt = 1.3;

      for (var i = 0; i < 2; i++) {
        for (var j = 0; j < 3; j++) {
          constellation.push({
            lat: 50 * i - 30 + 15 * Math.random(),
            lon: 120 * j - 120 + 30 * i,
            altitude: alt,
          });
        }
      }

      globe.addConstellation(constellation, opts);
    }, 4000);

    /* add the connected points that are in the movie */
    setTimeout(function () {
      globe.addMarker(49.25, -123.1, "Vancouver");
      globe.addMarker(35.6895, 129.69171, "Tokyo", true);
    }, 2000);
  }
}

export function initializeGlobe() {
  var open = false;

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage({
      parent: document.getElementById("metadata-upper"),
    });
    return;
  }

  window.addEventListener("resize", onWindowResize, false);

  var docHeight = $(document).height();
  WebFontConfig = {
    google: {
      families: ["Inconsolata"],
    },
    active: function () {
      createGlobe();
    },
  };

  /* Webgl stuff */

  /* web font stuff*/
  var wf = document.createElement("script");
  wf.src =
    ("https:" == document.location.protocol ? "https" : "http") +
    "://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js";
  wf.type = "text/javascript";
  wf.async = "true";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(wf, s);
};
