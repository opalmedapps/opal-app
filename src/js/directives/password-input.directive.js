(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("passwordInput", PasswordInput);

    /**
     * @name PasswordInput
     * @author David Gagne
     * @date 2022-02-02
     * @desc Directive to wrap password input and handle view password functionality
     */
    function PasswordInput() {
        return {
            restrict: 'E',
            transclude: true,
            template: `
                <div class="password-input--wraper style-4">
                    <div class="input-slot" ng-transclude></div>
                    <ons-icon class="icon" icon={{iconType}} role="button" ng-click="switchInputType()" aria-label="{{'SHOW_PASSWORD' | translate}}"></ons-icon>
                </div>
            `,
            link: function (scope, element) {                
                scope.isVisible = false;
                scope.iconType = 'ion-eye';
                scope.switchInputType = () => {
                    scope.isVisible = !scope.isVisible
                    scope.iconType = scope.isVisible ? 'ion-eye-disabled' : 'ion-eye';
                    element[0].querySelector('input').type = scope.isVisible ? 'text' : 'password';
                }
            }
        };
    }
})();
