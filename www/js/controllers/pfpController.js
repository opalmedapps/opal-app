(function() {
    'use strict';
    angular
        .module('MUHCApp')
        .controller('pfpController', pfpController);

    pfpController.$inject = [
        '$timeout','NavigatorParameters', 'EducationalMaterial'
    ];

    /* @ngInject */
    function pfpController(
        $timeout,NavigatorParameters, EducationalMaterial)
    {
        var vm = this;
        vm.title = 'pfpController';
        vm.goToResources = goToResources;

        activate();

        ///////////////////////////////////////////////////////////////////////////////////
        function activate() {
            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
            NavigatorParameters.setNavigator(generalNavigator);
        }

        function goToResources() {
            var resources = EducationalMaterial.getPfpResources();
            NavigatorParameters.setParameters({ 'Post': resources });
            generalNavigator.pushPage('./views/education/individual-material.html');
        }

    }

})()