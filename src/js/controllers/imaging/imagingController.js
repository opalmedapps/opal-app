/*
 * Filename     :   imagingController.js
 * Description  :   Manages the imaging view.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   2021
 */

/**
 * @ngdoc controller
 * @name MUHCApp.controller:ImagingController
 * @requires Radiotherapy -- currently the Radiotherapy service handles both radiotherapy and imaging
 * @requires UserPreferences
 * @description Controller for the imaging view.
 */


(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('imagingController', imagingController);

    /* @ngInject */
    imagingController.$inject = ['$filter','$scope','$timeout','NavigatorParameters','Radiotherapy','UserPreferences'];


    function imagingController($filter, $scope, $timeout, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;
        
        // vm variables
        vm.images = [];
        vm.language = '';
        vm.noImage = false;
        vm.loading = true;
      
        // vm functions
        vm.openImage = openImage;
        vm.showHeader = showHeader;

        // Navigator parameters
        let params = null;
        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////

        function activate() {      
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();   

            Radiotherapy.requestRTDicoms(0)
            .then(function(images){
                vm.loading  = false;
                vm.images = images;
                vm.noImage = vm.images.length === 0;
            })
            .catch(function(){
                vm.loading = false;
                vm.images = [];
                vm.noImage = true;
            });
            
            //grab the language
            vm.language = UserPreferences.getLanguage();

        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
            if (index === 0) return true;
            var current = (new Date(vm.images[index].DateAdded)).setHours(0,0,0,0);
            var previous = (new Date(vm.images[index-1].DateAdded)).setHours(0,0,0,0);
            return current !== previous;
        }


        // Opens the individual image page
        function openImage(image){
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': image});
            navigator.pushPage('views/personal/imaging/individual-imaging.html');
        }
    }
               

})();
