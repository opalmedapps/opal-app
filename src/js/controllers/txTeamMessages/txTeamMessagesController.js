/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('TxTeamMessagesController', TxTeamMessagesController);

    TxTeamMessagesController.$inject = ['TxTeamMessages','NavigatorParameters', '$timeout', '$filter'];

    /* @ngInject */
    function TxTeamMessagesController(TxTeamMessages, NavigatorParameters, $timeout, $filter) {
        var vm = this;
        vm.goToTeamMessage = goToTeamMessage;

        activate();

        //////////////////////////////

        function activate(){
            vm.noMessages = true;
            var messages = TxTeamMessages.setLanguageTxTeamMessages(TxTeamMessages.getTxTeamMessages());
            if (messages.length > 0) vm.noMessages = false;

            $timeout(function(){
                vm.txTeamMessages = $filter('orderBy')(messages, '-DateAdded');
            });

        }

        function goToTeamMessage(message){
            if(message.ReadStatus === '0')
            {
                message.ReadStatus = '1';
                TxTeamMessages.readTxTeamMessageBySerNum(message.TxTeamMessageSerNum);
            }
            NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':message});
            personalNavigator.pushPage('./views/personal/treatment-team-messages/individual-team-message.html');
        }
    }
})();


