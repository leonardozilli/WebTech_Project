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
    const lineElement = document.getElementById('hand-drawn-line');
lineElement.addEventListener('mousemove', function(event) {
  const x = event.clientX - lineElement.offsetLeft;
  const y = event.clientY - lineElement.offsetTop;
  lineElement.style.setProperty('--mouse-x', x + 'px');
  lineElement.style.setProperty('--mouse-y', y + 'px');
});


})