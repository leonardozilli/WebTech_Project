function loadPage(page) {
    // Use AJAX to fetch the content of the selected page
    $.ajax({
        url: 'content/' + page + '.html', // Update the path accordingly
        method: 'GET',
        success: function(data) {
            // Update the main content with the loaded article
            $('#main-content').html(data);

            // Update the URL without reloading the page
            history.pushState({page: page}, null, page);
        },
        error: function() {
            // Handle error if the content cannot be loaded
            console.log('Error loading page');
        }
    });
}

// Handle back/forward navigation using the History API
window.onpopstate = function(event) {
    if (event.state) {
        loadPage(event.state.page);
    }
};

// Load the default content (e.g., home page) when the page loads
$(document).ready(function() {
    loadPage('home');
});