
function changeStyle(style) {
  const selector = $(".style-selector-container");

  if ($("#style").attr("href").includes(style)) {
    selector.fadeOut(600);
    writeStyleInCookie(style);
  } else {
    $("#style").attr("href", "./styles/" + style);
    writeStyleInCookie(style);
    mapbox(style)
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
  $("#map").empty();
  mapboxgl.accessToken =
    "pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw";

  const mapConfigs = {
    "1500.css": {
      container: document.getElementById("map"),
      style: "mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw",
      projection: "mercator",
      center: [0, 30],
      zoom: 1.1,
      attributionControl: false,
    },
    "90s.css": {
      container: document.getElementById("map"),
      style: "mapbox://styles/lzill/clrak0xgs006r01qq8w9m0bow",
      projection: "globe",
      zoom: 0,
      center: [90, 30],
      minZoom: 2,
      attributionControl: false,
    },
    "pulp.css": {
      container: document.getElementById("map"),
      style: "mapbox://styles/itisdone/clrjfeik700pc01pdc9zj7zzr",
      projection: "mercator",
      zoom: 0,
      center: [90, 30],
      minZoom: 2,
      maxZoom: 2,
      attributionControl: false,
    },
    "future.css": {
      container: document.getElementById("map"),
      style: "mapbox://styles/itisdone/clrorcpit007z01pn4cwvb2vc",
      projection: "globe",
      zoom: 0,
      center: [90, 30],
      minZoom: 1,
      attributionControl: false,
    },
  };

  var map = new mapboxgl.Map(mapConfigs[style]);

  map.on("load", function () {
    map.resize();
    $.ajax({
      url: "issues/issuesDB.json",
      dataType: "json",
      success: (data) => {
        for (const issue of data.issues) {
          issueNumber = issue.number;
          for (const article of issue.articles) {
            const geojsonUrl =
              issueNumber === "docs"
                ? "issues/docs/documentation.geojson"
                : `issues/${issueNumber}/${article.number}/` +
                  article.filename.replace(".html", ".geojson");
            $.ajax({
              url: geojsonUrl,
              dataType: "json",
              success: (geodata) => {
                var macrodata = $.ajax({
                  url: 'issues/macro.geojson',
                  async: false,
                  dataType: "json",
                }).responseJSON;
                for (const feature of geodata.features) {
                  if (feature.geometry) {
                    if (feature.geometry.type === "Point") {
                      var el = document.createElement("div");
                      el.className = "marker " + feature.properties.classes[2];
                      el.id = feature.properties.id;

                      var popupList = '';
                      for (const x of macrodata[el.id]['articles']){
                        issueidx = x.issue - 1;
                        articleidx = x.article- 1;
                        url = x.article === 'docs' ? `read.html?issue=docs&article=documentation` : `read.html?issue=${x.issue}&article=${x.article}-${data.issues[issueidx].articles[articleidx].filename.replace(".html", "")}`;
                        popupList += `<li><a href="${url}">${x.article === 'docs' ? 'Documentation' : data.issues[issueidx].articles[articleidx].title}</a></li>`;
                      }

                      popupContent = `<h3>${
                        feature.properties.name
                      }</h3><p>Appears in the following articles:</p><ul class="marker-articles-list" id="${
                        el.id
                      }">${popupList}</ul>`;

                      var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                        popupContent
                      );
                      var marker = new mapboxgl.Marker(el)
                        .setLngLat([
                          feature.geometry.coordinates[1],
                          feature.geometry.coordinates[0],
                        ])
                        .setPopup(popup)
                        .addTo(map);

                      (function (marker, el) {
                        el.addEventListener("click", (e) => {
                          marker.togglePopup();
                          e.stopPropagation();
                        });
                      })(marker, el);
                    } else if (
                      feature.geometry.type === "Polygon" ||
                      feature.geometry.type == "MultiPolygon"
                    ) {
                      const layerId = feature.properties.id;
                      try {
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
                        map.on("mouseenter", layerId, () => {
                          map.getCanvas().style.cursor = "pointer";
                        });

                        map.on("mouseleave", layerId, () => {
                          map.getCanvas().style.cursor = "";
                        });
                        map.on("click", layerId, async (e) => {
                          popupContent = `<h3>${
                            e.features[0].properties.name
                          }</h3><p>Appears in the following articles:</p><ul class="marker-articles-list" id="${
                            el.id
                          }"><li><a href="read.html?issue=${issueNumber}&article=${
                            article.number
                          }-${article.filename.replace(".html", "")}">${
                            article.title
                          }</a></li></ul>`;
                          await debounceClickHandler(map, e);
                          new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(popupContent)
                            .addTo(map);
                        });
                      } catch (e) {}
                    }
                  }
                }
              },
              error: (error) => {
                console.error("Error loading GeoJSON file:", error);
              },
            });
          }
        }
      },
      error: (error) => {
        console.error("Error loading issuesDB json file:", error);
      },
    });
  });

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
    $.getJSON("issues/issuesDB.json", function (objson) {
        const issueList = $("#issue-dropdown");

        objson.issues.forEach((issue) => {
            if (issue.number !== "docs") {
                const issueItem = $("<li class='nav-item dropdown'></li>");
                const issueLink = $(
                    "<a class='nav-link dropdown-toggle' role='button' data-bs-toggle='dropdown' aria-expanded='false'></a>"
                ).text(issue.title);
                const articleList = $("<ul class='dropdown-menu dropdown-submenu article-dropdown'></ul>");

                issue.articles.forEach((article) => {
                    const articleItem = $("<li></li>");
                    const articleLink = $(
                        "<a class='dropdown-item' href='read.html?issue=" +
                        issue.number +
                        "&article=" +
                        article.number +
                        "-" +
                        article.filename.replace(".html", "") +
                        "'></a>"
                    ).text(article.title);
                    articleItem.append(articleLink);
                    articleList.append(articleItem);
                });

                issueItem.append(issueLink);
                issueItem.append(articleList);
                issueList.prepend(issueItem);
            }
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

// non funziona: creare il bottone al load e anche il video
function sizeMain() {
  const mainHome = document.querySelector('main.home');
  const currentWidth = mainHome.clientWidth;
  var heroText = document.getElementsByClassName('hero-text')[0];
  var cardContainer = document.getElementsByClassName('card-container')[0];
  var cards = document.getElementsByClassName('card');
  var sliders = document.getElementsByClassName('slider');
  var button = document.getElementsByClassName('size-slider')[0];

  mainHome.style.transition = 'width 0.5s ease';
  // non funziona: assicurati che ci sia quando si carica la pagina
  button.style.backgroundImage = "url('../img/future/decrease-size.png')";
  if (currentWidth > 760) {
    // If the width is bigger than 760px, set it to 480px
    mainHome.style.width = '479px';

    heroText.classList.add('sized');
    cardContainer.classList.add('sized');

    for (let i = 0; i < cards.length; i++){
      var card = cards[i];
      card.classList.add('sized');
    }

    for (let i = 0; i < sliders.length; i++){
      var slider = sliders[i];
      slider.classList.add('sized');
    }

    mainHome.classList.add('sized');

    button.style.backgroundImage = "url('../img/future/decrease-size.png')";


    } else if (currentWidth <= 480) {
    // If the width is 480px, set it to 100vw
    mainHome.style.width = '100vw';

    heroText.classList.remove('sized');
    cardContainer.classList.remove('sized');
    for (let i = 0; i < cards.length; i++){
      var card = cards[i];
      card.classList.remove('sized');
      }
    for (let i = 0; i < sliders.length; i++){
      var slider = sliders[i];
      slider.classList.remove('sized');
      }

    mainHome.classList.remove('sized');
    button.style.backgroundImage = "url('../img/future/increase-size.png')";
  }

}