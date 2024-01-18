class Article {
  constructor(element) {
    this.element = element;
    this.title = element.data("title");
    this.subtitle = element.data("subtitle");
    this.author = element.data("author");
    this.date = element.data("date");
    this.source = element.data("source");
    this.people = $("span.person[id]");
    this.organizations = $("span.organization");
    this.places = $("span.place");
    this.dates = $("span.date");
  }
}

function goto(className) {
  let elements = $(`.${className}`);

  if (getStyleCookie() === "1500.css") {
    articleContainer = $(".article-container");
    let scrollPos = articleContainer.scrollTop();
    let nextElements = elements.filter(function () {
      return $(this).offset().top > 31;
    });

    if (nextElements.length > 0 && !nextElements.first().hasClass("searched")) {
      nextElement = nextElements.first();
    } else {
      nextElement = elements.first();
      $(".searched").removeClass("searched");
    }

    articleContainer.animate(
      { scrollTop: scrollPos + nextElement.offset().top - 30 },
      1000,
      "easeOutCubic"
    );

    $(".animate").removeClass("animate");
    nextElement.addClass("animate");
    nextElement.addClass("searched");
  } else {
    let scrollPos = $(window).scrollTop();
    let nextElements = elements.filter(function () {
      return $(this).offset().top > scrollPos + 1;
    });

    if (nextElements.length > 0 && !nextElements.first().hasClass("searched")) {
      nextElement = nextElements.first();
    } else {
      nextElement = elements.first();
      $(".searched").removeClass("searched");
    }

    $([document.documentElement, document.body]).animate(
      {
        scrollTop: nextElement.offset().top,
      },
      1200
    );

    $(".animate").removeClass("animate");
    nextElement.addClass("animate");
    nextElement.addClass("searched");
  }
}

function appendMetadataToList(container, data) {
  const sortedData = data.toArray().sort((a, b) => {
    return a.id[0].localeCompare(b.id[0]);
  });

  sortedData.forEach((el) => {
    const listItem = $(
      `<li class="metadata-entry" data-wiki="${el.getAttribute('data-wiki')}" onclick="goto('${el.id}')"></li>`
    ).text(el.dataset.name);
    container.append(listItem);
  });
};



function displayMetadata(article) {
  $(".article-title").text(article.title);
  $(".article-author").text(article.author);
  $(".article-subtitle").text(article.subtitle);
  $(".article-date").text(article.date);
  $(".article-source").text("Source").attr("href", article.source);

  const populateTimeline = (dates) => {
    const datesArray = [];

    for (const element of dates) {
      const year = element.classList[element.classList.length - 1];
      const month =
        element.classList[element.classList.length - 2] !== "date"
          ? element.classList[element.classList.length - 2]
          : null;
      datesArray.push([year, month]);
    }

    uniqueDates = [...new Set(datesArray.map(JSON.stringify))]
      .map(JSON.parse)
      .sort();

    dateListContainer = $("#dateList");

    Array.from(uniqueDates).forEach(function (date) {
      const yearItem = $(
        `<ul class="date-year" id="date-year_${date[0]}"></ul>`
      );
      if ($("#date-year_" + date[0]).length == 0) {
        dateListContainer.append(yearItem);
        const yearEntry = $(
          `<li class="year-entry" id="year_entry_${date[0]}" onclick="goto('${date[0]}')">${date[0]}</li>`
        );
        yearItem.append(yearEntry);
      }

      if (date[1] !== null) {
        const monthEntry = $(
          `<li class="month-entry" id="month_entry_${date[1]}_${date[0]}" onclick="goto('${date[1]}.${date[0]}')">${date[1]}</li>`
        );
        $("#date-year_" + date[0]).append(monthEntry);
      }
    });
  };

  appendMetadataToList($("#persList"), article.people);
  //appendMetadataToList($(".orgList"), article.organizations);
  populateTimeline(
    article.dates
    //article.dates.sort((a, b) => a.id - b.id)
  );

  $(".wiki-close").on("click", function (e) {
    $(".animate").removeClass("animate");
    $(".wiki-container ").toggleClass('active');
    $(".article-map-container").toggleClass('active');
    $(".metadata-entry").removeClass("active");
    $(".wiki-text").fadeOut(300);
    $(".wiki-thumbnail").fadeOut(300);
  });

  $(document).on("click", ".metadata-entry", function (e) {
    if (!$(this).hasClass("active") && $(this).attr("data-wiki") !== "null") {
      wikiCall($(this).attr("data-wiki"));
      if (getStyleCookie() === "1500.css") {
        $(".article-map-container").removeClass('active');
      }
      $(".wiki-container").addClass('active');
      $(".metadata-entry").removeClass("active");
      $(this).toggleClass("active");
    }
  });

  $(document).on("click", ".metadata-entry[data-wiki='null']", function (e) {
    $(".wiki-container ").removeClass('active');
    $(".article-map-container").addClass('active');
    $(".metadata-entry").removeClass("active");
    $(".wiki-text").fadeOut(300);
    $(".wiki-thumbnail").fadeOut(300);
  });
}

