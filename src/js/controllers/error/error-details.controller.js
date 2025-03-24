/**
 * @file Controller for a generic error page that displays a box with error details.
 * @author Stacey Beard
 * @date 2022-06-06
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ErrorDetails', ErrorDetails);

    ErrorDetails.$inject = ['NavigatorParameters','Params'];

    function ErrorDetails(NavigatorParameters, Params) {
        let vm = this;
        let navigator;

        /**
         * @desc Settings for the display box which will show the error message.
         * @type {{type: string, message: string}}
         */
        vm.alert = {
            type: Params.alertTypeDanger,
            message: '',
        };

        activate();

        ///////////////////////////

        function activate(){
            navigator = NavigatorParameters.getNavigator();
            let params = navigator.getCurrentPage().options;
            vm.alert.message = params.message;
        }
    }
})();
