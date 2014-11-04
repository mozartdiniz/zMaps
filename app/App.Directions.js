/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 8/6/13
 * Time: 4:18 AM
 */

var App = App || {};

App.Directions = {

    lastRoutes: null,

    // Calls Google's routing service
    service: function (origin, destiny, travelMode, callback) {

        var directionsService = new google.maps.DirectionsService();

        var origem = new google.maps.LatLng(origin.lat, origin.lon);
        var destino = new google.maps.LatLng(destiny.lat, destiny.lon);

        var conf = {
            origin: origem,
            destination: destino,
            travelMode: travelMode,
            provideRouteAlternatives: true
        };

        directionsService.route (conf, callback);

    }

};