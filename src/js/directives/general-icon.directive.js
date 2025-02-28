// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("generalIcon", generalIcon);

    generalIcon.$inject = [];

    /**
     * @author Stacey Beard
     * @date 2024-10-02
     * @description Composite icon for the general tab resembling a grid of 9 elements.
     */
    function generalIcon() {
        let directive = {
            restrict: 'E',
            scope: {
                iconClass: '@?',
            },
            template: `<!-- Use three ellipses to form a solid grid: https://docs.fontawesome.com/web/style/layer -->
                       <span class="tab-icon fa-layers fa-2x" ng-class="iconClass">
                           <i class="fa-solid fa-ellipsis" data-fa-transform="up-4.4"></i>
                           <i class="fa-solid fa-ellipsis" data-fa-transform=""></i>
                           <i class="fa-solid fa-ellipsis" data-fa-transform="down-4.4"></i>
                       </span>
            `,
        };
        return directive;
    }
})();
