(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("topToolbar", TopToolbar);

    /**
     * @name TopToolbar
     * @author David Gagne
     * @date 2021-12-10
     * @desc Directive for the top tool bar with title and back bouton.
     */
    function TopToolbar()
    {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                backButton: '='
            },
            template: `
                <ons-toolbar fixed-style>
                    <div ng-show="backButton" class="left"><ons-back-button>{{"BACK"|translate}}</ons-back-button></div>
                    <div class="center overflow-text-ellipsis" ng-class="fontSizeTitle">{{title}}</div>
                </ons-toolbar>
            `,
        };
    }
})();
