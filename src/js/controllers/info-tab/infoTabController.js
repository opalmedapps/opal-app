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

    InfoTabController.$inject = ['$timeout','$filter','$sce'];

  /* @ngInject */
    function InfoTabController($timeout,$filter,$sce) {
        var vm = this;
        vm.title = 'InfoTabController';
        vm.view = {};

        var views=[
            {
                icon:'fa-home',
                color:'SteelBlue',
                name:"HOME",
                description:"HOME_DESCRIPTION"
            },
            {
                icon:'fa-user',
                color:'maroon',
                name:"MYCHART" ,
                description:"MYCHART_DESCRIPTION"
            },
            {
                icon:'fa-th',
                color:'darkblue',
                name: "GENERAL",
                description:"GENERAL_DESCRIPTION"
            }
        ];

        activate();

        ////////////////

        function activate() {
            var tab = tabbar.getActiveTabIndex();
            vm.view = views[tab];
            vm.view.description = $filter('translate')(vm.view.description );
        }
    }

})();