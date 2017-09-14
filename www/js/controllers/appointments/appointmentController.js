/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-14
 * Time: 1:37 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AppointmentController', AppointmentController);

    AppointmentController.$inject = ['NavigatorParameters', 'UserPreferences', 'Logger'];

    /* @ngInject */
    function AppointmentController(NavigatorParameters, UserPreferences, Logger) {

        var vm = this;

        var navigatorName;

        vm.goToMap = goToMap;
        vm.aboutAppointment = aboutAppointment;

        activate();

        //////////////////////////////////////
        function activate() {
            var parameters = NavigatorParameters.getParameters();
            navigatorName = parameters.Navigator;

            vm.app = parameters.Post;
            vm.language = UserPreferences.getLanguage();

            console.log("language: " + vm.language);

            console.log(JSON.stringify(vm.app));


            Logger.sendLog('Appointment', parameters.Post.AppointmentSerNum);
        }

        function goToMap()
        {
            NavigatorParameters.setParameters(vm.app);
            window[navigatorName].pushPage('./views/general/maps/individual-map.html');
        }

        function aboutAppointment () {
            window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: vm.app["URL_"+UserPreferences.getLanguage()],
                contentType: vm.app["AppointmentType_"+UserPreferences.getLanguage()]
            });
        }

    }
})();