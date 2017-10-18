/**
 * Created by Nami on 10/10/2017.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('BugReportController', BugReportController);

    BugReportController.$inject = [
        'NavigatorParameters'
    ];

    /* @ngInject */
    function BugReportController( NavigatorParameters) {

        var vm = this;
        var params;

        activate();
        /////////////////////////


        function activate() {
            params = NavigatorParameters.getParameters();
            vm.navigatorName = params.Navigator;
        }
    }
})();
