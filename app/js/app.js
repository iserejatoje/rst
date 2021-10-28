import IMask from 'imask'
import * as $ from 'jquery'

let mapShowed = false;

const phoneMask = document.querySelectorAll('[type="tel"]')
phoneMask.forEach(element => IMask(element, {
    mask: '+{7} (000) 000-00-00'
}))

function elementInViewport(el) {
    let top = el.offsetTop;
    let left = el.offsetLeft;
    let width = el.offsetWidth;
    let height = el.offsetHeight;
    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }
    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
}

window.addEventListener('scroll', () => {
    if (document.getElementById('map') && elementInViewport(document.getElementById('map')) && !mapShowed) {
        if (document.getElementById('map')) {
            mapShowed = true
            let script = document.createElement("script");
            script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&coordorder=longlat&apikey=c312250b-bc1e-4a4a-8eb2-d1b7dff3d685";
            document.getElementsByTagName("body")[0].appendChild(script)
            script.onload = function () {
                ymaps.ready(function () {
                    let map = new ymaps.Map('map', {
                            center: [37.624471, 55.783944],
                            zoom: 17
                        }, {
                            searchControlProvider: 'yandex#search'
                        }),
                        placemark = new ymaps.Placemark(map.getCenter(), {
                            balloonContent: '129110, г. Москва, Олимпийский проспект, д. 16, стр. 5'
                        }, {});

                    map.behaviors.disable('scrollZoom')
                    map.geoObjects.add(placemark)
                })
            };
        }
    }
})

$(function () {

});