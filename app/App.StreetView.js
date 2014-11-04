/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 5:44 PM
 */

App.StreetView = App.StreetView || {};

App.StreetView = {
    showStreetView: function (lat, lon) {

        var place = new google.maps.LatLng(lat, lon);
        var el = document.getElementById('streetView');
        var streetContainer = document.getElementById('streetViewContainer');
        var closeBtn = document.getElementById('closeBtnStreetView');
        var giroscopeBtn = document.getElementById('giroscopeBtnStreetView');
        var gmnoprint;

        var panoramaOptions = {
            position: place,
            pov: {
                heading: 165,
                pitch: 0
            },
            addressControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER
            },
            enableCloseButton: false,
            enableZoomButton: false,
            zoom: 1
        };

        var myPano = new google.maps.StreetViewPanorama(
            document.getElementById('streetView'),
            panoramaOptions
        );

        App.StreetView.Pano = myPano;

        myPano.setVisible(true);

        gmnoprint = document.querySelector('.gmnoprint');

        if (gmnoprint) {
            gmnoprint.style.display = 'none';
        }

        streetContainer.style.zIndex = '110';

        closeBtn.addEventListener('click', (function (streetContainer, el) {
            return function () {
                streetContainer.style.zIndex = '-1';
            }
        }(streetContainer, el)));

        giroscopeBtn.addEventListener('click', function () {
            if (App.StreetView.allowGiroscope) {
                App.StreetView.allowGiroscope = false;
                this.style.background = 'url("images/activeGiroscope_off.png") rgba(255,255,255, 0.9) no-repeat center center';

            } else {
                App.StreetView.allowGiroscope = true;
                this.style.background = 'url("images/activeGiroscope_on.png") rgba(255,255,255, 0.9) no-repeat center center';
            }
        })

    },

    addEventListeners: function () {

        window.addEventListener ("deviceorientation", function (e) {

            if (App.StreetView.allowGiroscope) {
                if (App.StreetView.Pano) {
                    App.StreetView.Pano.setPov(
                        {heading: parseInt(e.alpha) - 15, pitch: (parseInt(e.beta + 90) * -1), zoom: 1}
                    )
                }
            }

        });

    }
};

