/**
 * Created by Nami on 10/10/2017.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('InitLegalController', InitLegalController);

    InitLegalController.$inject = ['NavigatorParameters'];

    /* @ngInject */
    function InitLegalController(NavigatorParameters) {

        var vm = this;
        var params;
        /////////////////////////
        activate();

        function activate() {
            params = NavigatorParameters.getParameters();
            vm.navigatorName = params.Navigator;
            vm.title = params.title;
            vm.type = params.type;
        }
    }
})();
