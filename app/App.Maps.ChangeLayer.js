/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/26/13
 * Time: 6:59 AM
 */

var App  = App || {};
App.Maps = App.Maps || {};

App.Maps.ChangeLayer = function () {

  this.createInterface = function () {

      this.layerContainer = document.getElementById ('layersContainer');
      this.changeLayerBtn = document.getElementById ('changeLayer');
      this.changeLayerIco = document.querySelector ('#changeLayer img');
      this.map            = document.getElementById ('map');
      this.searchField    = document.getElementById ('searchField');
      this.clearField     = document.getElementById ('clearField');
      this.routingInfo    = document.querySelector ('div.routingInfo');
      this.alternativeInf = document.querySelector ('div.alternativeInfo');
      this.lockRotation   = document.getElementById ('lockOrientation');
      this.favIcon        = document.getElementById ('clearFavoriteSearchIcon');

  };

  this.addListeners = function () {

      var layerBtn     = document.getElementById('changeLayer');

      //street
      var check0 = document.getElementById ('layerStreetItem');
      //traffic
      var check1 = document.getElementById ('layerTrafficItem');
      //bike
      var check2 = document.getElementById ('layerBikeItem');
      //transit
      var check3 = document.getElementById ('layerTransitItem');
      //stallite
      var check4 = document.getElementById ('layerStalliteItem');

      var setLayerVisible = function (index, visibility) {

          App.Maps.map.getLayers().forEach(function(layer, i) {
              if (index === i) {
                  layer.setVisible (visibility);
              }
          });

      };

      check0.addEventListener('click', (function (setLayerVisible, scope) {

          return function () {
              setLayerVisible (0, true);
              setLayerVisible (1, false);
              setLayerVisible (2, false);
              setLayerVisible (3, false);
              setLayerVisible (4, false);
              setLayerVisible (5, false);

              scope.toggleLayerContainer (scope);
          }


      }(setLayerVisible, this)));

      check1.addEventListener('click', (function (setLayerVisible, scope) {

          return function () {
              setLayerVisible (0, false);
              setLayerVisible (1, true);
              setLayerVisible (2, false);
              setLayerVisible (3, false);
              setLayerVisible (4, false);
              setLayerVisible (5, false);

              scope.toggleLayerContainer (scope);
          }

      }(setLayerVisible, this)));

      check2.addEventListener('click', (function (setLayerVisible, scope) {

          return function () {
              setLayerVisible (0, false);
              setLayerVisible (1, false);
              setLayerVisible (2, true);
              setLayerVisible (3, false);
              setLayerVisible (4, false);
              setLayerVisible (5, false);

              scope.toggleLayerContainer (scope);
          }

      }(setLayerVisible, this)));

      check3.addEventListener('click', (function (setLayerVisible, scope) {

          return function () {
              setLayerVisible (1, false);
              setLayerVisible (2, false);
              setLayerVisible (0, false);
              setLayerVisible (3, true);
              setLayerVisible (4, false);
              setLayerVisible (5, false);

              scope.toggleLayerContainer (scope);
          }

      }(setLayerVisible, this)));

      check4.addEventListener('click', (function (setLayerVisible, scope) {

          return function () {
              setLayerVisible (1, false);
              setLayerVisible (2, false);
              setLayerVisible (0, false);
              setLayerVisible (3, false);
              setLayerVisible (4, true);
              setLayerVisible (5, true);

              scope.toggleLayerContainer (scope);
          }

      }(setLayerVisible, this)));

      setLayerVisible (0, true);
      setLayerVisible (1, false);
      setLayerVisible (2, false);
      setLayerVisible (3, false);
      setLayerVisible (4, false);
      setLayerVisible (5, false);

      layerBtn.addEventListener('click', (function(scope){
          return function () {
              scope.toggleLayerContainer (scope);
          }
      }(this)));

  };

  this.toggleLayerContainer = function (scope) {

      if (scope.layerContainer.getAttribute('visible') == 'true') {

          // This is the code that hide layer!!!

          scope.layerContainer.style.animation = 'hideLayers 500ms forwards ease-out';
          scope.map.style.animation            = 'hideLayers 500ms forwards ease-out';
          scope.searchField.style.animation    = 'hideLayers 500ms forwards ease-out';
          scope.clearField.style.animation     = 'hideLayers 500ms forwards ease-out';
          scope.changeLayerBtn.style.animation = 'hideLayers 500ms forwards ease-out';
          scope.routingInfo.style.animation    = 'hideLayers 500ms forwards ease-out';
          scope.alternativeInf.style.animation = 'hideLayers 500ms forwards ease-out';
          scope.lockRotation.style.animation   = 'hideLayers 500ms forwards ease-out';
          scope.favIcon.style.animation        = 'hideLayers 500ms forwards ease-out';

          scope.layerContainer.setAttribute('visible', false);
          scope.changeLayerIco.src = 'images/layers_ico.png';

      } else {

          // This is the code that show layer!!! Stop to get confused!
          scope.layerContainer.style.animation = 'showLayers 500ms forwards ease-out';
          scope.map.style.animation            = 'showLayers 500ms forwards ease-out';
          scope.searchField.style.animation    = 'showLayers 500ms forwards ease-out';
          scope.clearField.style.animation     = 'showLayers 500ms forwards ease-out';
          scope.changeLayerBtn.style.animation = 'showLayers 500ms forwards ease-out';
          scope.routingInfo.style.animation    = 'showLayers 500ms forwards ease-out';
          scope.alternativeInf.style.animation = 'showLayers 500ms forwards ease-out';
          scope.lockRotation.style.animation   = 'showLayers 500ms forwards ease-out';
          scope.favIcon.style.animation        = 'showLayers 500ms forwards ease-out';

          scope.layerContainer.setAttribute('visible', true);
          scope.changeLayerIco.src = 'images/layers_ico_on.png';

      }

  };

  this.init = function () {

      this.createInterface ();
      this.addListeners ();

  }

};