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

    TxTeamMessagesController.$inject = ['TxTeamMessages','NavigatorParameters', '$timeout'];

    /* @ngInject */
    function TxTeamMessagesController(TxTeamMessages, NavigatorParameters, $timeout) {
        var vm = this;

        vm.goToTeamMessage = goToTeamMessage;
        vm.showHeader = showHeader;

        // Used by patient-data-handler
        vm.setTxTeamMessagesView = setTxTeamMessagesView;

        activate();

        //////////////////////////////

        function activate(){

        }

        /**
         * @description Filters and displays the treating team messages from the TxTeamMessages service.
         */
        function setTxTeamMessagesView() {
            vm.noMessages = true;
            var messages = TxTeamMessages.setLanguageTxTeamMessages(TxTeamMessages.getTxTeamMessages());
            if (messages.length > 0) vm.noMessages = false;

            $timeout(function(){
                vm.txTeamMessages = messages
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

        function showHeader(index){
            if (index === vm.txTeamMessages.length -1) return true;
            var current = (new Date(vm.txTeamMessages[index].DateAdded)).setHours(0,0,0,0);
            var previous = (new Date(vm.txTeamMessages[index+1].DateAdded)).setHours(0,0,0,0);
            return current !== previous;
        }
    }
})();
