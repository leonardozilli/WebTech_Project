function loadPage(page) {
    console.log(page)
  $.ajax({
    url: page, // Update the path accordingly
    method: "GET",
    success: function (data) {
      // Update the main content with the loaded article
      $(".articles").html(data);

      // Update the URL without reloading the page
      history.pushState({ page: page }, null, page);
    },
    error: function () {
      console.log("Error loading page");
    },
  });
  console.log("ff");

  $(".articles").html(page);
  history.pushState({ page: page }, null, page);
  window.onpopstate = function (event) {
    if (event.state) {
      loadPage(event.state.page);
    }
  };
}
