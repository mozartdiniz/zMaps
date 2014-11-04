/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/29/13
 * Time: 6:30 AM
 */

var App = App || {};
App.Search = App.Search || {};
App.Search.Places = App.Search.Place || {};

App.Search.Places = {
    service: function (reference, callback) {

        var coisa = document.getElementById('coisa');
        var service = new google.maps.places.PlacesService(coisa);

        service.getDetails({reference: reference}, function (data) {
                callback(data)
            }
        );

    },

    getBound: function (text) {

        var coisa = document.getElementById('coisa');
        var service = new google.maps.places.PlacesService(coisa);
        var lCenter = App.Maps.map.getView().getCenter();
        var convertedCenter = ol.proj.transform(lCenter, 'EPSG:3857', 'EPSG:4326');
        var gCenter = new google.maps.LatLng(convertedCenter[1], convertedCenter[0]);

        var request = {
            name: text,
            rankBy: google.maps.places.RankBy.DISTANCE,
            location: gCenter
        };

        service.nearbySearch(
            request,
            App.Search.Places.createMarkers
        );

    },

    getDetails: function () {

        var coisa = document.getElementById('coisa');
        var service = new google.maps.places.PlacesService(coisa);

        service.getDetails({reference: reference}, function (data) {
                callback(data)
            }
        );

    },

    createMarkers: function (places) {

        App.Maps.clearMarkers();

        var map = App.Maps.map;
        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';

        for (var i = 0; i < places.length; i++) {

            var ll = ol.proj.transform(
                [places[i].geometry.location[App.GoogleLngKey], places[i].geometry.location[App.GoogleLatKey]],
                'EPSG:4326',
                'EPSG:3857'
            );

            var popUpContent = App.Search.Places.popUpLayout(places[i]);

            var markerEl = document.createElement('div');
            var popover = document.createElement('div');

            markerEl.className = 'placesMarker';
            markerEl.style.background = 'url(' + places[i].icon + ') no-repeat center center rgba(255,255,255, 0.8)';
            markerEl.style.zIndex = App.Maps.globalZIndex;

            popover.className = 'bubble bubbleHide';

            markerEl.addEventListener(event, (function (pop, reference) {
                return function (e) {

                    clearTimeout(window.timeoutId);

                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();

                    if (pop.className === 'bubble bubbleShow') {
                        pop.className = 'bubble bubbleHide';
                    } else {

                        App.Maps.hideAllPopupsAndShowSelected(pop, e.target);

                        App.Search.Places.service(reference, function (data) {

                            if (data.formatted_phone_number) {

                                var phone = e.target.querySelector('.callToPlaceBtn');

                                if (phone) {

                                    phone.style.background = 'url("images/call_to_place.png") center center no-repeat';
                                    phone.style.display = 'block';

                                    phone.addEventListener(event, function () {
                                        var call = new MozActivity({
                                            name: "dial",
                                            data: {
                                                number: data.formatted_phone_number
                                            }
                                        });
                                    })
                                }

                            }

                        });
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            }(popover, places[i].reference)));

            popover.appendChild(popUpContent);
            markerEl.appendChild(popover);

            var marker = new ol.Overlay({
                element: markerEl,
                positioning: 'buttom-left',
                stopEvent: false
            });

            marker.setPosition(ll);

            map.addOverlay(marker);

        }

        var o = App.Maps.map.getOverlays();
        var v = App.Maps.map.getView();
        var a = o.getArray();
        var p = [];

        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i].getPosition() && !a[i].currentPosition) {
                p.push(a[i].getPosition())
            }
        }

        var l = p[0][1],
            r = p[0][1],
            t = p[0][0],
            b = p[0][0];

        for (var i = 0, pl = p.length; i < pl; i++) {

            if (l < p[i][1]) {
                l = p[i][1];
            }
            if (r > p[i][1]) {
                r = p[i][1];
            }
            if (t < p[i][0]) {
                t = p[i][0]
            }
            if (b > p[i][0]) {
                b = p[i][0];
            }
        }

        featureMultiLine = new ol.Feature();
        var ml = new ol.geom.LineString([
            [b, l],
            [t, l],
            [t, r],
            [b, r]
        ]);
        v.fitExtent(ml.getExtent(), App.Maps.map.getSize());

    },

    popUpLayout: function (place, latlng) {

        var infoContent = document.createElement('div');
        var infoTextContent = document.createElement('div');
        var infoActionsContent = document.createElement('div');
        var placeName = document.createElement('h1');
        var placeRateNumber = document.createElement('h2');
        var placeRateStars = document.createElement('div');
        var numberOfReviews = document.createElement('div');
        var placeAddress = document.createElement('div');
        var name = place.name || place.formatted_address;
        var lat, lng;

        if (latlng) {
            lat = latlng[1];
            lng = latlng[0];
        } else {
            lat = place.geometry.location[App.GoogleLatKey];
            lng = place.geometry.location[App.GoogleLngKey];
        }

        var streetViewIcon = App.Search.Places.addStreetToMarker(lat, lng, place.formatted_phone_number);
        var callIcon = App.Search.Places.callToPlace(place.formatted_phone_number);
        var routingIcon = App.Search.Places.routing(place);
        var favIcon = App.Search.Places.addFavoriteIcon(lat, lng, place);

        infoContent.id = "infoContent";
        infoTextContent.id = "infoTextContent";
        infoActionsContent.id = "infoActionsContent";
        placeName.id = "placeName";
        placeRateNumber.id = "placeRateNumber";
        placeRateStars.id = "placeRateStarts";
        numberOfReviews.id = "numberOfReviews";
        placeAddress.id = "placeAddress";
        streetViewIcon.id = "streetViewIcon";
        callIcon.id = "callIcon";
        favIcon.id = "favIcon";

        placeName.appendChild(document.createTextNode(name));

        if (place.rating) {
            placeRateNumber.appendChild(document.createTextNode(place.rating));
            placeRateStars.appendChild(App.Search.Places.generateStarts(place.rating));
        }

        if (place.reviews) {
            //numberOfReviews.appendChild(document.createTextNode(place.reviews.length + " reviews"));
        }

        if (place.vicinity) {
            placeAddress.appendChild(document.createTextNode(place.vicinity));
        }

        infoTextContent.appendChild(placeName);
        infoTextContent.appendChild(placeRateNumber);
        infoTextContent.appendChild(placeRateStars);
        infoTextContent.appendChild(numberOfReviews);
        infoTextContent.appendChild(placeAddress);

        infoActionsContent.appendChild(streetViewIcon);
        infoActionsContent.appendChild(routingIcon);
        infoActionsContent.appendChild(favIcon);
        infoActionsContent.appendChild(callIcon);

        infoContent.appendChild(infoTextContent);
        infoContent.appendChild(infoActionsContent);

        return infoContent;


    },
    generateStarts: function (rate) {

        var roundedRate = parseInt(rate);

        var startsContent = document.createElement('div');
        var star;

        for (var i = 1; i < 6; i++) {

            star = document.createElement('img');

            if (i <= roundedRate) {
                star.src = 'images/star_on.png'
            } else {
                star.src = 'images/star_off.png'
            }

            startsContent.appendChild(star);

        }

        return startsContent;

    },
    addStreetToMarker: function (lat, lng, phone) {

        var popUp = document.querySelector('.leaflet-popup-content');
        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';

        var imgStreet = document.createElement('div');
        imgStreet.className = 'streetViewBtn';

        if (phone) {
            imgStreet.style.marginLeft = '0';
        }

        imgStreet.addEventListener(event, (function () {
            return function () {
                App.StreetView.showStreetView(lat, lng)
            }
        }()));

        return imgStreet;

    }, callToPlace: function (phone) {

        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';
        var phoneIcon = document.createElement('div');
        phoneIcon.id = 'callToPlaceIcon';
        phoneIcon.className = 'callToPlaceBtn';

        if (phone) {

            phoneIcon.addEventListener(event, function () {
                var call = new MozActivity({
                    name: "dial",
                    data: {
                        number: phone
                    }
                });
            });

        } else {
            phoneIcon.style.display = 'none';
        }

        return phoneIcon;

    },
    routing: function (info) {

        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';
        var phoneIcon = document.createElement('div');

        phoneIcon.id = 'popUpRoutingIcon';
        phoneIcon.className = 'routingIconBtn';

        phoneIcon.addEventListener(event, function () {

            var position = ol.proj.transform(JSON.parse(localStorage.getItem('lastPosition')), 'EPSG:3857', 'EPSG:4326');
            var lastLat = position[1];
            var lastLng = position[0];


            App.Routing.setOrigin('My Local', lastLat, lastLng);

            if (info.reference) {
                App.Search.Places.service(info.reference, function (data) {

                    App.Routing.setDestiny(
                        data.name,
                        data.geometry.location[App.GoogleLatKey],
                        data.geometry.location[App.GoogleLngKey]
                    );

                    App.Routing.getRoutes();
                });
            } else {
                App.Routing.setDestiny(
                    info.formatted_address,
                    info.geometry.location[App.GoogleLatKey],
                    info.geometry.location[App.GoogleLngKey]
                );

                App.Routing.getRoutes();
            }

            App.Routing.showRoutingPanel();

        });

        return phoneIcon;

    },
    addFavoriteIcon: function (lat, lng, info) {

        var event = navigator.platform === 'MacIntel' ? 'click' : 'touchend';

        var favoriteIcon = document.createElement('div');
        favoriteIcon.className = 'favoriteIcon';

        favoriteIcon.addEventListener(event, (function (lat, lng, info) {
            return function () {

                info.name = prompt("Bookmark name");

                window.favorites.addItem(lat, lng, info);
            };
        }(lat, lng, info)));

        return favoriteIcon;

    }
};
