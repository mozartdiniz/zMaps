var App  = App || {};
App.Geo = App.Geo || {};

App.Maps.Geocoder = function () {

    this.geocoder = new google.maps.Geocoder();

    /**
     * @params {lat, lng}
     */
    this.getPositionInfo = (function (scope) {

        return function (lng, lat, clickedPosition) {

            var latlng = new google.maps.LatLng (lng, lat);

            scope.geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        scope.showPopup(results[1], clickedPosition);
                    } else {
                        scope.showPopup('No results found');
                    }
                } else {
                    scope.showPopup('Geocoder failed due to: ' + status);
                }
            });
        }

    }(this));

    this.showPopup = function (info, clickedPosition) {

        var popover      = document.createElement('div');
        var popUpContent = App.Search.Places.popUpLayout (info, clickedPosition);
        var map          = App.Maps.map;

        popover.className = 'bubble bubbleShow geocodeBuble';
        popover.appendChild(popUpContent);

        var marker = new ol.Overlay({
            element: popover,
            positioning: 'buttom-left',
            stopEvent: true
        });

        marker.setPosition (window.startCoordinate);

        map.addOverlay (marker);

    };

};