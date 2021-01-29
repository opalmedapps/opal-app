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
        var vm = this;
        vm.title = 'InfoTabController';
        vm.view = {};

        let params = {};
        let navigatorName = '';

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
            },
            {
                icon:'fa-book',
                color:'Chocolate',
                name:"EDUCATION",
                description:"EDUCATION_DESCRIPTION"
            }
        ];

        var subViews={
            research:{
                icon:'./img/microscope.png',
                name:"RESEARCH",
                description:"RESEARCH_DESCRIPTION"
            }
        };

        vm.isIcon = isIcon;

        activate();

        ////////////////

        function activate() {
            var tab=tabbar.getActiveTabIndex();
            
            params = NavigatorParameters.getParameters();
            navigatorName = NavigatorParameters.getNavigatorName();

            // Check if requesting info on subView of tab or tab itself
            if(params.hasOwnProperty('subView') && subViews.hasOwnProperty(params.subView)){
                vm.view = subViews[params.subView];
            } else {
                vm.view = views[tab];
            }
            vm.view.description = $filter('translate')(vm.view.description);

            // Remove subView 
            $scope.$on('$destroy', function () {
                NavigatorParameters.setParameters({Navigator:navigatorName});
            });
        }

        /**
         * @name isIcon
         * @desc Check if icon is an uploaded image (in img/ directory) or is otherwise a regular ons-icon
         * @returns true if the icon is a proper icon, false if it is an image stored in the ./img/ folder 
         */
        function isIcon(){
            return !vm.view.icon.includes("img/");
        }
    }

})();