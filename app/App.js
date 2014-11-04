/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 2:01 PM
 */

var App = App || {};

App.init = function () {

    // Set open layers draw method, I used canvas because is most performatic than dom
    // and has better support than webGL
    App.GLOBALS = {
        renderer: "canvas",
        compassAngle: -360
    };

    /*
    These are default initial info for main map
     */
    var centerForReference = [ -4290062.644792909, -414416.66895491537 ];
    var convertedCenter    = ol.proj.transform(centerForReference, 'EPSG:3857', 'EPSG:4326');
    var location           = new google.maps.LatLng (convertedCenter[1], convertedCenter[0]);

    /*
     These two lines look like litte bit strange but I will explain.
     I use Google Maps API just to get info and I put all information in a OpenLayers map, the problem is,
     sometimes Google change the key where the latitude and longitude are stored, so I made this implementation
     as guaranty that my code don't broke again when Google change.
     */
    App.GoogleLatKey = Object.keys(location)[0];
    App.GoogleLngKey = Object.keys(location)[1];

    // initialize Map
    App.Maps.Init ();

    // Create geolocation base element
    App.Geo.getLocation ();

    // Add listeners to search field
    App.Search.addEventListeners ();

    // Add listeners do prediction to search field
    App.Search.Prediction.addEventListeners ();

    // Add geolocation listeners do lock positions and compass icons.
    App.Geo.addEventListeners ();

    App.StreetView.addEventListeners ();
    App.Routing.initialize ();

    // Create all change layer interface and add all listeners.
    var mapLayer = new App.Maps.ChangeLayer();

    // Set to user gyroscope as false by default
    App.StreetView.allowGiroscope = false;

    mapLayer.init ();

    // Adjust element sizes to fit in screen
    function show() {

        var el              = document.getElementById('streetView');
        var streetContainer = document.getElementById('streetViewContainer');

        el.style.height = window.innerHeight + 'px';
        streetContainer.style.height = window.innerHeight + 'px';
    }

    // Recalculate sizer on resize window.
    window.addEventListener("resize", show, false);

    show();

    var getPosition = function (position) {

        var view = App.Maps.map.getView ();
        var positionCoords = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', 'EPSG:3857');

        if (position.coords) {
            localStorage.setItem ('lastPosition', JSON.stringify (positionCoords));
        }

        App.Maps.lastPosition = positionCoords;

        App.Geo.currentPositionMarker.setPosition (positionCoords);
        App.Geo.currentAccurcyMarker.setPosition (positionCoords);

        App.Geo.accuracySize (position.coords.accuracy, App.Geo.currentAccurcyMarker.getElement ());

        if (App.Maps.mustLockPosition) {
            view.setCenter (positionCoords);
        }


    };

    navigator.geolocation.getCurrentPosition(getPosition);

    navigator.geolocation.watchPosition(
        getPosition,
        function (error) {
            console.log (error);
        },
        { enableHighAccuracy: true }
    );

};
