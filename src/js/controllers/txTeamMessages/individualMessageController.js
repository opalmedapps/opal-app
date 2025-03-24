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

    IndividualTxTeamMessageController.$inject = ['TxTeamMessages', 'NavigatorParameters', 'ProfileSelector', '$timeout'];

    /* @ngInject */
    function IndividualTxTeamMessageController(TxTeamMessages, NavigatorParameters, ProfileSelector, $timeout) {
        var vm = this;

        activate();

        ////////////////////

        function activate(){
            var parameters=NavigatorParameters.getParameters();

            $timeout(function(){
                vm.message = TxTeamMessages.setLanguageTxTeamMessages(parameters.Post);
                vm.FirstName = ProfileSelector.getFirstName();
            });
        }
    }
})();