(function() {
    'use strict';
    angular
        .module('MUHCApp')
        .controller('pfpController', pfpController);

    pfpController.$inject = [
        '$timeout','NavigatorParameters', 'EducationalMaterial', 'UpdateUI', '$q'
    ];

    /* @ngInject */
    function pfpController(
        $timeout,NavigatorParameters, EducationalMaterial, UpdateUI, $q)
    {
        var vm = this;
        vm.title = 'pfpController';
        vm.materials = {};
        vm.goToResources = goToResources;

        activate();

        ///////////////////////////////////////////////////////////////////////////////////
        function activate() {
            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
            NavigatorParameters.setNavigator(generalNavigator);

            initEdu();
        }

        // Initialize the edumaterial array for getting pfpresources(as pfpresources is stored into localstorage when
        // edumaterials is requested
        initEdu().then(function () {
            vm.materials = EducationalMaterial.getEducationalMaterial();
            console.log(vm.materials);
            //Setting the language for view
            vm.materials = EducationalMaterial.setLanguageEduationalMaterial(materials);
        });

        function initEdu() {
            if (EducationalMaterial.getEducationalMaterial().length !== 0 ) return $q.resolve({});
            return UpdateUI.set(['EducationalMaterial']);
        }


        function goToResources() {
            var resources = EducationalMaterial.getPfpResources();
            NavigatorParameters.setParameters({'Navigator':'generalNavigator', 'Post': resources });
            generalNavigator.pushPage('./views/education/individual-material.html');
        }

    }

})();