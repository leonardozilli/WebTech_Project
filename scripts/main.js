
function changeStyle(style) {
  const selector = $(".style-selector-container");

  if ($("#style").attr("href").includes(style)) {
    selector.fadeOut(600);
    writeStyleInCookie(style);
  } else {
    $("#style").attr("href", "./styles/" + style);
    writeStyleInCookie(style);
    setTimeout(() => {
      selector.fadeOut(500);
    }, 500);
  }
}

function writeStyleInCookie(style) {
  const expirationDate = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  );
  document.cookie =
    "style=" + style + "; expires=" + expirationDate + "; path=/";
}

function getStyleCookie() {
  const name = "style=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function mapbox(style) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw";

    const mapConfigs = {
    "1500-article.css": {
        container: "map",
        style: "mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw",
        projection: "mercator",
        center: [0, 30],
        zoom: 1.1,
        attributionControl: false,
    },
    "90s-article.css": {
        container: "map",
        style: "mapbox://styles/lzill/clrak0xgs006r01qq8w9m0bow",
        projection: "globe",
        zoom: 0,
        center: [90, 30],
        minZoom: 2,
        maxZoom: 2,
        attributionControl: false,
    },
    };

  var map = new mapboxgl.Map(mapConfigs[getStyleCookie()]);

  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

  map.on("idle", function () {
    map.resize();
  });

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      return new Promise((resolve) => {
        timer = setTimeout(() => {
          resolve(func.apply(this, args));
        }, timeout);
      });
    };
  }

  const debounceClickHandler = debounce((map, event) => {
    return new Promise((resolve) => {
      const features = map.queryRenderedFeatures(event.point);
      const filteredFeatures = features.filter(
        (feature) => feature.id === undefined
      );

      let selectedFeature;
      if (filteredFeatures.length === 1) {
        selectedFeature = filteredFeatures[0];
      } else if (filteredFeatures.length > 1) {
        selectedFeature = filteredFeatures.find(
          (feature) => JSON.parse(feature.properties.classes)[2] === "state"
        );
      }

      resolve(selectedFeature ? selectedFeature.source : null);
    });
  }, 10);

  map.on("load", () => {
    $.ajax({
      url: geojsonUrl,
      dataType: "json",
      success: (data) => {
        for (const feature of data.features) {
          if (feature.geometry) {
            if (feature.geometry.type === "Point") {
              const el = document.createElement("div");
              el.className = "marker " + feature.properties.classes[2];
              el.id = feature.properties.id;
              var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                feature.properties.name
              );
              var marker = new ClickableMarker(el)
                .setLngLat([
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ])
                .setPopup(popup)
                .addTo(map);
              (function (marker, el) {
                el.addEventListener("mouseenter", () => marker.togglePopup());
                el.addEventListener("mouseleave", () => marker.togglePopup());
                el.addEventListener("click", (e) => {
                  e.stopPropagation();
                  goto(el.id);
                });
              })(marker, el);
            } else if (
              feature.geometry.type === "Polygon" ||
              feature.geometry.type == "MultiPolygon"
            ) {
              const layerId = feature.properties.id;

              map.addSource(layerId, {
                type: "geojson",
                data: feature,
              });

              map.addLayer({
                id: layerId,
                type: "fill",
                source: layerId,
                paint: {
                  "fill-color": "rgba(132, 128, 107, 0.3)",
                },
              });

              map.on("click", layerId, async (event) => {
                const clicked_layer = await debounceClickHandler(map, event);
                goto(clicked_layer);
              });

              map.on("mouseenter", layerId, () => {
                map.getCanvas().style.cursor = "pointer";
              });

              map.on("mouseleave", layerId, () => {
                map.getCanvas().style.cursor = "";
              });
            }
          }
        }
      },
      error: (error) => {
        console.error("Error loading GeoJSON file:", error);
      },
    });
  });

  map.fitBounds(map.getBounds());
}

$("#disclaimer-button").on("click", function (e) {
  $(".disclaimer-container").load("components/disclaimer.html", function () {
    $("#modal-close").on("click", function (e) {
      $(".disclaimer-container, .modal-content").fadeOut(500);
    });
  });
  $(".modal-content").fadeIn(500);
  $(".disclaimer-container").css("display", "flex").addClass("visible").hide().fadeIn(500);
});

$(document).on("click", "#change-style-button", function (e) {
  $(".style-selector-container").fadeIn(500);
  $(".style-selector-content").delay(900).fadeIn(500);
});

$(document).on("click", "#disclaimer-button", function (e) {
  $(".disclaimer-container").load("components/disclaimer.html", function () {
    $("#modal-close").on("click", function (e) {
      $(".disclaimer-container, .modal-content").fadeOut(500);
    });
  });
  $(".modal-content").fadeIn(500);
  $(".disclaimer-container")
    .css("display", "flex")
    .addClass("visible")
    .hide()
    .fadeIn(500);
});

function populateLists() {
$.getJSON("./issues/issuesDB.json", function (objson) {
    const articleList = $("#articleList");
    const issueList = $("#issueList");

    objson.issues.forEach((issue) => {
    issueList.append(
        "<li><a href='issues/" +
        issue.number +
        "/'>" +
        issue.number +
        "</a></li>"
    );
    issue.articles.forEach((article) => {
        console.log(article);
        const articleTitle = article.filename.replace(".html", "");
        articleList.append(
        "<li><a href='read.html?issue=" +
            issue.number +
            "&article=" +
            article.number +
            "-" +
            article.filename.replace(".html", "") +
            "'>" +
            article.title +
            "</a></li>"
        );
    });
    });
}).fail(function () {
    console.log("Get from issuesDB: an error has occurred.");
});
}

$(document).ready(function () {
  $("main").prepend(
    '<div class="style-selector-container" style="display: none;"></div>'
  );
  $(".style-selector-container").load("components/style-selector.html");

  if (getStyleCookie() === null) {
    $(".style-selector-container").show();
  } else {
    changeStyle(getStyleCookie());
  }
  populateLists();
});
