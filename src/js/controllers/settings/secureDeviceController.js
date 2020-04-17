/**
 * Created by Nami on 10/10/2017.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SecureDeviceController', SecureDeviceController);

    SecureDeviceController.$inject = [
        'FirebaseService', 'NavigatorParameters', 'UserPreferences', 'Constants', '$timeout'
    ];

    /* @ngInject */
    function SecureDeviceController(FirebaseService, NavigatorParameters, UserPreferences, Constants, $timeout) {

        var vm = this;
        var params;

        activate();

        /////////////////////////

        function activate(){
            params = NavigatorParameters.getParameters();
            vm.navigatorName = params.Navigator;

        }
    }
})();
