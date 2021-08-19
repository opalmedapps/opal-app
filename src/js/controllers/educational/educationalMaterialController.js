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
 * 
 * 2020 Jul: Project: Research Menu --> Education material now categorized as 'clinical' or 'research', which are 
 *                    displayed in Education tab or Research menu, respectively.
 *           Developed by Kayla O'Sullivan-Steben
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EducationalMaterialController', EducationalMaterialController);

    EducationalMaterialController.$inject = ['NavigatorParameters', '$scope', 'EducationalMaterial',
        'Logger', 'UserHospitalPreferences'];

    /* @ngInject */
    function EducationalMaterialController(NavigatorParameters, $scope, EducationalMaterial,
                                           Logger, UserHospitalPreferences) {
        var vm = this;
        var backButtonPressed = 0;
        let navigator = null;
        let params = null;

        // Variable containing the search string entered into the search bar
        vm.searchString = "";
        vm.filteredEduMaterials;

        // Variable to toggle visibility of the 'no materials' text. Default is false to avoid errors.
        vm.noMaterials = false;

        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = "";

        // Variables to store the current category of material (clinical or research) and corresponding page title
        vm.eduCategory = '';     
        vm.pageTitle = '';   
        vm.noMaterialMessage = '';
        
        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.educationDeviceBackButton = educationDeviceBackButton;
        vm.openInfoPage = openInfoPage;

        

        // Function to show data and time header
        vm.showHeader = showHeader;

        activate();
        ///////////////////////////////////

        function activate(){
            setEduCategory();
            configureNavigator();

            bindEvents();
            configureState();
            configureSelectedHospital();
        }

        function initData() {
            vm.noMaterials = false;
            // Full list of educational materials in the right language and category.
            vm.edumaterials = EducationalMaterial.setLanguage(EducationalMaterial.getEducationalMaterial(vm.eduCategory));
        }

        function educationDeviceBackButton(){
            if (vm.eduCategory === 'clinical'){
                tabbar.setActiveTab(0);
            } else {
                // Regular back button navigation
                navigator.popPage();
            }
        }

        /**
         * @name setEduCategory
         * @desc Sets the education material category based on navigator parameters (defaults to clinical)
         */
        function setEduCategory(){
            params = NavigatorParameters.getParameters();

            // Set category if specified in NavigatorParameters, otherwise defaults to clinical
            if(params.hasOwnProperty('category')){
                vm.eduCategory = params.category;
            }else{ 
                vm.eduCategory = 'clinical';
            }  

            // Set corresponding page title and no material message
            vm.pageTitle = EducationalMaterial.getEducationalMaterialTitle(vm.eduCategory);
            vm.noMaterialMessage = EducationalMaterial.getEducationalMaterialEmptyMessage(vm.eduCategory);
        }
    
        /**
         * @name configureNavigator
         * @desc Sets navigator to educationNavigator if type clinical, otherwise gets current navigator.
         *       Needed since navigator does not automatically update when switching to education tab.
         */
        function configureNavigator(){
            // Set navigator to educationNavigator when in clinical educational material
            if(vm.eduCategory === 'clinical'){
                NavigatorParameters.setNavigator(educationNavigator);
            }
            navigator = NavigatorParameters.getNavigator();
        }

        function configureState() {
            if(EducationalMaterial.materialExists(vm.eduCategory)) {
                initData();
            } else {
                vm.noMaterials = true;
            }
        }

        /**
         * @name configureSelectedHospital
         * @desc Set the hospital name to display
         */
        function configureSelectedHospital() {
            vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
        }

        function bindEvents() {
            navigator.on('prepop',function()
            {
                backButtonPressed = 0;
                configureState();
            });

            navigator.on('prepush', function(event) {
                if (navigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //Cleaning up
            $scope.$on('$destroy',function()
            {
                navigator.off('prepop');
                // Clear navigator parameters
                NavigatorParameters.setParameters({});
            });
        }
        
        /**
         * @method goToEducationalMaterial
         * @description If not read reads material, then it opens the material into its individual controller
         *
         */
        function goToEducationalMaterial(edumaterial) {

            // Logs the material as clicked.
            Logger.logClickedEduMaterial(edumaterial.EducationalMaterialControlSerNum);

            // If the material was unread, set it to read.
            if(edumaterial.ReadStatus == 0){
                edumaterial.ReadStatus = 1;
                EducationalMaterial.readMaterial(edumaterial.EducationalMaterialSerNum);
            }

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': edumaterial, 'RStep':1 });
            navigator.pushPage('./views/education/individual-material.html');
        }

        /**
         * @name openInfoPage
         * @desc Open info page (currently only on education tab)
         */
        function openInfoPage() {
            navigator.pushPage('views/tabs/info-page-tabs.html');
        }


        function showHeader(index) {
            if (index === 0) return true;

            var current = (new Date(vm.filteredEduMaterials[index].DateAdded)).setHours(0, 0, 0, 0);
            var previous = (new Date(vm.filteredEduMaterials[index - 1].DateAdded)).setHours(0, 0, 0, 0);
            return current !== previous;
        }
    }
    
})();







