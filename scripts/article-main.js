class Article {
    constructor(element) {
        this.element = element;
        this.title = element.data('title');
        this.subtitle = element.data('subtitle');
        this.author = element.data('author')
        this.date = element.data('date');
        this.addIds()
        this.people = this.extractMetadata($("span.person"))
        this.places = this.extractMetadata($("span.place"))
        this.dates = this.extractMetadata($("span.date"))
    }


    extractMetadata(el) {
        const unique = [];
        el = $.grep(el, function (i) {
            const x = i.id
            if (unique.includes(x)) {
                return false;
            } else {
                unique.push(x)
                return true;
            }
        });
        return el;
    };

    addIds() {
        $("span.date").each(function () {
            $(this).attr('id', $(this).text())
        })
        $("span.person").each(function () {
            let fullName = $(this).text().split(' ')
            let personId = fullName[fullName.length - 1].toLowerCase()
            $(this).attr('id', personId);
        })
        $("span.place").each(function () {
            let placeId = $(this).text().replace(/ |,|'|’/g, '_').toLowerCase()
            $(this).attr('id', placeId)
        })
    }
}

function goto(id) {
    let t = $(id)[0].offsetTop;
    console.log($(id));
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


    article.people.forEach(function(el) {
        const id = el.id
        const listItem = $('<li></li>');
        listItem.append($(`<a class="metadata-entry" href="#" onclick="goto(${id})"></a>`).text(el.innerHTML))
        personContainer.append(listItem)
    })
    article.places.forEach(function(el) {
        const id = el.id
        const listItem = $('<li></li>');
        listItem.append($(`<a class="metadata-entry" href="#" onclick="goto('#${id}')"></a>`).text(el.innerHTML))
        placeContainer.append(listItem)
    })
    article.dates.forEach(function(el) {
        const id = el.id
        const listItem = $('<li></li>');
        listItem.append($(`<a class="metadata-entry" href="#" onclick="goto('#${id}')"></a>`).text(el.innerHTML))
        dateContainer.append(listItem)
    })
}

function collapseList() {
    $('.metadata-list-button').on("click", function (e) {
        if ($(this).next().hasClass('collapsed-list')) {
            $(this).next().slideDown();
            $(this).next().removeClass('collapsed-list');
        }
        else {
            // collapse the panel
            $(this).next().slideUp();
            $(this).next().addClass('collapsed-list');
        }
    });
};


$(document).ready(function () {
    const article = new Article($('.article').first());
    document.title = article.title + ', by ' + article.author;
    displayMetadata(article);
    collapseList();
});