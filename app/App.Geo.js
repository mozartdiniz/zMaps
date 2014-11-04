/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 2:06 PM
 */

var App = App || {};
App.Geo = {

    addEventListeners : function () {

        var lockPoImg       = document.querySelector('#lockPosition img');
        var lockOrientation = document.querySelector('#lockOrientation img');
        var event           = navigator.platform === 'MacIntel' ? 'click' : 'touchstart';

        lockPoImg.addEventListener (event, App.Geo.lockPosition);

        lockOrientation.addEventListener (event, function (e){

            var el       = e.target;
            var isLocked = el.getAttribute ('lock');
            var view     = App.Maps.map.getView ();

            if (isLocked === 'true') {

                el.setAttribute ('lock', 'false');
                el.src = 'images/lock_orientation.png';

                view.setRotation (0);

                App.Maps.map.updateSize ();

                App.Maps.mustRotate = false;

            } else {

                el.setAttribute ('lock', 'true');
                el.src = 'images/lock_orientation_on.png';

                App.Maps.map.updateSize ();

                App.Maps.mustRotate = true;

            }

        })

    },

    accuracySize : function (accuracy, el) {

        var size = accuracy * 2 / App.Maps.map.getView().getResolution () + 'px';

        el.style.width = size;
        el.style.height = size;

    },

    getLocation : function () {

        var map = App.Maps.map;
        var geolocation = new ol.Geolocation();
        var markerEl    = document.createElement('div');
        var accuracyEl  = document.createElement('div');

        markerEl.className = 'currentPositionMarker';
        accuracyEl.className = 'accuracyIcon';

        geolocation.bindTo ('projection', map.getView ());

        var marker = new ol.Overlay({
            element: markerEl,
            positioning: 'buttom-left',
            stopEvent: false
        });

        var accuracy = new ol.Overlay({
            element: accuracyEl,
            positioning: 'buttom-left',
            stopEvent: false
        });

        marker.currentPosition = true;
        accuracy.currentPosition = true;

        map.addOverlay (accuracy);
        map.addOverlay (marker);

        App.Geo.currentPositionMarker = marker;
        App.Geo.currentAccurcyMarker  = accuracy;

        geolocation.on('error', function(error) {
            var info = document.getElementById('info');
            info.innerHTML = error.message;
            info.style.display = '';
        });

        map.on ('touchmove', function (){

            if (App.Maps.mustLockPosition) {

                var lockPosition = document.querySelector ('#lockPosition > img');

                lockPosition.setAttribute('lock', 'false');
                lockPosition.src = 'images/lock_position.png';

                App.Maps.mustLockPosition = false;

            }

        });

        map.getView ().on ('change:resolution', (function (geolocation, accuracyEl) {
            return function () {
                App.Geo.accuracySize (geolocation.getAccuracy(), accuracyEl);
            }
        }(geolocation, accuracyEl)));

        geolocation.setTracking (true);

        window.addEventListener("deviceorientation", (function (view) {
            return function( event ) {

                if (App.Maps.mustRotate) {
                    var rotateDegrees = Math.PI / (App.GLOBALS.compassAngle / parseInt (event.alpha) / 2) - 12  ;
                    view.setRotation (rotateDegrees);
                }
            };
        }(map.getView ())), false);

    },

    changeTrackInfo : function (geo) {

        var map       = App.Maps.map;
        var view      = App.Maps.map.getView ();
        var latlng    = ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
        var pan       = ol.animation.pan ({
            duration: 2000,
            source: latlng
        });

    },

    lockPosition : function (e) {

        var el       = e.target;
        var isLocked = el.getAttribute('lock');
        var view     = App.Maps.map.getView();

        if (isLocked == 'true') {

            el.setAttribute('lock', 'false');
            el.src = 'images/lock_position.png';

            App.Maps.mustLockPosition = false;

        } else {
            el.setAttribute('lock', 'true');
            el.src = 'images/lock_position_on.png';

            App.Maps.mustLockPosition = true;

            view.setCenter (App.Maps.lastPosition);

        }

        e.stopPropagation();

    }

};