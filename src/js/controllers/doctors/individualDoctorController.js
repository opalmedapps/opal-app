/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 12:21 PM
 */

/**
 * @ngdoc controller
 * @scope
 * @name MUHCApp.controller:ContactDoctorController
 * @requires vm
 * @description Controller manages the logic for the contact page of the doctor, the user is directed here through
 * the {@link MUHCApp.controller:HomeController HomeController} view.
 *
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContactIndividualController', ContactIndividualController);

    ContactIndividualController.$inject = ['NavigatorParameters','UserPreferences'];

    /* @ngInject */
    function ContactIndividualController(NavigatorParameters, UserPreferences) {
        var vm = this;
        vm.language = '';
        vm.doctor = null;
        vm.header = '';

        activate();

        ////////////////

        function activate() {
            var navi = NavigatorParameters.getNavigator();
            var page = navi.getCurrentPage();
            vm.doctor = page.options.doctor;
            vm.language = UserPreferences.getLanguage();
        }
    }
})();
