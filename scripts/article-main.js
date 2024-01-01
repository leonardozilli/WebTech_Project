class Article {
  constructor(element) {
    this.element = element;
    this.title = element.data("title");
    this.subtitle = element.data("subtitle");
    this.author = element.data("author");
    this.date = element.data("date");
    this.people = $("span.person[id]");
    this.organizations = $("span.organization");
    this.places = $("span.place");
    this.dates = $("span.date");
  }
}

function goto(className) {
  articleContainer = $(".article-container") 
  let scrollPos = articleContainer.scrollTop();
  let elements = $(`.${className}`);

  let nextElements = elements.filter(function () {
    return $(this).offset().top > 31;
  })


  if (nextElements.length > 0 && !nextElements.first().hasClass("searched")) {
    nextElement = nextElements.first();
  } else {
    nextElement = elements.first()
    $(".searched").removeClass("searched");
  }

  articleContainer.animate({ scrollTop: (scrollPos + nextElement.offset().top) - 30 }, 1000, "easeOutCubic");

  $(".animate").removeClass("animate");
  nextElement.addClass("animate");
  nextElement.addClass("searched");
}

function displayMetadata(article) {
  $(".article-title").text(article.title);
  $(".article-author").text(article.author);
  $(".article-subtitle").text(article.subtitle);
  $(".article-date").text(article.date);

  const appendMetadataToList = (container, data, type) => {
    data.each((index, el) => {
      const listItem = $(
        `<li class="metadata-entry" onclick="goto('${el.id}')"></li>`
      ).text(el.dataset.name);
      container.append(listItem);
    });
  };

  appendMetadataToList($(".persList"), article.people);
  appendMetadataToList($(".orgList"), article.organizations);
  appendMetadataToList(
    $(".dateList"),
    article.dates.sort((a, b) => a.id - b.id)
  );

  $(".wiki-close").on("click", function (e) {
    $(".wiki-container").fadeOut(100);
    $(".article-map-container").fadeIn();
    $(".metadata-entry").removeClass("active");
    $(".wiki-thumbnail, .wiki-extract").fadeOut(300, function () {
      $(this).empty();
      $(".wiki-thumbnail").attr("src", "");
    });
  });

  $(".metadata-entry").on("click", function (e) {
    if (!$(this).hasClass("active")) {
      wikiCall($(this).text());
      $(".article-map-container").hide();
      $(".wiki-container").fadeIn({
        start: function () {
          jQuery(this).css("display", "flex");
        },
      });
      $(".metadata-entry").removeClass("active");
      $(this).toggleClass("active");

    }
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

function buildPage() {
  /*$.get("components/header.html", function (data) {
    /*$("main").before(data);
  });*/

  $("main").prepend('<div class="loading">Loading...</div>').fadeIn(200);
  $("main").prepend('<div class="style-selector-container" style="display: none;"></div>');
  $(".style-selector-container").load("components/style-selector.html");

  if (getStyleCookie() === null) {
    $(".style-selector-container").show();
  } else {
    changeStyle(getStyleCookie());
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  const issue = urlSearchParams.get("issue");
  const [articleNumber, article] = urlSearchParams
    .get("article")
    .split(/-(.+)/);
  $.ajax({
    url: `issues/${issue}/${articleNumber}/${article}.html`,
    dataType: "html",
    success: function (data) {
      $(".article-container").html(data);
      const articleObj = new Article($("article").first());
      document.title = `${articleObj.title}, by ${articleObj.author}`;
      displayMetadata(articleObj);
      $(".article-title").quickfit({ max: 90, min: 50, truncate: false });

      if (getStyleCookie() === "1500-article.css") {
        mapbox();
        Css1500.countLines();
        Css1500.dropCaps();
        $(".article-date").text(Css1500.dateToRoman(articleObj.date));
      } else if (getStyleCookie() === "future-article.css") {
        Css1500.revert1500(articleObj.date);
      };

      $(".loading").fadeOut(100);
      $(".article-text, .metadata-container").animate({opacity: 0.9}, 700)
      $(".header-container").animate({"right": '0'}, 500)
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        var $errorContainer = $("<div>").addClass("error-container");
        $('.article-container, .metadata-container').remove();
        $("main").append($errorContainer.load("404.html"));
        $(".loading").fadeOut(100);
      } else {
        alert("An unexpected error occurred. Check the console for details.");
      }
    },
  });
}

//wikipedia//
function wikiCall(subject) {
  $(".wiki-thumbnail, .wiki-extract").fadeOut(300, function () {
    $(this).empty();
    $(".wiki-thumbnail").attr("src", "");
  });

  $(".wiki-loading").fadeIn(300);

  $.ajax({
    url: "http://en.wikipedia.org/w/api.php",
    data: {
      action: "query",
      list: "search",
      srsearch: subject,
      format: "json",
    },
    dataType: "jsonp",
    success: function (data) {
      title = data.query.search[0].title;
      $.ajax({
        url: "https://en.wikipedia.org/api/rest_v1/page/summary/" + title,
        dataType: "json",
        success: function (data) {
          var thumbnail = new Image();
          if (data.thumbnail && data.thumbnail.source) {
            thumbnail.src = data.thumbnail.source;
            thumbnail.onload = function () {
              $(".wiki-loading").fadeOut();
              $(".wiki-thumbnail").fadeIn(300).attr("src", thumbnail.src);
              $(".wiki-extract").fadeIn(300).html(data.extract);
            };
          } else {
            $(".wiki-loading").fadeOut();
            $(".wiki-thumbnail").text("Image not found").fadeIn(300);
            $(".wiki-extract").fadeIn(300).html(data.extract);
          }
        },
      });
    },
    error: function (xhr, status, error) {
      console.log("Error: " + error);
    },
  });
}

//map//

class ClickableMarker extends mapboxgl.Marker {
  // new method onClick, sets _handleClick to a function you pass in
  onClick(handleClick) {
    this._handleClick = handleClick;
    return this;
  }

  // the existing _onMapClick was there to trigger a popup
  // but we are hijacking it to run a function we define
  _onMapClick(e) {
    const targetElement = e.originalEvent.target;
    const element = this._element;

    if (this._handleClick && (targetElement === element || element.contains((targetElement)))) {
      this._handleClick();
    }
  }
};

function mapbox() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibHppbGwiLCJhIjoiY2xuNjlkODZpMGVjczJtcW1wN2VkcHExaSJ9.zhOJVlpnVZXhtBntooFkgw";

  var map = new mapboxgl.Map({
    container: "article-map",
    style: "mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw",
    center: [0, 30],
    zoom: 1,
    attributionControl: false,
  });

  map.on("idle", function () {
    map.resize();
  });

  places = $('span.place.city[id], span.place.plant[id]')

    const markerColorMap = {
    'city': 'lightblue',
    'plant': 'yellow',
    'disaster': 'red',
  };

  places.each(function () {
    let coordinates = $(this).data('coord').split(',');

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
      `${$(this).text()}\n${coordinates}`
    );

    let markerColor;
    let markerSize;

    switch (true) {
      case $(this).hasClass('disaster'):
        markerColor = 'red';
        break;
      case $(this).hasClass('plant'):
        markerColor = 'yellow';
        break;

      default:
        markerColor = 'lightblue';
    }

    try {
      new ClickableMarker({ color: markerColor})
        .setLngLat([parseFloat(coordinates[1]), parseFloat(coordinates[0])])
        .setPopup(popup)
        .onClick(() => {
          goto(this.id)
        })
        .addTo(map);
    } catch {
      console.log("couldn't fetch coordinates for ", $(this))
    }
  })

  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  console.log(map.getBounds())
  map.fitBounds(map.getBounds());
}

//style change//
$(document).on(
  "click",
  "#change-style-button, #fab-style-button",
  function (e) {
    $(".style-selector-container").fadeIn(500);
  }
);

function changeStyle(style) {
  const selector = $(".style-selector-container");

  if ($("#style").attr("href").includes(style)) {
    selector.fadeOut(500);
    writeStyleInCookie(style);
  } else {
    $("#style").attr("href", "/styles/" + style);
    Css1500.revert1500();
    if (style === "1500-article.css") {
      Css1500.apply1500();
    };
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

//floating action button//
$(".fab-icon").click(function (e) {
  e.stopPropagation();
  $(".fab-wrapper").toggleClass("active");
});

$(document).click(function (e) {
  $(".fab-wrapper").removeClass("active");
});

$("#fab-metadata-button").click(function (e) {
  $(".metadata-container").toggleClass("active");
  $(".article-container").toggleClass("covered");
});

$(".article-container").click(function (e) {
  $(".metadata-container").removeClass("active");
  $(".article-container").removeClass("covered");
});

//1500.css-related functions//
const Css1500 = {
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
    const firstParagraph = document.querySelector(".article-text p:first-of-type");

    if (firstParagraph) {
      const dropCapSpan = firstParagraph.querySelector(".drop-cap");

      if (dropCapSpan && dropCapSpan.nextSibling) {
        const originalText = dropCapSpan.textContent + dropCapSpan.nextSibling.textContent;
        firstParagraph.textContent = originalText;
      }
    }

    const articleDate = $(".article-date");
    if (articleDate.length) {
      articleDate.text(date);
    }

    const articleParagraphs = $("article p");
    if (articleParagraphs.length) {
      articleParagraphs.removeAttr("data-lines");
    }

    $(".article-date").text(
      $('article').first().data("date")
    );
  },

  apply1500: () => {
    Css1500.countLines();
    Css1500.dropCaps();
    $(".article-date").text(
      Css1500.dateToRoman($(".article-date").text().replace(/ /g, "/"))
    );
  },
};


const Css2040 = {
  initializeGlobe: () => {
    let phi = 0
    let canvas = $("#article-map").empty();

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0,
      dark: 0,
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
        phi += 0.01
      },
    })
  },
};

