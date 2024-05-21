/*
 * Filename     :   infoTabController.js
 * Description  :   Manages the information view.
 * Created by   :   David Herrera, Robert Maglieri 
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('InfoTabController', InfoTabController);

    InfoTabController.$inject = ['$filter', '$scope', 'NavigatorParameters'];

    /* @ngInject */
    function InfoTabController($filter, $scope, NavigatorParameters) {
        let vm = this;
        vm.view = {};

        const views = {
            home: {
                icon: 'fa-home',
                name: "HOME",
                description: "HOME_DESCRIPTION"
            },
            chart: {
                icon: 'fa-user',
                name: "MYCHART",
                description: "MYCHART_DESCRIPTION"
            },
            general: {
                icon: 'fa-th',
                name: "GENERAL",
                description: "GENERAL_DESCRIPTION"
            },
            caregivers: {
                icon: 'fa-user',
                name: "RELATIONSHIPS_CAREGIVERS",
                description: "RELATIONSHIPS_CAREGIVERS_DESCRIPTION"
            },
            patients: {
                icon: 'fa-user',
                name: "RELATIONSHIPS_PATIENTS",
                description: "RELATIONSHIPS_PATIENTS_DESCRIPTION"
            },
            education: {
                icon:'fa-book',
                name:"EDUCATION",
                description:"EDUCATION_DESCRIPTION"
            },
            research: {
                icon: './img/microscope.png',
                name: "RESEARCH",
                description: "RESEARCH_DESCRIPTION"
            },
            studies: {
                icon: './img/dna.png',
                name: "STUDIES",
                description: "STUDIES_DESCRIPTION"
            }
        };

        vm.isIcon = isIcon;

        activate();

        function activate() {
            let params = NavigatorParameters.getNavigator().getCurrentPage().options;
            vm.view = views[params.id];
        }

        /**
         * @name isIcon
         * @desc Check if icon is an uploaded image (in img/ directory) or is otherwise a regular ons-icon
         * @returns true if the icon is a proper icon, false if it is an image stored in the ./img/ folder 
         */
        function isIcon() {
            return !vm.view.icon.includes("img/");
        }
    }

})();
