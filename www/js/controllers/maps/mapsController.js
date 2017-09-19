(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('MapController', MapController);

    MapController.$inject = ['NavigatorParameters','UserPreferences'];

    /* @ngInject */
    function MapController(NavigatorParameters,UserPreferences) {
        var vm = this;
        var language;

        vm.openMap = openMap;

        activate();

        ///////////////////////

        function activate(){
            console.log('here');


            vm.map=NavigatorParameters.getParameters();
            language = UserPreferences.getLanguage().toUpperCase();

            if(language === 'EN')
            {
                vm.name=vm.map.MapName_EN;
                vm.description=vm.map.MapDescription_EN;
            } else {
                vm.name=vm.map.MapName_FR;
                vm.description=vm.map.MapDescription_FR;
            }
        }

        function openMap(){
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app)
            {
                var ref = cordova.InAppBrowser.open(vm.map.MapUrl, '_blank', 'EnableViewPortScale=yes');
            } else {
                window.open(vm.map.MapUrl);
            }
        }
    }
})();