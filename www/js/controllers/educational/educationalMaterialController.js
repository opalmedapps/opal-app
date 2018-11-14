//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

/**
 * Modification History
 *
 * 2018 Nov: Project: Fertility Educate / Educational Material Packages / Education Material Interaction Logging
 *           Developed by Tongyou (Eason) Yang in Summer 2018
 *           Merged by Stacey Beard
 *           Commit # 6706edfb776eabef4ef4a2c9b69d834960863435
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EducationalMaterialController', EducationalMaterialController);

    EducationalMaterialController.$inject = ['NavigatorParameters', '$scope', 'EducationalMaterial','NetworkStatus',
        'Patient'];

    /* @ngInject */
    function EducationalMaterialController(NavigatorParameters, $scope, EducationalMaterial, NetworkStatus,
                                           Patient) {
        var vm = this;
        var backButtonPressed = 0;

        // Variable containing the search string entered into the search bar
        vm.searchString = "";

        vm.showHeader = showHeader;
        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.educationDeviceBackButton = educationDeviceBackButton;

        // Function used to filter the materials shown based on the search string
        vm.filterMaterial = filterMaterial;

        activate();
        ///////////////////////////////////

        function activate(){
            NavigatorParameters.setParameters({'Navigator':'educationNavigator'});

            bindEvents();

            if(NetworkStatus.isOnline()) {
                configureState();
            } else {
                vm.noMaterials = true;
            }
        }

        function initData() {
            vm.noMaterials = false;
            // Full list of educational materials in the right language.
            vm.edumaterials = EducationalMaterial.setLanguage(EducationalMaterial.getEducationalMaterial());
            // Educational materials filtered based on the search string.
            vm.filteredEduMaterials = vm.edumaterials;
        }

        function educationDeviceBackButton(){
            tabbar.setActiveTab(0);
        }

        function configureState() {
            if(EducationalMaterial.materialExists()) {
                initData();
            } else {
                vm.noMaterials = true;
            }
        }

        function bindEvents() {
            educationNavigator.on('prepop',function()
            {
                backButtonPressed = 0;
                if(NetworkStatus.isOnline()){
                    configureState();
                } else {
                    vm.noMaterials = true;
                }
            });

            educationNavigator.on('prepush', function(event) {
                if (educationNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //Cleaning up
            $scope.$on('$destroy',function()
            {
                educationNavigator.off('prepop');
            });
        }

        //Function to decide whether or not to show the header
        function showHeader(index) {
            if (index === 0) {
                return true;
            } else if (vm.edumaterials[index - 1].PhaseInTreatment !== vm.edumaterials[index].PhaseInTreatment) {
                return true;
            }
            return false;
        }

        /**
         * @method goToEducationalMaterial
         * @description If not read reads material, then it opens the material into its individual controller
         *
         */
        function goToEducationalMaterial(edumaterial) {

            // Logs the material as clicked.
            EducationalMaterial.logClickedEduMaterial(edumaterial.EducationalMaterialControlSerNum);

            // If the material was unread, set it to read.
            if(edumaterial.ReadStatus == 0){
                edumaterial.ReadStatus = 1;
                EducationalMaterial.readMaterial(edumaterial.EducationalMaterialSerNum);
            }

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            NavigatorParameters.setParameters({ 'Navigator': 'educationNavigator', 'Post': edumaterial, 'RStep':1 });
            educationNavigator.pushPage('./views/education/individual-material.html');
        }

        // Function used to filter the materials shown based on the search string.
        // Author: Tongyou (Eason) Yang
        function filterMaterial() {

            var searchString_parts = vm.searchString.toLowerCase().split(" ");//split into different parts

            var filtered = [];//generate new show list for educational material
            vm.edumaterials.forEach(function(edumaterial){

                var name_no_space = edumaterial.Name.replace(/\s/g, '').toLowerCase();
                var show = true;
                searchString_parts.forEach(function(part){
                    if(!name_no_space.includes(part)){
                        show = false;
                    }
                });

                if(show){
                    filtered.push(edumaterial);
                }

            });

            vm.filteredEduMaterials = filtered;//assign to new show list
        }
    }
})();







