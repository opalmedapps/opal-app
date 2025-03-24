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
        .module('OpalApp')
        .controller('InfoTabController', InfoTabController);

    InfoTabController.$inject = ['$filter', '$scope', 'Navigator'];

    /* @ngInject */
    function InfoTabController($filter, $scope, Navigator) {
        let vm = this;
        vm.view = {};

        const views = {
            home: {
                iconType: 'icon',
                icon: 'fa-solid fa-home',
                name: "HOME",
                description: "HOME_DESCRIPTION"
            },
            chart: {
                iconType: 'icon',
                icon: 'fa-solid fa-user',
                name: "MYCHART",
                description: "MYCHART_DESCRIPTION"
            },
            general: {
                iconType: 'general-icon',
                icon: 'general-icon',
                name: "GENERAL",
                description: "GENERAL_DESCRIPTION"
            },
            caregivers: {
                iconType: 'icon',
                icon: 'fa-solid fa-user',
                name: "RELATIONSHIPS_CAREGIVERS",
                description: "RELATIONSHIPS_CAREGIVERS_DESCRIPTION"
            },
            patients: {
                iconType: 'icon',
                icon: 'fa-solid fa-user',
                name: "RELATIONSHIPS_PATIENTS",
                description: "RELATIONSHIPS_PATIENTS_DESCRIPTION"
            },
            education: {
                iconType: 'icon',
                icon:'fa-solid fa-book',
                name:"EDUCATION",
                description:"EDUCATION_DESCRIPTION"
            },
            research: {
                iconType: 'icon',
                icon: 'fa-solid fa-microscope',
                name: "RESEARCH",
                description: "RESEARCH_DESCRIPTION"
            },
            studies: {
                iconType: 'icon',
                icon: 'fa-solid fa-dna',
                name: "STUDIES",
                description: "STUDIES_DESCRIPTION"
            }
        };

        activate();

        function activate() {
            let params = Navigator.getNavigator().getCurrentPage().options;
            vm.view = views[params.id];
        }
    }
})();
