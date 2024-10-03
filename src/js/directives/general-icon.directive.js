(function () {
    'use strict';

    angular
        .module("MUHCApp")
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
