function extractMetadata() {
    var personContainer = $('.persList')
    var personElements = $('span.person');
    var placeElements = $('span.place');
    var placeContainer = $('.placeList')
    var dateElements = $('span.date');
    var dateContainer = $('.dateList')

    personElements.each(function() {
        person = $(this).text()
        personContainer.append($('<li></li>').text(person))
    })
    placeElements.each(function() {
        place = $(this).text()
        placeContainer.append($('<li></li>').text(place))
    })
    dateElements.each(function() {
        date = $(this).text()
        dateContainer.append($('<li></li>').text(date))
    })
}

$( document ).ready(function (){

    extractMetadata();
})