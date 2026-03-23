// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
        .module('OpalApp')
        .controller('EducationalMaterialController', EducationalMaterialController);

    EducationalMaterialController.$inject = ['Navigator', '$scope', 'EducationalMaterial',
        'Logger', '$filter', 'Notifications', 'Params'];

    /* @ngInject */
    function EducationalMaterialController(Navigator, $scope, EducationalMaterial,
                                           Logger, $filter, Notifications, Params) {
        let vm = this;
        let navigator;

        // Variable containing the search string entered into the search bar
        vm.searchString = "";

        // Variable to toggle visibility of the 'no materials' text. Default is false to avoid errors.
        vm.noMaterials = false;

        // Variable containing filtered educational materials
        vm.filteredEduMaterials;

        // Variables to store the current category of material (clinical or research) and corresponding page title
        vm.eduCategory = '';
        vm.pageTitle = '';

        vm.goToEducationalMaterial = goToEducationalMaterial;
        vm.openInfoPage = openInfoPage;

        // Used by patient-data-handler
        vm.configureState = configureState;

        activate();
        ///////////////////////////////////

        function activate(){
            navigator = Navigator.getNavigator();
            setEduCategory();
        }

        function initData() {
            vm.noMaterials = false;
            vm.edumaterials = EducationalMaterial.getEducationalMaterial(vm.eduCategory);
            // Educational materials filtered based on the search string.
            vm.filteredEduMaterials = $filter('orderBy')(vm.edumaterials, '-DateAdded');
        }

        /**
         * @name setEduCategory
         * @desc Sets the education material category based on navigator parameters (defaults to clinical)
         */
         function setEduCategory(){
            let navigatorParams = Navigator.getParameters();

            // Set category if specified in Navigator, otherwise defaults to clinical
            vm.eduCategory  = navigatorParams.category || 'clinical';

            // Set corresponding page title and no material message
            vm.pageTitle = EducationalMaterial.getEducationalMaterialTitle(vm.eduCategory);
        }

        function configureState() {
            if(EducationalMaterial.materialExists(vm.eduCategory)) {
                initData();
            } else {
                vm.noMaterials = true;
            }
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
            navigator.pushPage('./views/personal/education/individual-material.html', {
                'Post': edumaterial,
                'RStep': 1,
            });
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
