(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("patientDataRefresher", PatientDataRefresher);

    PatientDataRefresher.$inject = ["$timeout", "UpdateUI"];

    /**
     * @name PatientDataRefresher
     * @author Stacey Beard
     * @date 2021-11-05
     * @description Directive used to refresh patient data in one of the categories supported by UpdateUI.
     *
     *              TWO POSSIBLE USAGES:
     *
     *              1- Can be wrapped in an <ons-pull-hook> for a "pull to refresh" experience.
     *              If used in an ons-pull-hook, this directive shows a loading wheel, and it is recommended
     *              not to use the 'loading' variable to hide the page contents (for the best UI experience).
     *
     *              2- If not wrapped in an ons-pull-hook, the 'loading' variable can be used (and if desired, can be
     *              shared with patient-data-initializer) to display a loading wheel while the contents refreshes.
     */
    function PatientDataRefresher($timeout, UpdateUI) {
        let directive = {
            restrict: 'E',
            scope: {
                // The category of data to refresh from UpdateUI
                "category": "@",

                // Function called when the data is done refreshing, to display it in the parent view
                "displayFunction": "=",

                // Function provided by the directive, to be called manually or by ons-pull-hook's ng-action to execute the refresh
                "refresh": "=",

                // Variable provided by the directive. Indicates that the data is loading.
                // Can be used by the controller to hide content while this directive fetches data.
                "loading": "=?",
            },
            template: `<!-- The following content is only visible if this directive is wrapped in an ons-pull-hook -->
                       <span ng-if="loaderState() === 'initial'">
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
                 *              this directive, if it exists.
                 * @returns {string} The state of the ons-pull-hook (e.g. initial, preaction, action), or undefined if
                 *                   a parent ons-pull-hook is not found.
                 */
                function loaderState() {
                    try {
                        return element[0].parentElement.getAttribute("state");
                    }
                    catch (error) {
                        return undefined;
                    }
                }

                /**
                 * @description Function to be called manually or by the parent ons-pull-hook's ng-action.
                 *              Refreshes the data for this directive's category, then displays the data using the
                 *              provided display function. Closes ons-pull-hook if it exists.
                 * @param {function} [$done] - Optional input parameter provided by ons-pull-hook, representing
                 *                             a function to call to terminate ons-pull-hook's loading animation.
                 */
                function refresh($done) {
                    scope.loading = true;

                    // Refresh data in the given category
                    UpdateUI.getData(scope.category).then(() => {
                        $timeout(() => {
                            scope.loading = false;
                            if (scope.displayFunction) scope.displayFunction();
                            if ($done) $done();
                        });
                    });
                }
            },
        };
        return directive;
    }
})();
