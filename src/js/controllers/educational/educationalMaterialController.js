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
        'Logger', '$filter', 'Notifications', 'Params'];

    /* @ngInject */
    function EducationalMaterialController(NavigatorParameters, $scope, EducationalMaterial,
                                           Logger, $filter, Notifications, Params) {
        let vm = this;
        let backButtonPressed = 0;
        let navigator;
        let navigatorParams;

        // Variable containing the search string entered into the search bar
        vm.searchString = "";

        // Variable to toggle visibility of the 'no materials' text. Default is false to avoid errors.
        vm.noMaterials = false;
        
        // Variable containing filtered educational materials
        vm.filteredEduMaterials;
        
        // Variables to store the current category of material (clinical or research) and corresponding page title
        vm.eduCategory = '';
        vm.pageTitle = '';
        vm.noMaterialMessage = '';

        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.educationDeviceBackButton = educationDeviceBackButton;

        vm.openInfoPage = openInfoPage;

        // Used by patient-data-handler
        vm.configureState = configureState;

        activate();
        ///////////////////////////////////

        function activate(){
            setEduCategory();
            configureNavigator();

            bindEvents();
        }

        function initData() {
            vm.noMaterials = false;
            // Full list of educational materials in the right language.
            vm.edumaterials = EducationalMaterial.setLanguage(
                EducationalMaterial.getEducationalMaterial(vm.eduCategory)
            );
            // Educational materials filtered based on the search string.
            vm.filteredEduMaterials = $filter('orderBy')(vm.edumaterials, '-DateAdded');
        }

        function educationDeviceBackButton(){
            vm.eduCategory === 'clinical' ? tabbar.setActiveTab(0) : navigator.popPage();
        }

        /**
         * @name setEduCategory
         * @desc Sets the education material category based on navigator parameters (defaults to clinical)
         */
         function setEduCategory(){
            navigatorParams = NavigatorParameters.getParameters();

            // Set category if specified in NavigatorParameters, otherwise defaults to clinical
            vm.eduCategory  = navigatorParams?.category ? navigatorParams.category : 'clinical';

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
                NavigatorParameters.setParameters({'Navigator':'educationNavigator', 'category': 'clinical'});
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

        function bindEvents() {
            navigator.on('prepop', function () {
                backButtonPressed = 0;
                configureState();
            });

            navigator.on('prepush', function (event) {
                if (navigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //Cleaning up
            $scope.$on('$destroy', function () {
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
            if (edumaterial.ReadStatus === '0')
            {
                EducationalMaterial.readEducationalMaterial(
                    edumaterial.EducationalMaterialSerNum
                );

                // Mark corresponding notifications as read
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    edumaterial.EducationalMaterialSerNum,
                    Params.NOTIFICATION_TYPES.EducationalMaterial,
                );
            }

            // RStep refers to recursive depth in a package (since packages can contain other packages).
            NavigatorParameters.setParameters({ 'Navigator': navigator, 'Post': edumaterial, 'RStep':1 });
            navigator.pushPage('./views/personal/education/individual-material.html');
        }

        /**
         * @name openInfoPage
         * @desc Open info page (currently only on education tab)
         */
         function openInfoPage() {
            navigator.pushPage('views/tabs/info-page-tabs.html', {id: 'education'});
        }
    }
})();
