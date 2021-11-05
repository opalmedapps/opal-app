(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("patientDataRefresher", PatientDataRefresher);

    PatientDataRefresher.$inject = ["UpdateUI"];

    /**
     * @name PatientDataRefresher
     * @author Stacey Beard
     * @date 2021-11-05
     * @description Directive used to refresh patient data (by pulling down and releasing the page) in one of the
     *              categories supported by UpdateUI.
     *
     *              IMPORTANT: when used, must be wrapped in an <ons-pull-hook>. The pull hook is necessary for this
     *                         directive to work correctly, but cannot be included inside it, because it must be a
     *                         direct descendant of ons-page.
     */
    function PatientDataRefresher(UpdateUI) {
        let directive = {
            restrict: 'E',
            scope: {
                // The data category to refresh from UpdateUI
                "category": "@",

                // Function called when the data is done refreshing, to display it in the parent view
                "displayFunction": "=",

                // Function provided by the directive, to be called by ons-pull-hook's ng-action to execute the refresh
                "refresh": "="
            },
            template: `<span ng-if="loaderState() === 'initial'">
                           <ons-icon style="color: grey" size="25px" icon="fa-spinner"></ons-icon>
                       </span>
                       <span ng-if="loaderState() === 'preaction'">
                           <ons-icon style="color: #2196F3" size="25px" icon="fa-spinner"></ons-icon>
                       </span>
                       <span ng-if="loaderState() === 'action'">
                           <ons-icon style="color: #2196F3" size="25px" icon="fa-spinner" spin="true"></ons-icon>
                       </span>
            `,
            link: (scope, element) => {
                scope.loaderState = loaderState;
                scope.refresh = refresh;

                /**
                 * @description Gets and returns the state of the ons-pull-hook that is a direct parent of
                 *              this directive.
                 * @returns {string} The state of the ons-pull-hook (e.g. initial, preaction, action).
                 */
                function loaderState() {
                    return element[0].parentElement.getAttribute("state");
                }

                /**
                 * @description Function to be called by the parent ons-pull-hook's ng-action.
                 *              Refreshes the data for this directive's category, then displays the data using the
                 *              provided display function and closes ons-pull-hook.
                 * @param $done Input parameter provided by ons-pull-hook, representing a function to call to
                 *              terminate ons-pull-hook's loading animation.
                 */
                function refresh($done) {
                    UpdateUI.update([scope.category]).then(() => {
                        if (scope.displayFunction) scope.displayFunction();
                        $done();
                    });
                }
            },
        };
        return directive;
    }
})();
