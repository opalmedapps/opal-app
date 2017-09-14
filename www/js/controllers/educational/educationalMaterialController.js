//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EducationalMaterialController', EducationalMaterialController);

    EducationalMaterialController.$inject = ['NavigatorParameters', '$scope', 'EducationalMaterial','Logger', 'NetworkStatus'];

    /* @ngInject */
    function EducationalMaterialController(NavigatorParameters, $scope, EducationalMaterial, Logger, NetworkStatus) {
        var vm = this;
        var backButtonPressed = 0;

        vm.showHeader = showHeader;
        vm.goToEducationalMaterial = goToEducationalMaterial;

        activate();
        ///////////////////////////////////

        function activate(){
            NavigatorParameters.setParameters({'Navigator':'educationNavigator'});

            vm.educationDeviceBackButton = function () {
                tabbar.setActiveTab(0);
            };

            bindEvents();

            if(NetworkStatus.isOnline()) {
                configureState();
            } else {
                vm.noMaterials = true;
            }
        }

        function initData() {
            vm.noMaterials = false;
            vm.edumaterials = EducationalMaterial.setLanguage(EducationalMaterial.getEducationalMaterial());
            Logger.sendLog('Educational Material', 'all');
        }

        function configureState() {
            if(EducationalMaterial.materialExists()) {
                console.log("initializing data..");
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
            if (edumaterial.ReadStatus === '0') {
                edumaterial.ReadStatus = '1';
                EducationalMaterial.readEducationalMaterial(edumaterial.EducationalMaterialSerNum);
            }
            NavigatorParameters.setParameters({ 'Navigator': 'educationNavigator', 'Post': edumaterial });
            educationNavigator.pushPage('./views/education/individual-material.html');
        }
    }
})();







