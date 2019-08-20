/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: appointmentDelaysController
 *  @description
 *
 *  Manages Appointment Delays
 */



(function(){
    "use strict";

    angular.module('MUHCApp')
        .controller('AppointmentDelaysController', AppointmentDelaysController);

    AppointmentDelaysController.$inject = ['NavigatorParameters', 'UserPreferences', 'DelaysService', '$timeout', '$window', '$q', '$scope'];

    /* @ngInject */
    function AppointmentDelaysController(NavigatorParameters, UserPreferences, DelaysService, $timeout, $window, $q, $scope) {
        var vm = this;

        var navigatorName;

        vm.language = '';

        vm.app = null;

        vm.delays = { chart: null, presenter: null };

        vm.corrupted_appointment = false;

        activate();

        function activate() {

            var parameters = NavigatorParameters.getParameters();
            var language = UserPreferences.getLanguage().toUpperCase();
            navigatorName = parameters.Navigator;
            vm.delays.chart = DelaysService.newDelaysChart(language);

                        $timeout(function(){
                            vm.language = language;
                            vm.app = parameters.Post;

                            if (!(vm.corrupted_appointment = !vm.app || Object.keys(vm.app).length === 0)) {
                                DelaysService.getWaitingTimes(vm.app, language)
                                    .then(function(response) {
                                        var sets = response.sets;
                                        var sum = sets.set1 + sets.set2 + sets.set3 + sets.set4;
                                        vm.delays.presenter = DelaysService.getPresenter(vm.app, response, language);
                                        if (sum !== 0) {
                                            vm.nonZeroData = true;
                                            vm.delays.chart.updater.deliver([
                                                +((sets.set1 / sum) * 100).toFixed(2),
                                                +((sets.set2 / sum) * 100).toFixed(2),
                                                +((sets.set3 / sum) * 100).toFixed(2),
                                                +((sets.set4 / sum) * 100).toFixed(2),
                                                +((sets.set1)),
                                                +((sets.set2)),
                                                +((sets.set3)),
                                                +((sets.set4))
                                            ]);
                                        } else{
                                            vm.delays.presenter = DelaysService.getPresenter(vm.app, null, language)
                                            vm.nonZeroData = false;
                                        }
                                    }).catch(function(err) {
                                        $timeout(function () {
                                            if(err == 'There are no visualizations for this appointment yet' ||
                                                err == 'There are no visualizations for this kind of appointment yet.' ||
                                            err == 'Inconnu' || err == 'Il n\'y a pas encore de visualization pour ce genre de rendez-vous.'){
                                                vm.delays.err = err
                                            } else{
                                                var phrase = translate(language)
                                                vm.delays.err = phrase
                                            }
                                        })
                        })
        }
        })
        }

        function translate(language){
            var languages_en = {
                unknownAppointment: "The visualizations for this appointment haven't been developed yet"
            }
            var languages_fr = {
                unknownAppointment: "Il n'y a pas encore de visualization pour ce rendez-vous"
            }
            var languages = {
                EN: languages_en,
                FR: languages_fr
            }
            var translator = languages[language] || languages.EN
            return translator.unknownAppointment
        }
}
})();
