/**
 * @author Mozart Diniz <mozart.diniz@gmail.com>
 * Date: 7/21/13
 * Time: 2:01 PM
 *
 * Manage user favorites
 *
 */

var App  = App || {};

App.Favorites = (function (){

   var favorites = function () {

       this.data = {};

       this.listContainer = document.createElement('div');
       this.listContainer.className = 'favoritesListContainer';

       this.parsistData = function () {
           localStorage.setItem ('zMapsFavorites', JSON.stringify (this.data));
       };

       this.loadData = function () {

           var storedFavs = localStorage.getItem('zMapsFavorites');

           if (storedFavs) {
               this.data = JSON.parse (storedFavs);
           }

       };

       this.addItem = (function (scope) {

            return function (lat, lng, info) {

                info.address = info.formatted_address || info.vicinity;

                if (!info.id) {
                    info.id = Math.random().toString(36).substring(7);
                    info.geometry.location[App.GoogleLatKey] = lat;
                    info.geometry.location[App.GoogleLngKey] = lng;
                }

                scope.data[info.id] = info;

                scope.render ();

                scope.parsistData ();
            }

       }(this));

       this.removeItem = (function (scope) {

           return function (id) {
               delete scope.data[id];

               scope.render ();

               scope.parsistData ();
           }

       }(this));

       this.addEvents = function () {

           var favBtn = document.getElementById ('clearFavoriteSearchIcon');
           var event = navigator.platform === 'MacIntel' ? 'click' : 'touchstart';

           favBtn.addEventListener (event, (function (scope){
               return function () {
                   scope.toggleList ();
               };
           }(this)));

       };

       this.toggleList = function () {
           if (this.listContainer.style.display === 'block') {
               this.listContainer.style.display = 'none';
           } else {
               this.listContainer.style.display = 'block';
           }
       };

       this.render = function () {

           this.listContainer.innerHTML = '';
           this.listContainer.appendChild (this.renderItemList ());

       };

       this.renderItemList = function () {

           var fragment = document.createDocumentFragment ();

            for (var item in this.data) {
                fragment.appendChild (this.renderItem (this.data[item]));
            }

           return fragment;

       };

       this.renderItem = function (item) {

           var event = navigator.platform === 'MacIntel' ? 'click' : 'touchstart';

           var itemDiv         = document.createElement ('div');
           var favIcon         = document.createElement ('div');
           var itemName        = document.createElement ('div');
           var trashIcon       = document.createElement ('div');

           itemDiv.className   = 'favoritesListItem';
           favIcon.className   = 'favoritesListItemFavIcon';
           trashIcon.className = 'favoritesListItemTrashIcon';
           itemName.className  = 'favoritesListItemName';

           trashIcon.addEventListener (event, (function (scope, item){
               return function (e) {
                   e.stopPropagation();
                   e.preventDefault();
                   scope.removeItem (item.id);
               };
           }(this, item)));

           itemDiv.addEventListener (event, (function (scope, item){
               return function () {
                   scope.toggleList ();
                   App.Search.Prediction.createMarker (item);
               }
           }(this, item)));

           itemName.innerHTML = '<h3>' + item.name + '</h3>' + item.address;

           itemDiv.appendChild(favIcon);
           itemDiv.appendChild(itemName);
           itemDiv.appendChild(trashIcon);

           return itemDiv;

       };

       this.init = function () {
           this.addEvents ();
           document.body.appendChild (this.listContainer);
           this.loadData ();
           this.render ();
       };

   };

   return favorites;

}());

