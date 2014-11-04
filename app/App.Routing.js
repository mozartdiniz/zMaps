var App = App || {};

App.Routing = {

    origin: {
        lat: null,
        lon: null
    },
    destiny: {
        lat: null,
        lon: null
    },

    initialize: function () {

        this.createAnimation ();
        this.addListeners();

    },

    addListeners: function () {

        var closeRouting   = document.getElementById ('routingClose');
        var swap           = document.querySelector ('.swapFields');
        var routingItems   = document.querySelectorAll ('.routingItem');
        var routingOrigin  = document.getElementById ('routingOriginField');
        var routingDestiny = document.getElementById ('routingDestinyField');
        var closeRoutingP  = document.querySelector ('.closeRoutingPath');

        window.addEventListener ('resize', this.adjustAlternativesHeight);
        swap.addEventListener ('click', this.swapFields);
        closeRouting.addEventListener ('click', this.hideRoutingPanel);

        routingOrigin.addEventListener ('keyup', (function (scope) {
            return function () {
                scope.requestPredictions (this, scope);
                scope.checkMyLocal (this, this.value);
            }
        }(this)));

        routingDestiny.addEventListener ('keyup', (function (scope) {
            return function () {
                scope.requestPredictions (this, scope);
                scope.checkMyLocal (this, this.value);
            }
        }(this)));

        closeRoutingP.addEventListener('click', (function (scope){
            return function () {
                scope.hideRoutingPathInterface ();

                var aLayers = App.Maps.map.getLayers().getArray();

                for (var i = aLayers.length-1; i > 4; i--) {
                    App.Maps.map.removeLayer (aLayers[i]);
                }

            }
        }(this)));

        for (var i = 0, l = routingItems.length; i < l; i++) {
            routingItems[i].addEventListener ('click', (function (scope){
                return function (e) {
                    scope.panelBtnEventClick (e, scope);
                }
            }(this)));
        }

    },

    requestPredictions: function (el, scope) {

        var prediction = App.Search.Prediction;

        if (el.value.trim () === "") {
            scope.renderSuggestionList(null, el);
        } else {

            var renderList = (function (target){
                return function (data) {
                    scope.renderSuggestionList(data, target);
                }
            }(el));

            prediction.request (
                el.value,
                prediction.service,
                renderList
            );
        }

    },

    panelBtnEventClick: function (e, scope) {

        scope.setTravelTypeActiveBtn (e);

        var travelMode = e.target.getAttribute('travelMode');

        if (travelMode) {
            scope.getRoutes (
                travelMode,
                scope.renderAlternativesList
            );
        } else {
            scope.clearFields();
            scope.clearRouteList();
        }

    },

    getTravelModel: function () {

        var activeBtn  = document.querySelector('.routingItem[active="true"]');
        var travelMode = 'DRIVING';

        if (activeBtn) {
            return activeBtn.getAttribute("travelMode")
        }

        return false;
    },

    createAnimation: function () {

        var styleEl = document.getElementById ('routingStyle');
        var style   = "";

        var show = "@-moz-keyframes showRoutingPanel {" +
                "from {" +
                    "transform: translateY(" + window.innerHeight + "px);" +
                "}" +
                "to {" +
                    "transform: translateY(0px);" +
                "}" +
            "}";

        var hide = "@-moz-keyframes hideRoutingPanel {" +
                "from {" +
                    "transform: translateY(0px);" +
                "}" +
                "to {" +
                    "transform: translateY(" + window.innerHeight + "px);" +
                "}" +
            "}";

        style += (show + " " + hide);

        styleEl.innerHTML = style;

    },

    showRoutingPanel: function () {

        var routingPanel = document.getElementById ('routing');
        var routingItems = document.querySelectorAll ('.routingItem');

        routingPanel.style.display   = 'block';
        routingPanel.style.animation = 'showRoutingPanel 500ms forwards ease-out';

        for (var i = 0, l = routingItems.length; i < l; i++) {
            if (routingItems[i].id === 'routingCar') {
                routingItems[i].setAttribute('active', 'true');
            } else {
                routingItems[i].setAttribute('active', 'false');
            }
        }

    },

    hideRoutingPanel: function () {

        var routingPanel = document.getElementById ('routing');

        routingPanel.style.display   = 'block';
        routingPanel.style.animation = 'hideRoutingPanel 500ms forwards ease-out';

    },

    adjustAlternativesHeight: function () {

        var routingAlternatives = document.querySelector ('.routeAlternatives');

        routingAlternatives.style.height = (window.innerHeight - 200) + 'px';

    },

    checkMyLocal: function (field, value) {

        var fieldValue = value.trim ().toUpperCase ();

        if (field) {
            if (fieldValue === 'MY LOCAL') {

                field.style.color = 'rgb(98,146,201)';

                return true;

            } else {
                field.style.color = 'rgb(33, 33, 33)';
            }
        }

        return false;

    },

    setOrigin: function (address, lat, lon) {

        App.Routing.origin.lat = lat;
        App.Routing.origin.lon = lon;

        var originField = document.getElementById ('routingOriginField');

        originField.value = address;

        this.checkMyLocal (originField, address);

    },

    setDestiny: function (address, lat, lon) {

        App.Routing.destiny.lat = lat;
        App.Routing.destiny.lon = lon;

        var destinyField = document.getElementById ('routingDestinyField');

        destinyField.value = address;

        this.checkMyLocal (destinyField, address);

    },

    swapFields: function () {

        var originField     = document.getElementById ('routingOriginField');
        var destinyField    = document.getElementById ('routingDestinyField');
        var tempOrigin      = originField.value;
        var tempOringLatLn  = App.Routing.origin;
        var travelMode      = App.Routing.getTravelModel ();

        App.Routing.origin  = App.Routing.destiny;
        App.Routing.destiny = tempOringLatLn;

        App.Routing.getRoutes (travelMode);

        originField.value   = destinyField.value;
        destinyField.value  = tempOrigin;

        App.Routing.checkMyLocal (originField, originField.value);
        App.Routing.checkMyLocal (destinyField, destinyField.value);

    },

    setTravelTypeActiveBtn: function (e) {

        var routingItems = document.querySelectorAll ('.routingItem');

        for (var i = 0, l = routingItems.length; i < l; i++) {
            if (routingItems[i].id === e.target.id) {
                routingItems[i].setAttribute('active', 'true');
            } else {
                routingItems[i].setAttribute('active', 'false');
            }
        }

    },

    clearFields: function () {

        var routingOriginField  = document.getElementById ('routingOriginField');
        var routingDestinyField = document.getElementById ('routingDestinyField');

        routingOriginField.value  = '';
        routingDestinyField.value = '';
    },

    clearRouteList: function () {

        var routesContainer     = document.getElementById ('routeAlternatives');

        routesContainer.innerHTML = '';

    },

    getRoutes: function (tavelMode) {

        var tm = tavelMode || 'DRIVING';

        this.clearRouteList();

        App.Directions.service (
            this.origin, this.destiny, tm, this.renderAlternativesList
        )

    },

    renderAlternativesList: function (data) {

        var routeAlternative,
            routeDescription,
            routeDistance,
            description,
            fragment        = document.createDocumentFragment (),
            routesContainer = document.getElementById ('routeAlternatives'),
            routes          = data.routes,
            dataLength      = routes.length;

        for (var i=0; i < dataLength; i++) {

            routeAlternative = document.createElement ('div');
            routeDescription = document.createElement ('div');
            routeDistance    = document.createElement ('div');

            routeAlternative.className = 'routeAlternative';
            routeDescription.className = 'routeDescription';
            routeDistance.className    = 'routeDistance';

            routeAlternative.addEventListener ('click', (function (i){
                return function () {
                    App.Routing.showRoutingPathInterface (i);
                    App.Routing.drawRountingPath (i, true);
                }
            }(i)));

            description = routes[i].summary + ' ' + routes[i].legs[0].distance.text;

            routeDescription.appendChild (document.createTextNode (description));
            routeDistance.appendChild (document.createTextNode (routes[i].legs[0].duration.text));

            routeAlternative.appendChild (routeDescription);
            routeAlternative.appendChild (routeDistance);

            fragment.appendChild (routeAlternative);

        }

        routesContainer.appendChild (fragment);

        App.Directions.lastRoutes = data;

    },

    removeSuggestionList: function (target) {

        var parent      = target.parentNode;
        var currentList = document.querySelector('.routeSuggestions');

        if (currentList) {
            parent.removeChild(currentList);
        }

    },

    renderSuggestionList: function (data, target) {


        var result           = data,
            parent           = target.parentNode,
            routeSuggestions = document.createElement('div'),
            suggestion;

        this.removeSuggestionList (target);

        routeSuggestions.className = 'routeSuggestions';

        suggestion = document.createElement('div');

        suggestion.className = 'suggestion';
        suggestion.innerHTML = 'My Local';
        suggestion.style.color = 'rgb(98,146,201)';

        suggestion.addEventListener ('click', (function (target, scope) {

            return function () {

                var position = ol.proj.transform(JSON.parse(localStorage.lastPosition), 'EPSG:3857', 'EPSG:4326');
                var lastLat = position[1];
                var lastLng = position[0];

                var nameSpace = '';

                if (target.id === 'routingOriginField') {
                    nameSpace = 'setOrigin';
                } else {
                    nameSpace = 'setDestiny';
                }

                App.Routing[nameSpace] (
                    'My Local',
                    lastLat,
                    lastLng
                );

                scope.removeSuggestionList (target);

                App.Routing.getRoutes ();

            }

        }(target, this)));

        routeSuggestions.appendChild (suggestion);

        if (data) {
            for (var i= 0, resultLength = result.length; i < resultLength; i++) {

                suggestion = document.createElement('div');

                suggestion.className = 'suggestion';
                suggestion.innerHTML = result[i].description;

                suggestion.addEventListener ('click', (function (info, target, scope){
                    return function () {

                        App.Search.Places.service (info.reference, function (data) {

                            var nameSpace = '';

                            if (target.id === 'routingOriginField') {
                                nameSpace = 'setOrigin';
                            } else {
                                nameSpace = 'setDestiny';
                            }

                            App.Routing[nameSpace] (
                                data.name,
                                data.geometry.location[App.GoogleLatKey],
                                data.geometry.location[App.GoogleLngKey]
                            );

                            scope.removeSuggestionList (target);

                            App.Routing.getRoutes ();

                        });

                    }
                }(result[i], target, this)));

                routeSuggestions.appendChild (suggestion);

            }

            parent.appendChild(routeSuggestions);
        }

    },

    showRoutingPathInterface: function (i) {

        App.Routing.hideRoutingPanel ();
        App.Maps.clearMarkers ();

        var routes          = App.Directions.lastRoutes.routes;
        var routingInfo     = document.querySelector ('div.routingInfo');
        var alternativeInfo = document.querySelector ('div.alternativeInfo');
        var lockPosition    = document.getElementById ('lockPosition');
        var changeLayer     = document.getElementById ('changeLayer');
        var originInfo      = document.querySelector ('div.originInfo');
        var destinyIcon     = document.querySelector ('div.destinyIcon');
        var originField     = document.getElementById ('routingOriginField');
        var destinyField    = document.getElementById ('routingDestinyField');
        var travelModeIcon  = document.querySelector ('div.travelMode');
        var travelMode      = App.Routing.getTravelModel ();
        var description     = routes[i].summary + ' ' +
                              routes[i].legs[0].distance.text + ' <strong>(' +
                              routes[i].legs[0].duration.text + ')</strong>';

        originInfo.innerHTML      = originField.value;
        destinyIcon.innerHTML     = destinyField.value;
        alternativeInfo.innerHTML = description;

        travelModeIcon.className = 'travelMode ' + travelMode;

        routingInfo.style.display     = 'block';
        alternativeInfo.style.display = 'block';
        lockPosition.style.bottom     = '70px';
        changeLayer.style.bottom      = '70px';

    },

    hideRoutingPathInterface: function () {

        var routingInfo     = document.querySelector('div.routingInfo');
        var alternativeInfo = document.querySelector('div.alternativeInfo');
        var lockPosition    = document.getElementById('lockPosition');
        var changeLayer     = document.getElementById('changeLayer');

        routingInfo.style.display     = 'none';
        alternativeInfo.style.display = 'none';
        lockPosition.style.bottom     = '10px';
        changeLayer.style.bottom      = '10px';

        App.Maps.clearMarkers();

    },

    drawRountingPath: function (index, fitToBound) {

        var lPoints,
            map = App.Maps.map,
            routes = App.Directions.lastRoutes.routes,
            alternativeInfoEl = document.querySelector ('.alternativeInfo'),
            first = false,
            second = false;

        if (typeof fitToBound === 'undefined') {
            fitToBound = true;
        }

        App.Maps.createSecondLayerRoute ();
        App.Maps.createFirstLayerRoute ();
        App.Maps.createSelectedLayerRoute ();

        alternativeInfoEl.innerHTML = routes[index].summary + ' ' +
            routes[index].legs[0].distance.text + ' <strong>(' +
            routes[index].legs[0].duration.text + ')</strong>';

        for (var i= 0, routesLength = routes.length; i < routesLength; i++) {

            lPoints = [];

            for (var j= 0, overviewsLength = routes[i].overview_path.length; j < overviewsLength; j++) {

                lPoints.push (ol.proj.transform([
                    routes[i].overview_path[j][App.GoogleLngKey],
                    routes[i].overview_path[j][App.GoogleLatKey]
                ], 'EPSG:4326', 'EPSG:3857'));

            }

            if (i === index) {

                var llOrigin = ol.proj.transform(
                    [routes[i].legs[0].start_location[App.GoogleLngKey], routes[i].legs[0].start_location[App.GoogleLatKey]],
                    'EPSG:4326',
                    'EPSG:3857'
                );

                var oEl    = document.createElement('div');

                oEl.className = 'markerOriginRoutePath';

                var oMarker = new ol.Overlay({
                    element: oEl,
                    positioning: 'buttom-left',
                    stopEvent: false
                });

                oMarker.setPosition (llOrigin);

                map.addOverlay (oMarker);

            } else {

                var llDest = ol.proj.transform(
                    [routes[i].legs[0].end_location[App.GoogleLngKey], routes[i].legs[0].end_location[App.GoogleLatKey]],
                    'EPSG:4326',
                    'EPSG:3857'
                );

                var dEl    = document.createElement('div');

                dEl.className = 'markerDestinyRoutePath';

                var dMarker = new ol.Overlay({
                    element: dEl,
                    positioning: 'buttom-left',
                    stopEvent: false
                });

                dMarker.setPosition (llDest);

                map.addOverlay (dMarker);

            }

            if (i === index) {

                featureMultiLine = new ol.Feature();
                ml = new ol.geom.MultiLineString([lPoints]);
                featureMultiLine.setGeometry(ml);
                featureMultiLine.set ('index', i);
                s = App.Maps.selectedRoute.getSource();
                s.addFeatures([featureMultiLine]);

            } else if (!first){

                featureMultiLine = new ol.Feature();
                ml = new ol.geom.MultiLineString([lPoints]);
                featureMultiLine.setGeometry(ml);
                featureMultiLine.set ('index', i);
                s = App.Maps.firstAlternativeRoute.getSource();
                s.addFeatures([featureMultiLine]);

                first = true;

            } else {

                featureMultiLine = new ol.Feature();
                ml = new ol.geom.MultiLineString([lPoints]);
                featureMultiLine.setGeometry(ml);
                featureMultiLine.set ('index', i);
                s = App.Maps.secondAlternativeRoute.getSource();
                s.addFeatures([featureMultiLine]);

                second = true;

            }

        }

        if (fitToBound) {
            s = App.Maps.selectedRoute.getSource ();
            ex = s.b.a.extent;
            view = App.Maps.map.getView ();
            view.fitExtent (ex, App.Maps.map.getSize ());
            view.setZoom (view.getZoom ());
        }

    }

};