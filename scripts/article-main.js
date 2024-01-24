class Article {
  constructor(element) {
    this.element = element;
    this.title = element.data("title");
    this.subtitle = element.data("subtitle");
    this.author = element.data("author");
    this.date = element.data("date");
    this.issueNumber = element.data("issue");
    this.articleNumber = element.data("order");
    this.source = element.data("source");
    this.people = $("span.person[id]");
    this.organizations = $("span.organization[id]");
    this.places = $("span.place");
    this.dates = $("span.date");
  }
}

function goto(className) {
  let elements = $(`.${className}`);

  if (getStyleCookie() === "1500.css" || getStyleCookie() === "future.css") {
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
  $(".issue-number").text("Issue "+article.issueNumber);
  $(".article-number").text("Article "+article.articleNumber);
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
  appendMetadataToList($("#orgList"), article.organizations);
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
      if (getStyleCookie() === "1500.css" || getStyleCookie() === "future.css") {
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
    $(".metadata-container").toggleClass("active");
    if (getStyleCookie() === "1500.css" || getStyleCookie() === "future.css") {
      $(".article-map-container").removeClass('active');
    }
    $(".wiki-container").addClass('active');
  }
});

function toggleCollapsibleList(target) {
    $(`.collapsible-list.${target}`).slideToggle();
}

$('header').on('mouseleave', function (e) {
  $(`.collapsible-list`).slideUp();
});

function buildPage() {
  /*$.get("components/header.html", function (data) {
    /*$("main").before(data);
  });*/

  $("main").prepend(
    '<div class="style-selector-container" style="display: none;"></div>'
  );
  $(".style-selector-container").load("components/style-selector.html");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const issue = urlSearchParams.get("issue");
  var [articleNumber, article] = urlSearchParams
    .get("article")
    .split(/-(.+)/);
  
  if (getStyleCookie() === 'null') {
    $(".style-selector-container").show();
  }

  $.ajax({
    url:
      issue === "docs"
        ? `issues/${issue}/documentation.html`
        : `issues/${issue}/${articleNumber}/${article}.html`,
    dataType: "html",
    success: function (data) {
      $(".article-container").html(data);
      const articleObj = new Article($("article").first());
      document.title = `${articleObj.title}, by ${articleObj.author}`;
      displayMetadata(articleObj);
      changeStyle(getStyleCookie(), issue, articleNumber, article);
      $(".article-text, .metadata-container").animate({ opacity: 0.9 }, 700);
      $(".header-container").animate({ right: "0" }, 500);
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        var $errorContainer = $("<div>").addClass("error-container");
        $(".article-container, .metadata-container").remove();
        $("main").append($errorContainer.load("components/404.html"));
      } else {
        alert("An unexpected error occurred. Check the console for details.");
      }
    },
  });
}


function fitTitle(titleElement, style) {
  if (style === 1500) {
    var titleHeight = titleElement.height();
    var maxHeight = $(window).height() * 0.3;
    var fontSize = parseFloat(titleElement.css("font-size"));
    if (titleHeight > maxHeight) {
      titleElement.css("font-size", fontSize - 10);
      fitTitle(titleElement, 1500)
    }
  } else if (style === 90) {
    var titleHeight = titleElement.height();
    var maxHeight = $(window).height() * 0.6;
    var fontSize = parseFloat(titleElement.css("font-size"));
    if (titleHeight > maxHeight) {
      titleElement.css('font-size', titleHeight / (titleElement.text().length * 0.2) + 'px')
    }
    //$(box).css('font-size', width/$(line).width()*100-1);
  }
}

