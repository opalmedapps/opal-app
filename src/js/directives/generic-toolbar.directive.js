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
                backButton: '=?',
                styleClass: '=',
            },
            transclude: {
                'leftContentSlot': '?leftContent',
                'rightContentSlot': '?rightContent'
            },
            template: `
                <ons-toolbar fixed-style>
                    <div class="left" ng-transclude="leftContentSlot" ng-style="iosStyleFix"><ons-back-button ng-hide="backButton === false">{{"BACK"|translate}}</ons-back-button></div>
                    <div class="center overflow-text-ellipsis" ng-class="styleClass" ng-style="iosStyleFix">{{title}}</div>
                    <div class="right" ng-transclude="rightContentSlot" ng-style="iosStyleFix"></div>
                </ons-toolbar>
            `,
            link: function (scope) {
                scope.iosStyleFix = ons.platform.isIOS() ? {'padding-top': '0px'} : {};
                console.log('==>', ons.platform.isIOS())
            }
        };
    }
})();