$(document).on("click", ".metadata-tab-button", function (e) {
  if (!$(this).hasClass("active")) {
    $(".metadata-tab-button").removeClass("active");
    $(".metadata-list-container").removeClass("active");
    const tabId = $(this).attr("id").replace("-tab-button", "-tab");
    $(this).addClass("active");
    $("#" + tabId)
      .addClass("active")
      .hide()
      .fadeIn(500);
  }
});

$(document).on("click", ".style-selector-container", function (e) {
  const $target = $(e.target);
  if ($target.hasClass("style-selector-container")) {
    $(".style-selector-container").fadeOut(500);
  }
});

$(document).on("click", "span.tag:not(.date)[data-wiki]", function (e) {
  if (!$(this).hasClass("animate")) {
    $(".animate").removeClass("animate");
    this.classList.toggle("animate");
    wikiCall(this.getAttribute("data-wiki"));
    $(".metadata-entry[data-wiki='" + this.getAttribute("data-wiki") + "']").addClass("active");
    if (getStyleCookie() === "1500.css") {
      $(".article-map-container").removeClass('active');
    }
    $(".wiki-container").addClass('active');
  }
});


function buildPage() {
  /*$.get("components/header.html", function (data) {
    /*$("main").before(data);
  });*/

  $("main").prepend('<div class="loading">Loading...</div>').fadeIn(200);
  $("main").prepend(
    '<div class="style-selector-container" style="display: none;"></div>'
  );
  $(".style-selector-container").load("components/style-selector.html");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const issue = urlSearchParams.get("issue");
  var [articleNumber, article] = urlSearchParams
    .get("article")
    .split(/-(.+)/);
  
  
  if (getStyleCookie() === null) {
    $(".style-selector-container").show();
  }

  $.ajax({
    url:
      issue === "docs"
        ? `issues/${issue}/${article}.html`
        : `issues/${issue}/${articleNumber}/${article}.html`,
    dataType: "html",
    success: function (data) {
      $(".article-container").html(data);
      const articleObj = new Article($("article").first());
      document.title = `${articleObj.title}, by ${articleObj.author}`;
      displayMetadata(articleObj);
      changeStyle(getStyleCookie(), issue, articleNumber, article);
      $(".loading").fadeOut(100);
      $(".article-text, .metadata-container").animate({ opacity: 0.9 }, 700);
      $(".header-container").animate({ right: "0" }, 500);
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        var $errorContainer = $("<div>").addClass("error-container");
        $(".article-container, .metadata-container").remove();
        $("main").append($errorContainer.load("components/404.html"));
        $(".loading").fadeOut(100);
      } else {
        alert("An unexpected error occurred. Check the console for details.");
      }
    },
  });
}


function fitTitle(titleElement, style) {
  var titleHeight = titleElement.height();
  var maxHeight = $(window).height() * 0.3;
  if (style === 1500) {
    var fontSize = parseFloat(titleElement.css("font-size"));
    if (titleHeight > maxHeight) {
      titleElement.css("font-size", fontSize - 20);
      fitTitle(titleElement, 1500)
    }
  } else if (style === 90) {
    var fontSize = parseFloat(titleElement.css("font-size"));
    if (titleHeight > maxHeight) {
      titleElement.css("font-size", fontSize - 30);
      fitTitle(titleElement, 90)
    }
  }
}

function styleBoundChanges(date, geojson) {
  mapbox(geojson, getStyleCookie());
  if (getStyleCookie() === "1500.css") {
    fitTitle($(".article-title"), 1500);
    Css1990.revert1990();
    Css1500.organizeList();
    Css1500.countLines();
    Css1500.dropCaps();
    $(".article-date").text(Css1500.dateToRoman(date));
  } else if (getStyleCookie() === "90s.css") {
    fitTitle($(".article-title"), 90);
    $(".metadata-bottom").appendTo('header');
    Css1500.revert1500(date);
    Css1990.extractColor();
    Css1990.dataText();
  }
}


