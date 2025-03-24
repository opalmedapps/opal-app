(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('MapController', MapController);

    MapController.$inject = ['NavigatorParameters','UserPreferences','Browser'];

    /* @ngInject */
    function MapController(NavigatorParameters, UserPreferences, Browser) {
        var vm = this;
        var language;

        vm.openMap = openMap;

        activate();

        ///////////////////////

        function activate(){

            vm.my_map=NavigatorParameters.getParameters();
            language = UserPreferences.getLanguage().toUpperCase();

            if(language === 'EN')
            {
                vm.name=vm.my_map.MapName_EN;
                vm.description=vm.my_map.MapDescription_EN;
            } else {
                vm.name=vm.my_map.MapName_FR;
                vm.description=vm.my_map.MapDescription_FR;
            }
        }

        function openMap(){
            Browser.openInternal(vm.my_map.MapUrl, true);
        }
    }
})();
