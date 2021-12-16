(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("genericToolbar", GenericToolbar);

    /**
     * @name TopToolbar
     * @author David Gagne
     * @date 2021-12-10
     * @desc Directive for the top tool bar with title and back bouton.
     */
    function GenericToolbar()
    {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                backButton: '=',
                styleClass: '=',
            },
            transclude: true,
            template: `
                <ons-toolbar fixed-style>
                    <div class="left"><ons-back-button ng-hide="!backButton">{{"BACK"|translate}}</ons-back-button></div>
                    <div class="center overflow-text-ellipsis" ng-class="styleClass">{{title|translate}}</div>
                    <div class="right">
                        <ng-transclude></ng-transclude>
                    </div>
                </ons-toolbar>
            `,
        };
    }
})();