//wikipedia//
function wikiCall(wikiLink) {
  $(".metadata-entry").removeClass("active");
  $(".wiki-text, .wiki-thumbnail, .wiki-readmore").fadeOut(300, function () {
    $(".wiki-loading").fadeIn(200);

    var title = wikiLink.split("/wiki/")[1];
    $.ajax({
      url: "https://en.wikipedia.org/api/rest_v1/page/summary/" + title,
      dataType: "json",
      success: function (data) {
        var thumbnail = new Image();
        if (data.thumbnail && data.thumbnail.source) {
          thumbnail.src = data.thumbnail.source;
          thumbnail.onload = function () {
            $(".wiki-loading").fadeOut(200, function () {
              $(".wiki-thumbnail-container").css("display", "flex");
              $(".wiki-thumbnail-container>img")
                .attr("src", thumbnail.src)
                .fadeIn(300);
              $(".wiki-extract").html(data.extract);
              $(".wiki-text").fadeIn(300);
              $(".wiki-readmore")
                .fadeIn(300)
                .attr("href", data.content_urls.desktop.page)
                .attr("target", "_blank");
            });
          };
        } else {
          $(".wiki-loading").fadeOut(200, function () {
            $(".wiki-thumbnail-container").css("display", "none");
            $(".wiki-extract").html(data.extract);
            $(".wiki-text").fadeIn(300);
            $(".wiki-readmore")
              .fadeIn(300)
              .attr("href", data.content_urls.desktop.page)
              .attr("target", "_blank");
          });
        }
      },
    });
  });
}

//map//
class ClickableMarker extends mapboxgl.Marker {
  onClick(handleClick) {
    this._handleClick = handleClick;
    return this;
  }

  _onMapClick(e) {
    const targetElement = e.originalEvent.target;
    const element = this._element;

    if (this._handleClick && (targetElement === element || element.contains((targetElement)))) {
      this._handleClick();
    }
  }
};


