//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EducationalMaterialController', EducationalMaterialController);

    EducationalMaterialController.$inject = ['NavigatorParameters', '$scope', 'EducationalMaterial','NetworkStatus', 'Patient'];

    /* @ngInject */
    function EducationalMaterialController(NavigatorParameters, $scope, EducationalMaterial, NetworkStatus, Patient) {
        var vm = this;
        var backButtonPressed = 0;

        vm.showHeader = showHeader;
        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.educationDeviceBackButton = educationDeviceBackButton;
        vm.searchname = "";
        //new added
        vm.filterMaterial = filterMaterial;
        vm.opend = opened;

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
            vm.edumaterials = EducationalMaterial.setLanguage(EducationalMaterial.getEducationalMaterial());//only for comparison
            vm.new_edumaterials = vm.edumaterials;// this is what we use in html, will be changed in filtering
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
            console.log("pppp");
            console.log(edumaterial.ReadStatus);

            EducationalMaterial.writeClickedRequest(edumaterial.EducationalMaterialSerNum, Patient.getPatientId());
            if(edumaterial.ReadStatus==0){
                edumaterial.ReadStatus = 1;
                EducationalMaterial.readMaterial(edumaterial.EducationalMaterialSerNum);
            }


            NavigatorParameters.setParameters({ 'Navigator': 'educationNavigator', 'Post': edumaterial, 'RStep':1 });
            educationNavigator.pushPage('./views/education/individual-material.html');

        }

        function filterMaterial() {

            var searchname_parts = vm.searchname.toLowerCase().split(" ");//split into different parts

            var filtered = [];//generate new show list for educational material
            vm.edumaterials.forEach(function(edumaterial){

                var name_no_space = edumaterial.Name.replace(/\s/g, '').toLowerCase();
                var show = true;
                searchname_parts.forEach(function(part){
                    if(!name_no_space.includes(part)){
                        show = false;
                    }
                });

                if(show){
                    filtered.push(edumaterial);
                }

            });

            vm.new_edumaterials = filtered;//assign to new show list
        }

        function opened(e){
            if(e.ReadStatus==0){
                return "item-title";
            }else{
                return "item-desc";
            }
        }
    }
})();







