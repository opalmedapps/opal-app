/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:53 PM
 */


/**
 * Controls the view for the treatment planning step information.
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStepController', IndividualStepController);

    IndividualStepController.$inject = ['NavigatorParameters', 'UserPreferences','$filter', 'Logger'];

    function IndividualStepController(NavigatorParameters, UserPreferences, $filter, Logger) {

        var vm = this;
        var nav = NavigatorParameters.getNavigator();

        vm.showTab = true;
        vm.about = about;
        vm.stage = {};
        vm.UrlExists = false;

        activate();

        function activate() {
            vm.stage = NavigatorParameters.getParameters().Post;

            var language = UserPreferences.getLanguage();

            if (vm.stage) {
                if ("AppointmentDescription_" + language in vm.stage) {
                    vm.stage.appointmentDescription = vm.stage["AppointmentDescription_" + language];
                }
                if ("TaskDescription_" + language in vm.stage) {
                    vm.stage.taskDescription = vm.stage["TaskDescription_" + language];
                }

                if ("URL_" + language in vm.stage) {
                    vm.UrlExists = (vm.stage["URL_" + language] != '');
                }
            }

            vm.name = NavigatorParameters.getParameters().StepName;
            Logger.sendLog('Treatment Plan', vm.stage);
        }

        //Links to the about page controlled by the contentController
        function about() {
            nav.pushPage('./views/templates/content.html', {
                contentLink: vm.stage ? vm.stage["URL_"+UserPreferences.getLanguage()] : '',
                contentType: $filter('translate')(vm.name)
            });
        }

    }


})();
