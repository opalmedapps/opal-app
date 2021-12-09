(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("patientDataInitializer", patientDataInitializer);

    patientDataInitializer.$inject = ["$filter", "$timeout", "Params", "Toast", "UpdateUI"];

    /**
     * @name patientDataInitializer
     * @author Stacey Beard
     * @date 2021-10-29
     * @description Directive used to initialize or refresh patient data in one of the categories supported by UpdateUI.
     *              Includes a loading wheel and error box shown during data initialization.
     */
    function patientDataInitializer($filter, $timeout, Params, Toast, UpdateUI) {
        let directive = {
            restrict: 'E',
            scope: {
                // The category of data to initialize from UpdateUI
                "category": "@",

                // Function called when the data is done loading, to display it in the parent view
                "displayFunction": "=",

                // Function provided by the directive, to be called manually or by ons-pull-hook's ng-action to execute a refresh.
                // See function below for details.
                "refresh": "=?",

                // Variable provided by the directive. Indicates that the main page content (where data is shown) should be hidden,
                // usually because the data is loading or has completely failed to load.
                "hideContent": "=?",

                // Optional parameter to override the loading wheel's top margin
                "marginTop": "@",
            },
            template: `<!-- Loading wheel -->
                       <loading-spinning-circle ng-show="loading"
                                                loading-message="{{'LOADING'|translate}}"
                                                margintop="{{loadingMarginTop}}"
                       ></loading-spinning-circle>
                       
                       <!-- Error message -->
                       <div ng-show="initLoadingError" align="center" style="width: 95%; margin: 10px auto" ng-class="fontSizeDesc">
                           <uib-alert type="{{alertType}}">{{"LOADING_ERROR"|translate}}</uib-alert>
                       </div>
            `,
            link: scope => {
                scope.alertType = Params.alertTypeDanger;
                scope.refresh = refresh;

                // Variables that should only be changed via the setters below
                scope.loading = false;
                scope.initLoadingError = false;

                // Variable that is a function of other variables: hideContent = scope.loading || scope.initLoadingError
                scope.hideContent = false;

                // Helper functions
                const setLoading = (value) => { console.log("Loading "+value); scope.loading = value; setHideContent() };
                const setInitLoadingError = (value) => { console.log("InitError "+value); scope.initLoadingError = value; setHideContent() };
                const setHideContent = () => { console.log("Hide "+(scope.loading || scope.initLoadingError)); scope.hideContent = scope.loading || scope.initLoadingError };

                // Initialize data
                if (UpdateUI.hasBeenInitialized(scope.category)) refresh(undefined, false);
                else initialize();

                /**
                 * @description Initializes the data for this directive's category, then displays the data using the
                 *              provided display function.
                 */
                function initialize() {
                    setLoading(true);
                    UpdateUI.getData(scope.category).then(() => {
                        $timeout(() => {
                            if (scope.displayFunction) scope.displayFunction();
                        });
                    }).catch(error => {
                        $timeout(() => {
                            console.error(`Error loading data:`, scope.category, error);
                            setInitLoadingError(true);
                        });
                    }).finally(() => {
                        $timeout(() => {
                            setLoading(false);
                        });
                    });
                }

                /**
                 * @description Function to be called manually or by an ons-pull-hook's ng-action.
                 *              Refreshes the data for this directive's category, then displays the data using the
                 *              provided display function. Closes ons-pull-hook if the $done function was provided by
                 *              ons-pull-hook.
                 * @param {function} [$done] - Optional callback function to execute after the display function.
                 *                             Typically used with the $done function of ons-pull-hook, representing
                 *                             a function that terminates ons-pull-hook's loading animation.
                 * @param {boolean} [visibleError] - Optional flag to indicate whether loading errors should be shown
                 *                                   to the user. Default = true. Note: errors should typically be
                 *                                   shown only if the user intentionally triggered the refresh (and is
                 *                                   waiting for the result).
                 */
                function refresh($done, visibleError=true) {
                    // Refresh data in the given category
                    UpdateUI.getData(scope.category).then(() => {
                        $timeout(() => {
                            setInitLoadingError(false); // Recovered from an earlier failure
                            if (scope.displayFunction) scope.displayFunction();
                        });
                    }).catch(error => {
                        $timeout(() => {
                            console.error(`Error refreshing data:`, scope.category, error);
                            // TODO limit to one toast
                            if (visibleError) Toast.showToast({
                                message: $filter('translate')("REFRESH_ERROR"),
                            });
                        });
                    }).finally(() => {
                        if ($done) $done();
                    });
                }
            },
        };
        return directive;
    }
})();
