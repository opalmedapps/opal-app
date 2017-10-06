/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-09-20
 * Time: 3:26 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualTxTeamMessageController', IndividualTxTeamMessageController);

    IndividualTxTeamMessageController.$inject = ['TxTeamMessages', 'NavigatorParameters', 'Patient', '$timeout'];

    /* @ngInject */
    function IndividualTxTeamMessageController(TxTeamMessages, NavigatorParameters, Patient, $timeout) {
        var vm = this;

        activate();

        ////////////////////

        function activate(){
            var parameters=NavigatorParameters.getParameters();

            $timeout(function(){
                vm.message = TxTeamMessages.setLanguageTxTeamMessages(parameters.Post);
                vm.FirstName = Patient.getFirstName();


                console.log(parameters.Post);
            });
        }
    }
})();