function styleBoundChanges(date, geojson) {
  mapbox(geojson, getStyleCookie());
  if (getStyleCookie() === "1500.css") {
    Css1990.revert1990();
    CssPulp.revertPulp(date);
    CssFuture.revertFuture();
    $('.issue-number').insertAfter('.header-buttons')
    $('.article-number').insertAfter('.header-buttons')
    Css1500.embellish();
    Css1500.organizeList($("#persList"), $("#persList .metadata-entry"));
    Css1500.organizeList($("#orgList"), $("#orgList .metadata-entry"));
    Css1500.countLines();
    Css1500.dropCaps();
    $(".article-date").text(Css1500.dateToRoman(date));
  } else if (getStyleCookie() === "90s.css") {
    fitTitle($(".article-title"), 90);
    $(".metadata-bottom").appendTo('header');
    Css1500.revert1500(date);
    CssPulp.revertPulp(date);
    CssFuture.revertFuture();
    Css1990.extractColor();
    Css1990.dataText();
  } else if (getStyleCookie() === 'pulp.css') {
    // non funziona
    Css1500.revert1500(date);
    Css1990.revert1990();
    CssFuture.revertFuture();
    CssPulp.addSmallCapsToFirstWord();
    CssPulp.dropCaps();
    CssPulp.addChapterNumbers();
    //CssPulp.wrapH5WithDateContainer();  
    CssPulp.createArticleBody();
    CssPulp.formatDate();
  } else if (getStyleCookie() === 'future.css'){
    CssPulp.revertPulp(date);
    Css1500.revert1500(date);
    Css1990.revert1990();
    CssFuture.createButton();
    CssFuture.formatDate();
  } else {
    Css1500.revert1500(date);
    Css1990.revert1990();
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

  const mapConfigs = {
    "1500.css": {
      container: document.getElementById("article-map"),
      style: "mapbox://styles/lzill/cln69j4oi039y01qu4eugc6lw",
      projection: "mercator",
      center: [0, 30],
      zoom: 1.1,
      attributionControl: false,
    },
    "90s.css": {
      container: document.getElementById("article-map"),
      style: "mapbox://styles/lzill/clrak0xgs006r01qq8w9m0bow",
      projection: "globe",
      zoom: 0,
      center: [90, 30],
      minZoom: 2,
      attributionControl: false,
    },
    "pulp.css": {
      container: document.getElementById("article-map"),
      style: "mapbox://styles/itisdone/clrjfeik700pc01pdc9zj7zzr",
      projection: "mercator",
      zoom: 0,
      center: [90, 30],
      minZoom: 2,
      maxZoom: 2,
      attributionControl: false,
    },
    "future.css": {
      container: document.getElementById("article-map"),
      style: "mapbox://styles/itisdone/clrorcpit007z01pn4cwvb2vc",
      projection: "globe",
      zoom: 0,
      center: [90, 30],
      minZoom: 0,
      attributionControl: false,
    },
  };

  var map = new mapboxgl.Map(mapConfigs[style]);

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
    map.resize();
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
                  "fill-color": getStyleCookie() === '90s.css' ? pickColor($(':root').css('--accent-color')) : "rgba(132, 128, 107, 0.3)",
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

function pickColor(color) {
  if (color.startsWith('#')){
    return 'rgba(246, 245, 236, 0.4)'
  } else {
    var color = color.replace('rgb', 'rgba').replace(')', ', 0.2)');
    return color;
  }
}

function populateLists() {
    $.getJSON("issues/issuesDB.json", function (objson) {
        const issueList = $("#issue-dropdown");

        objson.issues.forEach((issue) => {
            if (issue.number !== "docs") {
                const issueItem = $(
                  `<li class='issue-button issue${issue.number}' onclick=toggleCollapsibleList('article${issue.number}')></li>`
                ).text("Issue " + issue.number);
                const articleList = $(`<ul class='collapsible-list coll-article article${issue.number}'></ul>`);

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

                issueItem.append(articleList);
                issueList.append(issueItem);
            }
        });
    }).fail(function () {
        console.log("Get from issuesDB: an error has occurred.");
    });
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
  if (style === 'null') {
  } else {
    if (!issue) {
      article = $(".article-text");
      issue = article.data("issue");
      articleNumber = article.data("order");
      article = article.data("filename");
    } 
    const selector = $(".style-selector-container");

    if ($("#style").attr("href").includes(style)) {
      selector.fadeOut(600);
      writeStyleInCookie(style);
    } else {
      $("#style").attr("href", "./styles/" + style);
      writeStyleInCookie(style);
      styleBoundChanges($(".article-date").text(), issue === 'docs' ? `issues/${issue}/documentation.geojson` : `issues/${issue}/${articleNumber}/${article}.geojson`);
      setTimeout(() => {
        selector.fadeOut(500);
      }, 500);
    }

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
  embellish: () => {
    $(".separator").append(
      `
      <div id="holy_line1">A TABLE OF THE PRINCIPAL</div>
      <div id="holy_line2">THINGS THAT ARE CONTEINED IN THE ARTICLE, AF·</div>
      <div id="holy_line3">ter the ordre of the alphabet.</div>
      `
    );
  },
  organizeList: (targetList, data) => {
    const groupedItems = {};
    data.each(function (idx, item) {
      const initial = item.textContent[0].toUpperCase();

      if (!groupedItems[initial]) {
        groupedItems[initial] = [];
      }
      groupedItems[initial].push(item);
    });

    $.each(groupedItems, function (initial, data) {
      const group = $("<ul></ul>");

      $.each(data, function () {
        group.append($(this));
      });

      const listItem = $(
        `<li class='list-block'><span class="list-block-heading">${initial}</span></li>`
      );
      listItem.append(group);
      targetList.append(listItem);
    });
  },

  countLines: () => {
    let articleLines = 0;
    $("article p").each(function () {
      const lineHeight = 16;
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
    $(".article-number").appendTo(".article-data-container");
    $(".issue-number").prependTo(".article-data-container");
    $('.separator').empty()

    //remove all list-blocks
    $("#persList").empty();
    $("#orgList").empty();
    appendMetadataToList($("#persList"), $("span.person[id]"));
    appendMetadataToList($("#orgList"), $("span.organization[id]"));

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
    $(".article-date").text($(".article-text").data("date"));
  },

  apply1500: () => {
    Css1500.countLines();
    Css1500.dropCaps();
    $(".article-date").text(
      Css1500.dateToRoman($(".article-date").text().replace(/ /g, "/"))
    );
  },
};

const CssPulp = {
  dropCaps: () => {
    const paragraphs = document.querySelectorAll(".small-caps");
    paragraphs.forEach((paragraph) => {
      const firstLetter = paragraph.textContent.trim().charAt(0);
      const remainingText = paragraph.innerHTML.trim().slice(1);
  
      paragraph.innerHTML = `<span class="drop-cap">${firstLetter}</span>${remainingText}`;
    });
  },

  addSmallCapsToFirstWord: () => {
    const paragraphs = document.querySelectorAll(".text-block h2+p");
    paragraphs.forEach((paragraph) => {
      const words = paragraph.textContent.trim().split(' ');
      if (words.length > 0) {
        words[0] = `<span class="small-caps">${words[0]}</span>`;
        paragraph.innerHTML = words.join(' ');
      }
    });

    const firstParagraph = document.querySelector(
      ".article-text p:first-of-type"
    );
    const words = firstParagraph.textContent.trim().split(' ');
      if (words.length > 0) {
        words[0] = `<span class="small-caps">${words[0]}</span>`;
        firstParagraph.innerHTML = words.join(' ');
      }
  },
  

  addChapterNumbers: () => {
    const h2Elements = document.querySelectorAll(".article-container h2");

    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  
    let chapterNumber = 1;
  
    h2Elements.forEach((h2Element) => {
      // Create a new line with the same styles as h2
      const chapterLine = document.createElement("div");
      chapterLine.textContent = `Chapter ${romanNumerals[chapterNumber- 1].toString()}.`;
      chapterLine.className = 'chapter-heading';
  
      // Insert the new line before the h2 element
      h2Element.parentNode.insertBefore(chapterLine, h2Element);
  
      // Increment chapter number for the next occurrence
      chapterNumber++;
    });
  },


  createArticleBody: () => {
    // Select all .article-text elements except those with the class .cover-page or .ending-paragraph
    const articleTextElements = document.querySelectorAll('.article-text > :not(.cover-page, .ending-paragraph)');
  
    // Create a new div.article-body
    const articleBody = document.createElement('div');
    articleBody.className = 'article-body';
  
    // Append each selected element to the articleBody
    articleTextElements.forEach((element) => {
      articleBody.appendChild(element);
    });

    // Insert the articleBody as the second child of .article-text
    const firstArticleText = document.querySelector('.article-text');
    if (firstArticleText) {
      const firstChild = firstArticleText.firstElementChild;

      // If there is a first child, insert the articleBody after it
      if (firstChild) {
        firstArticleText.insertBefore(articleBody, firstChild.nextSibling);
      } else {
        // If there is no first child, simply append the articleBody
        firstArticleText.appendChild(articleBody);
      }
    }
  },

  formatDate: () => {
    // Parse the input date string
    const element = document.querySelector('.article-date');
    const inputDate = element.innerHTML;

    const dateParts = inputDate.split('/');
    if (dateParts.length === 3){
      var month = parseInt(dateParts[0], 10);
      var day = parseInt(dateParts[1], 10);
      var year = parseInt(dateParts[2], 10);
    } else {
      var month = parseInt(dateParts[0], 10);
      var year = parseInt(dateParts[1], 10);
    }

    // Check if the day component is present
    const hasDay = !isNaN(day);
  
    // Create a Date object
    const formattedDate = hasDay
      ? new Date(year, month - 1, day)
      : new Date(year, month - 1);

    // Get full names for day and month using toLocaleString
    const dayOfWeek = hasDay ? formattedDate.toLocaleString('en-US', { weekday: 'long' }) : '';
    const monthName = formattedDate.toLocaleString('en-US', { month: 'long' });

    // Format the output string
    let formattedOutput = '';

    if (hasDay) {
      formattedOutput = `${dayOfWeek}, ${monthName} ${day}, ${year}`;
    } else {
      formattedOutput = `${monthName}, ${year}`;
    }

    element.textContent = formattedOutput;
  }, 

  revertPulp: (date) => {
    // revert chapter number
    $(".chapter-heading").remove();
    // revert small-calps
    const dropCaps = $(".drop-cap");
    dropCaps.replaceWith(dropCaps.html());
    // revert calps-lock
    const smallCaps = $(".small-caps");
    smallCaps.replaceWith(smallCaps.html());
    // revert article body
    const articleBody = $(".article-body");
    articleBody.replaceWith(articleBody.contents());
    // revert date
    $(".article-date").text($(".article-text").data("date"));

  }

};

const CssFuture = {
  createButton: () => {
    const button = document.createElement('button');
    button.className = 'size-slider';
    const bodyArticle = document.querySelector('body.article');
    const htmlArticle = document.querySelector('html');

    const backVideo = document.createElement('video'); // Corrected typo in 'document'
    backVideo.className = 'back-video'; // Added class name for back video
    backVideo.id = 'myVideo';
    backVideo.loop = true;
    backVideo.autoplay = true;
    // backVideo.style.width = '100 %';
    // backVideo.style.height = '100%';

    const source = document.createElement('source');
    source.src = '../img/future/walking-back-compact.mp4';
    
    $(button).on("click", function (e) {
      $('main.article').toggleClass('sized');  
    })

    backVideo.appendChild(source);
    htmlArticle.insertBefore(backVideo, bodyArticle );
    bodyArticle.appendChild(button);
  },

  formatDate: () => {
    // Parse the input date string
    const element = document.querySelector('.article-date');
    const inputDate = element.innerHTML;
  
    const dateParts = inputDate.split('/');
    if (dateParts.length === 3) {
      var month = parseInt(dateParts[0], 10);
      var day = parseInt(dateParts[1], 10);
      var year = parseInt(dateParts[2], 10);
    } else {
      var month = parseInt(dateParts[0], 10);
      var year = parseInt(dateParts[1], 10);
    }
  
    // Check if the day component is present
    const hasDay = !isNaN(day);
  
    // Create a Date object
    const formattedDate = hasDay
      ? new Date(year, month - 1, day)
      : new Date(year, month - 1);
  
    // Get the full month name using toLocaleString
    const monthName = formattedDate.toLocaleString('en-US', { month: 'long' });
  
    // Format the output string
    let formattedOutput = '';
  
    if (hasDay) {
      formattedOutput = `${monthName} ${day}, ${year}`;
    } else {
      formattedOutput = `${monthName}, ${year}`;
    }
  
    element.textContent = formattedOutput;
  }, 

  revertFuture:(date) => {
    // revert date
    const articleDate = $(".article-date");
      if (articleDate.length) {
        articleDate.text(date);
      }
    $(".article-date").text($("article").first().data("date"));

    // revert dimensions
    $(".size-slider").remove();

    // remove video
    $(".back-video").remove();

 
  }


  
  
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
  populateLists();
  setTimeout(function () {
    $('body').removeClass("preload")
  }, 500);
});
