(function() {
    'use strict';
    angular
        .module('MUHCApp')
        .controller('pfpController', pfpController);

    pfpController.$inject = [
        'NavigatorParameters', 'EducationalMaterial', 'UpdateUI', '$q'
    ];

    /* @ngInject */
    function pfpController(NavigatorParameters, EducationalMaterial, UpdateUI, $q) {
        let vm = this;
        vm.title = 'pfpController';
        vm.materials = {};
        vm.goToResources = goToResources;

        activate();

        ///////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Initialize the edumaterial array for getting pfpresources
            initEdu().then(function () {
                vm.materials = EducationalMaterial.getEducationalMaterial();

                //Setting the language for view
                vm.materials = EducationalMaterial.setLanguage(vm.materials);
            }).catch(error => {
                console.error("Failed to fetch EducationalMaterial data from server (Patients for Patients):", error);
            });
        }

        function initEdu() {
            if (EducationalMaterial.getEducationalMaterial().length !== 0 ) return $q.resolve({});
            return UpdateUI.getData('EducationalMaterial');
        }

        function goToResources() {
            let nav = NavigatorParameters.getNavigator();
            nav.pushPage("./views/templates/content.html",{"contentType":"pfp_resources"});
        }
    }
})();
