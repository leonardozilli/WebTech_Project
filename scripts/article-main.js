class Article {
  constructor(element) {
    this.element = element;
    this.title = element.data("title");
    this.subtitle = element.data("subtitle");
    this.author = element.data("author");
    this.date = element.data("date");
    this.addIds();
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
  console.log($(id)[1]);
  console.log(id);
  $("html,body").animate({ scrollTop: t }, 200);
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
  const personContainer = $(".persList");
  const placeContainer = $(".placeList");
  const dateContainer = $(".dateList");

  article.people.forEach(function (el) {
    const id = el.id;
    const listItem = $("<li></li>");
    listItem.append(
      $(`<a class="metadata-entry" href="#" onclick="goto(${id})"></a>`).text(
        el.innerHTML
      )
    );
    personContainer.append(listItem);
  });
  article.places.forEach(function (el) {
    const id = el.id;
    const listItem = $("<li></li>");
    listItem.append(
      $(
        `<a class="metadata-entry" href="#" onclick="goto('#${id}')"></a>`
      ).text(el.innerHTML)
    );
    placeContainer.append(listItem);
  });
  article.dates.forEach(function (el) {
    const id = el.id;
    const listItem = $("<li></li>");
    listItem.append(
      $(
        `<a class="metadata-entry" href="#" onclick="goto('#${id}')"></a>`
      ).text(el.innerHTML)
    );
    dateContainer.append(listItem);
  });
}

function collapseList() {
  $(".metadata-list-header").on("click", function (e) {
    if ($(this).next().hasClass("collapsed-list")) {
      $(this).next().slideDown();
      $(this).next().removeClass("collapsed-list");
    } else {
      $(this).next().slideUp();
      $(this).next().addClass("collapsed-list");
    }
  });
}


function buildPage() {
  $.get("/components/header.html", function (data) {
    $("main").before(data);
  });
  $("main").prepend(
    '<div class="style-selector-container" style="display: none;"></div>'
  );
  $(".style-selector-container").load("/components/style-selector.html");
  if (!getStyleCookie()) {
    showStyleSelector();
  } else {
    changeStyle(getStyleCookie());
  }
  const urlSearchParams = new URLSearchParams(window.location.search);
  const issue = urlSearchParams.get("issue");
  const [articleNumber, article] = urlSearchParams
    .get("article")
    .split(/-(.+)/);
  $.ajax({
    url: "issues/" + issue + "/" + articleNumber + "/" + article + ".html",
    dataType: "html",
    success: function (data) {
      $(".article-container").html(data);
      const article = new Article($("article").first());
      document.title = article.title + ", by " + article.author;
      displayMetadata(article);

      //if style == 1550.css:
      countLines();
      dropCaps();
    },
    error: function (xhr, status, error) {
      if (xhr.status === 404) {
        $(".article-container").load("404.html");
      } else {
        console.log("Error: " + error);
        alert("An unexpected error occurred. Check the console for details.");
      }
    },
  });
}

//style change//

function showStyleSelector() {
  $(".style-selector-container").fadeIn(500);
}

function changeStyle(style) {
  const selector = $(".style-selector-container");

  $("#style").attr("href", "/styles/" + style);
  writeStyleInCookie(style);
  selector.fadeOut(500);
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

//1500.css-related functions//
function countLines() {
  let articleLines = 0;
  $("article p").each(function () {
    const lineHeight = parseFloat($(this).css("line-height"));
    const height = $(this).height();
    const lines = Math.round(height / lineHeight) + 1;
    articleLines += lines;
    $(this).next("p").attr("data-lines", articleLines);
  });
}

function dropCaps() {
  const firstParagraph = document.querySelector(
    ".article-text p:first-of-type"
  );
  const firstLetter = firstParagraph.textContent.trim().charAt(0);
  const remainingText = firstParagraph.textContent.trim().slice(1);
  firstParagraph.innerHTML = `<span class="drop-cap">${firstLetter}</span>${remainingText}`;
  document.querySelector(
    ".drop-cap"
  ).style.backgroundImage = `url(/img/1500/icaps/${firstLetter.toLowerCase()}.gif)`;
}

//---------------------------//

$(document).ready(function () {
  buildPage();
  collapseList();

  //these are for 1500.css only
});
