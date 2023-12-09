class Article {
  constructor(element) {
    this.element = element;
    this.title = element.data("title");
    this.subtitle = element.data("subtitle");
    this.author = element.data("author");
    this.date = element.data("date");
    //this.addIds();
    this.people = this.extractMetadata($("span.person"));
    this.places = this.extractMetadata($("span.place"));
    this.dates = this.extractMetadata($("span.date"));
  }

  extractMetadata(el) {
    const unique = [];
    el = $.grep(el, function (i) {
      const x = i.id;
      if (unique.includes(x)) {
        return false;
      } else {
        unique.push(x);
        return true;
      }
    });
    return el;
  }

  addIds() {
    $("span.date").each(function () {
      $(this).attr("id", $(this).text());
    });
    $("span.person").each(function () {
      let fullName = $(this).text().split(" ");
      let personId = fullName[fullName.length - 1]
        .toLowerCase()
        .replace(/ |-|,|'|’/g, "_");
      $(this).attr("id", personId);
    });
    $("span.place").each(function () {
      let placeId = $(this)
        .text()
        .replace(/ |,|'|’/g, "_")
        .toLowerCase();
      $(this).attr("id", placeId);
    });
  }
}

function goto(id) {
  let t = $(id)[0].offsetTop;
  $(".article-container").animate({ scrollTop: t - 30 }, 1000, "easeOutCubic");
  $(id).addClass("animate");
  setTimeout(function () {
    $(id).removeClass("animate");
  }, 5000);
}

function displayMetadata(article) {
  $(".article-title").text(article.title);
  $(".article-author").text(article.author);
  $(".article-subtitle").text(article.subtitle);
  $(".article-date").text(article.date);

  const appendMetadataToList = (container, data, type) => {
    data.forEach((el) => {
      const id = el.id;
      const listItem = $(
        `<li class="metadata-entry" onclick="goto('#${id}')"></li>`
      ).text(el.innerHTML);
      container.append(listItem);
    });
  };

  appendMetadataToList($(".persList"), article.people);
  appendMetadataToList($(".placeList"), article.places);
  appendMetadataToList(
    $(".dateList"),
    article.dates.sort((a, b) => a.id - b.id)
  );

  $(".wiki-close").on("click", function (e) {
    $(".wiki-container").fadeToggle();
    $(".article-map-container").fadeToggle();
    $(".metadata-entry").removeClass("active");
    $(".wiki-thumbnail, .wiki-extract").fadeOut(300, function () {
      $(this).empty();
      $(".wiki-thumbnail").attr("src", "");
    });
  });

  $(".metadata-entry").on("click", function (e) {
    wikiCall($(this).text());
    $(".wiki-container").fadeIn({
      start: function () {
        jQuery(this).css("display", "flex");
      },
    });
    $(".metadata-entry").removeClass("active");
    $(this).toggleClass("active");
    $(".article-map-container").fadeOut();
  });

  $("header").hover(
    () => $(".wiki-container").stop().animate({ right: "-10%" }, 500),
    () => $(".wiki-container").stop().animate({ right: "2rem" }, 500)
  );

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
  $("main").prepend(
    '<div class="style-selector-container" style="display: none;"></div>'
  );
  $(".style-selector-container").load("components/style-selector.html");
  if (getStyleCookie() === null) {
    console.log("no cookie");
    $(".style-selector-container").show();
  } else {
    changeStyle(getStyleCookie());
    console.log("cookie");
  }
  mapbox();
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

      //if style == 1550.css:
      Css1500.countLines();
      Css1500.dropCaps();
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        $(".article-container").load("404.html");
      } else {
        console.log(`Error: ${error}`);
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
          try {
            thumbnail.src = data.thumbnail.source;
          } catch (err) {
            $(".wiki-loading").fadeOut();
          }
          thumbnail.onload = function () {
            $(".wiki-loading").fadeOut();
            $(".wiki-thumbnail").fadeIn(300).attr("src", thumbnail.src);
            $(".wiki-extract").fadeIn(300).html(data.extract);
          };
        },
      });
    },
    error: function (xhr, status, error) {
      console.log("Error: " + error);
    },
  });
}

//map//
function articleMap() {
  var map = L.map("article-map").setView([30, 0], 2);
  var marker = L.marker([44.493, 11.36]).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

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

  new mapboxgl.Marker().setLngLat([11.36, 44.493]).addTo(map);
}

//style change//
$(document).on("click", "#change-style-button, #fab-style-button", function (e) {
  $(".style-selector-container").fadeIn(500);
});

function changeStyle(style) {
  const selector = $(".style-selector-container");

  if ($("#style").attr("href").includes(style)) {
    selector.fadeOut(500);
    writeStyleInCookie(style);
  } else {
    $("#style").attr("href", "/styles/" + style);
    writeStyleInCookie(style);
    setTimeout(() => {
      selector.fadeOut(1000);
    }, 1000);
  }
}

function writeStyleInCookie(style) {
  const expirationDate = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  );
  document.cookie =
    "style=" + style + "; expires=" + expirationDate + "; path=/";
  console.log('written ' + document.cookie);
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
    const remainingText = firstParagraph.textContent.trim().slice(1);
    firstParagraph.innerHTML = `<span class="drop-cap">${firstLetter}</span>${remainingText}`;
    document.querySelector(
      ".drop-cap"
    ).style.backgroundImage = `url(img/1500/icaps/${firstLetter.toLowerCase()}.gif)`;
  },
};

//---------------------------//

$(document).ready(function () {
  buildPage();
  setTimeout(function () {
    document.body.className = "";
  }, 500);

});

//https://stackoverflow.com/questions/6805482/css3-transition-animation-on-load