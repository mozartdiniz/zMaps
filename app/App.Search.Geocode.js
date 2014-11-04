/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 2:01 PM
 */

var App = App || {};
App.Search = App.Search || {};

App.Search = {
    Geocode : function () {

        var gGeocoder = new google.maps.Geocoder();
        var address   = document.getElementById('searchField').value;

        if (address.length > 3) {
            gGeocoder.geocode({
                'address' : address
            }, function(results, status) {

                if (status == google.maps.GeocoderStatus.OK) {
                    App.Search.renderGeocodeList(results);
                } else {
                    console.log(status);
                }

            });
        }

    },
    requestGeocode : function () {

        if (typeof geocodeTimer !== "undefined") {
            clearTimeout(geocodeTimer);
        }

        var ms = 750;

        geocodeTimer = setTimeout(function () {

            App.Search.Geocode ();

        }, ms);

    },

    addEventListeners : function () {

        var el = document.getElementById("searchField");

        el.addEventListener('keyup', App.Search.requestGeocode);

    },

    renderGeocodeList : function (data) {

        App.Search.lastResult = data;

        var result       = data;
        var resultLength = result.length;
        var list         = document.getElementById ('searchResult');
        var addressList  = document.getElementById ('addressSearchResult');

        var ul, li, streetView, divAddress;

        ul = document.createElement('ul');

        for (var i=0; i<resultLength; i++) {

            li = document.createElement('li');
            divAddress = document.createElement('div');

            divAddress.innerHTML = result[i].formatted_address;

            li.appendChild(divAddress);

            divAddress.addEventListener('click', (function (lat, lon, list, info){
                return function () {

                    list.style.display = 'none';
                    App.Search.createMarker(lat, lon, info);

                    var latlng    = new L.LatLng(lat, lon);

                    App.Maps.map.setView(latlng, App.Maps.map.getZoom());

                }
            }(result[i].geometry.location[App.GoogleLatKey], result[i].geometry.location[App.GoogleLngKey], list, result[i].formatted_address)));

            ul.appendChild(li);

        }

        list.scrollTop = 0;

        list.style.display = 'block';

    }
};