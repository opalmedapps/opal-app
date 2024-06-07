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

    IndividualTxTeamMessageController.$inject = ['TxTeamMessages', 'Navigator', 'ProfileSelector', '$timeout'];

    /* @ngInject */
    function IndividualTxTeamMessageController(TxTeamMessages, Navigator, ProfileSelector, $timeout) {
        var vm = this;

        activate();

        ////////////////////

        function activate(){
            let parameters = Navigator.getParameters();

            $timeout(function(){
                vm.message = TxTeamMessages.setLanguageTxTeamMessages(parameters.Post);
                vm.FirstName = ProfileSelector.getFirstName();
            });
        }
    }
})();