function initializeGlobe() {

  var width = 960,
    height = 960,
    radius = 228,
    mesh,
    graticule,
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000),
    renderer = new THREE.WebGLRenderer({ alpha: true });

  camera.position.z = 400;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  $('.article-map-container').append(renderer.domElement);

  d3.json("https://unpkg.com/world-atlas@1/world/50m.json", function (error, topology) {
    if (error) throw error;
    scene.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({ color: 0xaaaaaa })));
    scene.add(mesh = wireframe(topojson.mesh(topology, topology.objects.land), new THREE.LineBasicMaterial({ color: 0xff0000 })));
    d3.timer(function (t) {
      graticule.rotation.x = mesh.rotation.x = Math.sin(t / 11000) * Math.PI / 3 - Math.PI / 2;
      graticule.rotation.z = mesh.rotation.z = t / 10000;
      renderer.render(scene, camera);
    });
  });

  // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
  function vertex(point) {
    var lambda = point[0] * Math.PI / 180,
      phi = point[1] * Math.PI / 180,
      cosPhi = Math.cos(phi);
    return new THREE.Vector3(
      radius * cosPhi * Math.cos(lambda),
      radius * cosPhi * Math.sin(lambda),
      radius * Math.sin(phi)
    );
  }

  // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
  function wireframe(multilinestring, material) {
    var geometry = new THREE.Geometry;
    multilinestring.coordinates.forEach(function (line) {
      d3.pairs(line.map(vertex), function (a, b) {
        geometry.vertices.push(a, b);
      });
    });
    return new THREE.LineSegments(geometry, material);
  }

  // See https://github.com/d3/d3-geo/issues/95
  function graticule10() {
    var epsilon = 1e-6,
      x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
      X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
      x = graticuleX(y0, y1, 2.5), y = graticuleY(x0, x1, 2.5),
      X = graticuleX(Y0, Y1, 2.5), Y = graticuleY(X0, X1, 2.5);

    function graticuleX(y0, y1, dy) {
      var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
      return function (x) { return y.map(function (y) { return [x, y]; }); };
    }

    function graticuleY(x0, x1, dx) {
      var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
      return function (y) { return x.map(function (x) { return [x, y]; }); };
    }

    return {
      type: "MultiLineString",
      coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function (x) { return Math.abs(x % DX) > epsilon; }).map(x))
        .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function (y) { return Math.abs(y % DY) > epsilon; }).map(y))
    };
  }
}


//---------------------------//

$(document).ready(function () {
  buildPage();
  setTimeout(function () {
    document.body.className = "";
  }, 500);
});

//https://stackoverflow.com/questions/6805482/css3-transition-animation-on-load
