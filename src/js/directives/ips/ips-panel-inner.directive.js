// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsPanelInner', IPSPanelInner);

    IPSPanelInner.$inject = [];

    function IPSPanelInner() {
        return {
            restrict: 'E',
            // Used to display the content inside the panel
            transclude: true,
            scope: {
            },
            template: `<div class="panel panel-body ips-inner-panel">
                           <ng-transclude></ng-transclude>
                       </div>`,
        }
    }
})();
