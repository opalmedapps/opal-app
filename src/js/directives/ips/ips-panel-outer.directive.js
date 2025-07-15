// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsPanelOuter', IPSPanelOuter);

    IPSPanelOuter.$inject = [];

    function IPSPanelOuter() {
        return {
            restrict: 'E',
            // Used to display the content inside the panel
            transclude: true,
            scope: {
                headerTitle: '@',
            },
            template: `<div class="panel panel-default ips-outer-panel">
                           <div class="panel-heading">
                               <h3 class="panel-title">{{headerTitle}}</h3>
                           </div>
                           <ng-transclude></ng-transclude>
                       </div>`,
        }
    }
})();
