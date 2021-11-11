(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("patientDataInitializer", PatientDataInitializer);

    PatientDataInitializer.$inject = ["$timeout", "UpdateUI"];

    /**
     * @name PatientDataInitializer
     * @author Stacey Beard
     * @date 2021-10-29
     * @description Directive used to initialize patient data in one of the categories supported by UpdateUI.
     *              Includes a loading wheel.
     */
    function PatientDataInitializer($timeout, UpdateUI) {
        let directive = {
            restrict: 'E',
            scope: {
                // The category of data to initialize from UpdateUI
                "category": "@",

                // Function called when the data is done loading, to display it in the parent view
                "displayFunction": "=",

                // Variable provided by the directive. Indicates that the data is loading.
                // Can be used by the controller to hide content while this directive fetches data.
                "loading": "=",

                // Optional parameter to override the loading wheel's top margin
                "marginTop": "@",
            },
            template: `<loading-spinning-circle ng-show="loading"
                                                loading-message="{{'LOADING'|translate}}"
                                                margintop="{{loadingMarginTop}}"
                       ></loading-spinning-circle>
            `,
            link: scope => {
                scope.loading = true;

                // Initialize data in the given category
                UpdateUI.getData(scope.category).then(() => {
                    $timeout(() => {
                        scope.loading = false;
                        if (scope.displayFunction) scope.displayFunction();
                    });
                });
            },
        };
        return directive;
    }
})();
