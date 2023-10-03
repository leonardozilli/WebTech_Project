
function styleSelector() {
    const selector = $("#style-selector");
    const content = $("#content");

    $("#style1").click(function () {
        $('#style').attr('href', 'styles/1500.css')
        selector.hide(); // Hide the selector
        content.removeClass("hidden"); // Show the content
    });

    $("#style2").click(function () {
        $('#style').attr('href', 'styles/Future.css')
        selector.hide();
        content.removeClass("hidden");
    });

    $("#style3").click(function () {
        $('#style').attr('href', 'styles/Future.css')
        selector.hide();
        content.removeClass("hidden");
    });
    $("#style3").click(function () {
        $('#style').attr('href', 'styles/Future.css')
        selector.hide();
        content.removeClass("hidden");
    });


}


$(document).ready(function () {
    styleSelector();


});
