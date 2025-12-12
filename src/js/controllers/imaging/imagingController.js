/**
 * @description Controller for the imaging view.
 * @author Kayla O'Sullivan-Steben
 * @date 2021
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ImagingController', ImagingController);

    ImagingController.$inject = ['Navigator', 'Radiotherapy', 'UserPreferences'];

    function ImagingController(Navigator, Radiotherapy, UserPreferences) {
        let vm = this;

        let navigator;

        vm.images = [];
        vm.language = '';
        vm.loading = true;
        vm.noImage = false;

        vm.openImage = image => navigator.pushPage('views/personal/imaging/individual-imaging.html', { Post: image });

        activate();

        ////////////////

        function activate() {
            navigator = Navigator.getNavigator();
            vm.language = UserPreferences.getLanguage();

            Radiotherapy.requestRTDicoms(0).then(images => {
                vm.loading  = false;
                vm.images = images;
                vm.noImage = vm.images.length === 0;

            }).catch(error => {
                console.error(error);
                vm.loading = false;
                vm.images = [];
                vm.noImage = true;
            });
        }
    }
})();
