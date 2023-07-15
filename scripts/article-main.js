class Article {
    constructor(element) {
        this.element = element;
        this.title = element.data('title');
        this.subtitle = element.data('subtitle');
        this.author = element.data('author')
        this.date = element.data('date');
        this.people = $("span.person");
        this.places = $("span.place");
        this.dates = $("span.date");
        this.addIds()
        this.uniqueNames = this.filterSurnames(this.extractMetadata(this.people))
        this.uniquePlaces = this.extractMetadata(this.places)
        this.uniqueDates = this.extractMetadata(this.dates)
    }


    extractMetadata(el) {
        const un = el.map(function() {
            return $(this).text()
        }).get();
        return [...new Set(un)]
    }

    filterSurnames(list) {
        const res = list.filter((el, idx) => {
            if (el.split(' ').length == 1) {
                return false;
            }
            return true;
        });
        return res;
    }

    addIds() {
        this.dates.each(function() {
            $(this).attr('id', $(this).text())
        })
        this.people.each(function() {
            let fullName = $(this).text().split(' ')
            let personId = fullName[fullName.length - 1].toLowerCase()
            $(this).attr('id', personId);
        })
        this.places.each(function() {
            let placeId = $(this).text().replace(/ /g, '_').toLowerCase()
            $(this).attr('id', placeId)
        })
    }

    getUniqueIds(el) {
        const ids = el.map(function() {
            return this.id
        }).get();
        const uniqueIds = [...new Set(ids)]
        return uniqueIds
    }

}

function goto(id) {
    let t = $(id)[0].offsetTop;
    console.log(t)
    $('html,body').animate({ scrollTop: t }, 200);
    $(id).addClass('animate');
    setTimeout(function () {
        $(id).removeClass('animate');
    }, 5000);
}


function displayMetadata(article) {
    const personContainer = $('.persList')
    const placeContainer = $('.placeList')
    const dateContainer = $('.dateList')


    article.uniqueNames.forEach(function(el) {
        const listItem = $('<li></li>');
        const st = 'flint'
        listItem.append($(`<a class="metadata-entry" href="#" onclick="goto(${st})"></a>`).text(el))
        personContainer.append(listItem)
    })
    article.uniquePlaces.forEach(function(el) {
        const listItem = $('<li></li>');
        listItem.append($('<a class="metadata-entry"></a>').text(el))
        placeContainer.append(listItem)
    })
    article.uniqueDates.forEach(function(el) {
        const listItem = $('<li></li>');
        listItem.append($('<a class="metadata-entry"></a>').text(el))
        dateContainer.append(listItem)
    })
}

$(document).ready(function () {
    const article = new Article($('.article').first())
    document.title = article.title + ', by ' + article.author
    displayMetadata(article)
});