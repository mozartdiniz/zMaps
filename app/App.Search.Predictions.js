/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/30/13
 * Time: 4:20 AM
 */

var App = App || {};
App.Search = App.Search || {};
App.Search.Prediction = App.Search.Prediction || {};

App.Search.Prediction = {
    service: function (value, callback) {

        var center = App.Maps.map.getView().getCenter();
        var convertedCenter = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
        var location = new google.maps.LatLng(convertedCenter[1], convertedCenter[0]);
        var service = new google.maps.places.AutocompleteService();


        var request = {
            input: value,
            location: location,
            radius: 1000
        };

        var googleServiceCallback = (function (placeText, callback) {

            return function (predictions, status) {

                if (status != google.maps.places.PlacesServiceStatus.OK) {
                    return;
                }

                callback(predictions, placeText);
            }

        }(value, callback));

        service.getPlacePredictions(
            request,
            googleServiceCallback
        );

    },

    request: function (value, callback, listRenderer) {

        if (typeof placesTimer !== "undefined") {
            clearTimeout(placesTimer);
        }

        var ms = 750;

        placesTimer = setTimeout(function () {

            callback(value, listRenderer);

        }, ms);

    },
    addEventListeners: function () {

        var el = document.getElementById("searchField");

        el.addEventListener('keyup', (function (scope) {
            return function () {
                scope.request(this.value, scope.service, App.Search.Prediction.renderList);
            }
        }(this)));

    },
    renderList: function (data, placeText) {

        App.Search.lastResult = data;

        var result = data;
        var resultLength = result.length;
        var list = document.getElementById('searchResult');
        var placesList = document.getElementById('placesSearchResult'),
            searchBox = document.getElementById('searchBox'),
            searchField = document.getElementById('searchField'),
            clearField = document.getElementById('clearField'),
            addressSearchResult = document.getElementById('searchResult');

        var ul, li, liKeyword, divPlaces;

        liKeyword = document.createElement('li');
        var liKeywordStrong = document.createElement('strong');
        liKeywordStrong.innerHTML = placeText;

        liKeywordStrong.addEventListener('click', (function () {

            return function () {
                list.style.display = 'none';
                App.Search.Places.getBound(this.innerHTML);
            }

        }(list)));

        liKeyword.appendChild(liKeywordStrong);

        ul = document.createElement('ul');

        ul.appendChild(liKeyword);

        for (var i = 0; i < resultLength; i++) {

            li = document.createElement('li');
            divPlaces = document.createElement('div');
            divRouting = document.createElement('div');

            divPlaces.className = 'preditionText';
            divRouting.className = 'goToRouting';

            divPlaces.innerHTML = result[i].description;

            li.appendChild(divPlaces);
            li.appendChild(divRouting);

            divPlaces.addEventListener('click', (function (list, info) {
                return function () {

                    clearTimeout(window.timeoutId);

                    list.style.display = 'none';
                    App.Search.Places.service(info.reference, App.Search.Prediction.createMarker);

                }
            }(list, result[i])));

            divRouting.addEventListener('click', (function (info) {

                return function () {

                    clearTimeout(window.timeoutId);

                    var position = ol.proj.transform(JSON.parse(localStorage.getItem('lastPosition')), 'EPSG:3857', 'EPSG:4326');
                    var lastLat = position[1];
                    var lastLng = position[0];

                    searchField.value = '';
                    clearField.style.display = 'none';
                    addressSearchResult.style.display = 'none';
                    App.Maps.clearMarkers();

                    App.Routing.setOrigin('My Local', lastLat, lastLng);

                    App.Search.Places.service(info.reference, function (data) {

                        App.Routing.setDestiny(
                            data.name,
                            data.geometry.location[App.GoogleLatKey],
                            data.geometry.location[App.GoogleLngKey]
                        );

                        App.Routing.getRoutes();
                    });

                    App.Routing.showRoutingPanel();

                }
            }(result[i])));

            ul.appendChild(li);

        }

        placesList.innerHTML = "";
        placesList.appendChild(ul);
        list.scrollTop = 0;

        list.style.display = 'block';

    },

    createMarker: function (info) {

        App.Maps.clearMarkers();

        var map = App.Maps.map;
        var view = App.Maps.map.getView();
        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';
        var ll = ol.proj.transform(
            [info.geometry.location[App.GoogleLngKey], info.geometry.location[App.GoogleLatKey]],
            'EPSG:4326',
            'EPSG:3857'
        );

        var popUpContent = App.Search.Places.popUpLayout(info);
        var markerEl = document.createElement('div');
        var popover = document.createElement('div');

        markerEl.className = 'placesMarker';

        if (info.icon) {
            markerEl.style.background = 'url(' + info.icon + ') no-repeat center center rgba(255,255,255, 0.8)';
        }

        popover.className = 'bubble bubbleShow';

        markerEl.addEventListener(event, (function (pop) {
            return function (e) {

                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();

                clearTimeout(window.timeoutId);

                if (pop.className === 'bubble bubbleShow') {
                    pop.className = 'bubble bubbleHide';
                } else {
                    App.Maps.hideAllPopupsAndShowSelected(pop, e.target);
                }
            }
        }(popover)));

        popover.appendChild(popUpContent);
        markerEl.appendChild(popover);

        //usar pra saber o que o bunitim do objeto do google retorna
        //console.log (info);

        var marker = new ol.Overlay({
            element: markerEl,
            positioning: 'buttom-left',
            stopEvent: false
        });

        marker.setPosition(ll);

        map.addOverlay(marker);

        view.setCenter(ll);

        App.Maps.marker = marker;

    }

};