/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 2:01 PM
 */

var App  = App || {};
App.Maps = App.Maps || {};

App.Maps = {
    Init : function () {

        var mapContainer, map, lat, lon,
            searchBox   = document.getElementById('searchBox'),
            searchField = document.getElementById('searchField'),
            clearField  = document.getElementById('clearField'),
            favoriteBtn = document.getElementById('clearFavoriteSearchIcon'),
            addressSearchResult = document.getElementById('searchResult');

        App.Maps.mustLockPosition = false;
        App.Maps.mustRotate = false;
        App.Maps.globalZIndex = 10;

        mapContainer = document.getElementById('map');

        if (typeof lastLat !== 'undefined') {

            lat = lastLat;
            lon = lastLon;

        } else {

            lat = -3.7191666667;
            lon = -38.5438888889;
        }

        map = new ol.Map({
            layers: [
                //streets
                // 0
                new ol.layer.Tile({
                    preload: 4,
                    source: new ol.source.OSM({
                        url: 'http://mt1.google.com/vt/lyrs=m@146&hl=en&x={x}&y={y}&z={z}'
                    })
                }),
                //traffic
                // 1
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt1.googleapis.com/vt?lyrs=m@226070730,traffic&src=apiv3&hl=en-US&x={x}&y={y}&z={z}&apistyle=s.t:49|s.e:g|p.h:#ff0022|p.s:60|p.l:-20,s.t:50|p.h:#2200ff|p.l:-40|p.v:simplified|p.s:30,s.t:51|p.h:#f6ff00|p.s:50|p.g:0.7|p.v:simplified,s.t:6|s.e:g|p.s:40|p.l:40,s.t:49|s.e:l|p.v:on|p.s:98,s.t:19|s.e:l|p.h:#0022ff|p.s:50|p.l:-10|p.g:0.9,s.t:65|s.e:g|p.h:#ff0000|p.v:on|p.l:-70&style=59,37|smartmaps'
                    })
                }),
                //Bicycling
                // 2
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt1.google.com/vt/lyrs=m@121,bike&hl=en&x={x}&y={y}&z={z}'
                    })
                }),
                //Transit
                // 3
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://mt1.google.com/vt/lyrs=m@121,transit|vm:1&hl=en&opts=r&x={x}&y={y}&z={z}'
                    })
                }),
                //aerialLand
                // 4
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'https://khms0.googleapis.com/kh?v=142&hl=en-US&x={x}&y={y}&z={z}'
                    })
                }),
                //aerielStreets
                // 5
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'https://mts1.google.com/vt/lyrs=h@245180971&hl=pt-BR&src=app&x={x}&y={y}&z={z}&s=Galileo'
                    })
                })

            ],
            renderer: App.GLOBALS.renderer,
            target: 'map',
            view: new ol.View({
                center: ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'),
                zoom: 16
            })

        });

        var displayFeatureInfo = function(pixel) {

            var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });

            if (feature) {
                console.log (feature);
                App.Routing.drawRountingPath (feature.getProperties('index').index, false);
            }

        };

        if (localStorage.lastPosition) {
            var view = map.getView ();
            view.setCenter (JSON.parse (localStorage.lastPosition));
        }

        App.Maps.map = map;
        App.Maps.ajustMapPosition ();
        App.Geo.getLocation ();

        //Add event listeners

        mapContainer.addEventListener('click', (function(searchField){
            return function () {
                searchField.blur();
            }
        }(searchField)));

        document.addEventListener('DOMContentLoaded', function () {

            searchField.style.width = (window.innerWidth - 124) + 'px';

        });

        window.addEventListener('resize', function () {

            mapContainer              = document.getElementById('map');
            mapContainer.style.width  = window.innerWidth + 'px';
            mapContainer.style.height = window.innerHeight + 'px';

        });

        searchField.addEventListener('focus', (function (clearField, favoriteBtn){
            return function () {
                clearField.style.display = 'block';
            }
        }(clearField, favoriteBtn)));

        clearField.addEventListener('click', (function (searchField, clearField, addressSearchResult, favoriteBtn) {
            return function () {
                searchField.value = '';
                clearField.style.display = 'none';
                addressSearchResult.style.display = 'none';
                App.Maps.clearMarkers ();
            }
        }(searchField, clearField, addressSearchResult, favoriteBtn)));

        searchField.addEventListener('blur', (function (clearField, searchField){
            return function () {
                if (searchField.value.trim() === '') {
                    clearField.style.display = 'none';
                }
            }
        }(clearField, searchField)));

        window.addEventListener('resize', function () {
            searchField.style.width = (window.innerWidth - 124) + 'px';

            App.Maps.ajustMapPosition ();
        });

        map.on('click', function (e) {

            App.Maps.hideAllPopupsAndShowSelected (e);
            displayFeatureInfo (e.pixel);

        });

        window.timeoutId = -1;
        window.startCoordinate = null;
        window.startCenter = null;

        map.getViewport().addEventListener('touchstart', function (e){

            clearTimeout(window.timeoutId);
            window.startCoordinate = map.getEventCoordinate(e);
            window.startCenter = App.Maps.map.getView().getCenter();
            window.timeoutId = setTimeout((function(e) {
                return function () {
                    var currentCenter = App.Maps.map.getView().getCenter();

                    if (currentCenter[0] === window.startCenter[0] && currentCenter[1] === window.startCenter[1]) {
                        var coordinate = ol.proj.transform (window.startCoordinate, 'EPSG:3857', 'EPSG:4326');
                        var reverseGeocode = new App.Maps.Geocoder();
                        reverseGeocode.getPositionInfo (coordinate[1], coordinate[0], coordinate);
                    }

                };
            }(e)), 300, false);
        });

        map.getViewport().addEventListener('touchend', function (e){

            clearTimeout(window.timeoutId);
            window.startCoordinate = null;
            window.startCenter = null;

        });

        window.favorites = new App.Favorites ();
        window.favorites.init ();

    },

    clearMarkers : function () {

        var overlays = App.Maps.map.getOverlays().getArray();
        var map = App.Maps.map;

        for (var l = overlays.length; l > 0; l--) {

            if (overlays[l-1] && !overlays[l-1].currentPosition) {
                map.removeOverlay (overlays[l-1]);
            }
        }

    },

    hideAllPopupsAndShowSelected : function (pop, marker) {

        var pops = document.querySelectorAll ('.bubble');

        for (var i = 0, l = pops.length; i<l; i++) {
            pops[i].className = 'bubble bubbleHide';
        }

        if (marker){

            App.Maps.globalZIndex += 1;

            pop.className = 'bubble bubbleShow';
            marker.style.zIndex = App.Maps.globalZIndex;
        }

    },

    ajustMapPosition : function () {

        var wHeight = window.innerHeight;
        var mapInnerDiv = document.querySelector ('#map > div');
        var mapContainer = document.getElementById('map');

        mapInnerDiv.style.marginTop = '0px';


        mapContainer.style.width  = window.innerWidth + 'px';
        mapContainer.style.height = window.innerHeight + 'px';
        mapContainer.style.height = window.innerHeight + 'px';

        App.Maps.map.updateSize();

    },

    createSelectedLayerRoute : function () {

        App.Maps.selectedRoute = new ol.layer.Vector({
            source: new ol.source.Vector({}),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,153,255,0.6)',
                    width: 4
                })
            })
        });

        App.Maps.map.addLayer (App.Maps.selectedRoute);

    },

    removeSelectedLayerRoute : function () {
        App.Maps.map.removeLayer (App.Maps.selectedRoute);
    },

    createFirstLayerRoute : function () {

        App.Maps.firstAlternativeRoute = new ol.layer.Vector({
            source: new ol.source.Vector({}),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(237,144,57,1)',
                    width: 4
                })
            })
        });

        App.Maps.map.addLayer (App.Maps.firstAlternativeRoute);

    },

    removeFirstLayerRoute : function () {
        App.Maps.map.removeLayer (App.Maps.firstAlternativeRoute);
    },

    createSecondLayerRoute : function () {

        App.Maps.secondAlternativeRoute = new ol.layer.Vector({
            source: new ol.source.Vector({}),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(237,144,57,1)',
                    width: 4
                })
            })
        });

        App.Maps.map.addLayer (App.Maps.secondAlternativeRoute);

    },

    removeSecondLayerRoute : function () {
        App.Maps.map.removeLayer (App.Maps.secondAlternativeRoute);
    }
};