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

    InfoTabController.$inject = ['$timeout','$filter','$sce', 'NavigatorParameters'];

  /* @ngInject */
    function InfoTabController($timeout, $filter, $sce, NavigatorParameters) {
        var vm = this;
        vm.title = 'InfoTabController';
        vm.view = {};

        const views= {
            home: {
                icon:'fa-home',
                name:"HOME",
                description:"HOME_DESCRIPTION"
            },
            chart: {
                icon:'fa-user',
                name:"MYCHART" ,
                description:"MYCHART_DESCRIPTION"
            },
            general: {
                icon:'fa-th',
                name: "GENERAL",
                description:"GENERAL_DESCRIPTION"
            },
            caregivers: {
                icon:'fa-user',
                name: "RELATIONSHIPS_CAREGIVERS",
                description:"RELATIONSHIPS_CAREGIVERS_DESCRIPTION"
            }
        };

        activate();

        function activate() { 
            let params = NavigatorParameters.getNavigator().getCurrentPage().options;
            vm.view = views[params.id];
        }
    }

})();