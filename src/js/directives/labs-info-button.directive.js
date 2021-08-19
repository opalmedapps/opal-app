(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("labsInfoButton", LabsInfoButton);

    LabsInfoButton.$inject = ['NavigatorParameters'];

    /**
     * @name LabsInfoButton
     * @author Stacey Beard
     * @date 2021-05-14
     * @desc Directive for the lab results info button.
     * @example <labs-info-button></labs-info-button>
     */
    function LabsInfoButton(NavigatorParameters)
    {
        let directive = {
            restrict: 'E',
            scope: { },
            template: `
                <ons-toolbar-button ng-click="goToInfoPage()">
                    <ons-icon icon="fa-info-circle"></ons-icon>
                </ons-toolbar-button>
            `,
            link: function (scope)
            {
                scope.goToInfoPage = goToInfoPage;

                /**
                 * @name goToInfoPage
                 * @author Stacey Beard
                 * @date 2021-05-14
                 * @description Navigates to the lab results info screen.
                 */
                function goToInfoPage()
                {
                    let navigator = NavigatorParameters.getNavigator();
                    navigator.pushPage('./views/personal/test-results/test-results-info.html', {});
                }
            }
        };
        return directive;
    }
})();