function mapbox(geojsonUrl, style) {
  $(".article-map").empty();
  mapboxgl.accessToken =
    "pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw";

  const map1500 = {
    container: "article-map",
    style: "mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw",
    projection: "mercator",
    center: [0, 30],
    zoom: 1.1,
    attributionControl: false,
  };

  const map1990 = {
    container: "article-map",
    style: "mapbox://styles/lzill/clrak0xgs006r01qq8w9m0bow",
    projection: "globe",
    zoom: 0,
    center: [90, 30],
    minZoom: 2,
    maxZoom: 2,
    attributionControl: false,
  };

  var map = new mapboxgl.Map((style === "1500.css") ? map1500 : map1990);

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

//style change//
$(document).on(
  "click",
  "#change-style-button, #fab-style-button",
  function (e) {
    $(".style-selector-container").fadeIn(500);
    $(".style-selector-content").delay(900).fadeIn(500);
  }
);

function changeStyle(style, issue, articleNumber, article) {
  if (!issue) {
    article = $(".article-text");
    issue = article.data("issue");
    articleNumber = article.data("order");
    article = article.data("filename");
  } else if (issue === 'docs') {
    article = 'documentation'
  }
  const selector = $(".style-selector-container");

  if ($("#style").attr("href").includes(style)) {
    selector.fadeOut(600);
    writeStyleInCookie(style);
  } else {
    $("#style").attr("href", "./styles/" + style);
    writeStyleInCookie(style);
    styleBoundChanges($(".article-date").text(), issue === 'docs' ? `issues/${issue}/${article}.geojson` : `issues/${issue}/${articleNumber}/${article}.geojson`);
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

//floating action button//
$(".fab-icon").click(function (e) {
  e.stopPropagation();
  $(".fab-wrapper").toggleClass("active");
});

$(document).click(function (e) {
  $(".fab-wrapper").removeClass("active");
});

$("#fab-metadata-button").click(function (e) {
  if (getStyleCookie() === "90s.css") {
    $("header").toggleClass("active")

  };
  $(".metadata-container").toggleClass("active");
  $(".article-container").toggleClass("covered");
});

$(".article-container").click(function (e) {
  $("header").removeClass("active")
  $(".metadata-container").removeClass("active");
  $(".article-container").removeClass("covered");
});

//1500.css-related functions//
const Css1500 = {
  organizeList: () => {
    $(".separator").append(
      `
      <div id="holy_line1">A TABLE OF THE PRINCIPAL</div>
      <div id="holy_line2">THINGS THAT ARE CONTEINED IN THE ARTICLE, AF·</div>
      <div id="holy_line3">ter the ordre of the alphabet.</div>
      `
    );
    list = $(".metadata-list:not(#dateList)");
    items = $("#persList .metadata-entry");

    const groupedItems = {};
    items.each(function (idx, item) {
      const initial = item.textContent[0].toUpperCase();

      if (!groupedItems[initial]) {
        groupedItems[initial] = [];
      }
      groupedItems[initial].push(item);
    });

    $.each(groupedItems, function (initial, items) {
      const group = $("<ul></ul>");

      $.each(items, function () {
        group.append($(this));
      });

      const listItem = $(
        `<li class='list-block'><span class="list-block-heading">${initial}</span></li>`
      );
      listItem.append(group);
      list.append(listItem);
    });
  },

  countLines: () => {
    let articleLines = 0;
    $("article p").each(function () {
      const lineHeight = parseFloat($(this).css("line-height"));
      const height = $(this).height();
      const lines = Math.round(height / lineHeight) + 1;
      articleLines += lines;
      $(this).next("p").attr("data-lines", articleLines);
    });
  },

  dropCaps: () => {
    const firstParagraph = document.querySelector(
      ".article-text p:first-of-type"
    );
    const firstLetter = firstParagraph.textContent.trim().charAt(0);
    const remainingText = firstParagraph.innerHTML.trim().slice(1);

    firstParagraph.innerHTML = `<span class="drop-cap">${firstLetter}</span>${remainingText}`;
    document.querySelector(
      ".drop-cap"
    ).style.backgroundImage = `url(img/1500/icaps/${firstLetter.toLowerCase()}.gif)`;
  },

  dateToRoman: (num) => {
    const roman = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    };
    return num
      .split("/")
      .map((d) => parseInt(d))
      .map((d, i) =>
        Object.keys(roman).reduce((acc, key) => {
          const q = Math.floor(d / roman[key]);
          d -= q * roman[key];
          return acc + key.repeat(q);
        }, "")
      )
      .join(" ");
  },

  revert1500: (date) => {
    $('.separator').empty()

    //remove all list-blocks
    $("#persList").empty();
    appendMetadataToList($("#persList"), $("span.person[id]"));

    //drop-cap
    const firstParagraph = document.querySelector(
      ".article-text p:first-of-type"
    );

    if (firstParagraph) {
      const dropCapSpan = $(".drop-cap");
      dropCapSpan.replaceWith(dropCapSpan.html());
    }

    //line numbering
    const articleParagraphs = $("article p");
    if (articleParagraphs.length) {
      articleParagraphs.removeAttr("data-lines");
    }

    //date
    const articleDate = $(".article-date");
    if (articleDate.length) {
      articleDate.text(date);
    }
    $(".article-date").text($("article").first().data("date"));
  },

  apply1500: () => {
    Css1500.countLines();
    Css1500.dropCaps();
    $(".article-date").text(
      Css1500.dateToRoman($(".article-date").text().replace(/ /g, "/"))
    );
  },
};

const Css1990 = {
  extractColor: () => {
    const img = document.querySelector(".cover-image img");
    if (img) {
      if (img.complete) {
        var vibrant = new Vibrant(img, 32, 5);
        var swatches = vibrant.swatches();
        try {
          var color = swatches["LightVibrant"].getRgb();
          var r = document.querySelector(":root");
          r.style.setProperty("--accent-color", `rgb(${color})`);
        } catch (err) {
          var r = document.querySelector(":root");
          r.style.setProperty("--accent-color", `#f6f5ec`);
        }
      } else {
        img.addEventListener("load", function () {
          var vibrant = new Vibrant(img, 32, 5);
          var swatches = vibrant.swatches();
          try {
            var color = swatches["LightVibrant"].getRgb();
            var r = document.querySelector(":root");
            r.style.setProperty("--accent-color", `rgb(${color})`);
          } catch (err) {
            var r = document.querySelector(":root");
            r.style.setProperty("--accent-color", `#f6f5ec`);
          }
        });
      }
    } else {
      var r = document.querySelector(":root");
      r.style.setProperty("--accent-color", `#f6f5ec`);
    }
  },

  dataText: () => {
    const articleTitle = $(".article-title");
    articleTitle.attr("data-text", articleTitle.text());
    const pullQuotes = $(".pull-quote");
    pullQuotes.each(function () {
      $(this).attr("data-text", $(this).text());
    });
  },

  revert1990: () => {
    $(".metadata-bottom").insertAfter(".separator");
  },
};

$("#disclaimer-button").on("click", function (e) {
  $(".disclaimer-container").load("components/disclaimer.html", function () {
    $("#modal-close").on("click", function (e) {
      $(".disclaimer-container, .modal-content").fadeOut(500);
    });
  });
  $(".modal-content").fadeIn(500);
  $(".disclaimer-container").css("display", "flex").addClass("visible").hide().fadeIn(500);
});

//---------------------------//

$(document).ready(function () {
  buildPage();
  setTimeout(function () {
    document.body.className = "";
  }, 500);
});
