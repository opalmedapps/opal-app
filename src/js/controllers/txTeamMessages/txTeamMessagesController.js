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

    TxTeamMessagesController.$inject = [
        '$scope', 'TxTeamMessages','NavigatorParameters', '$timeout', '$filter','Notifications', 'Params'
    ];

    /* @ngInject */
    function TxTeamMessagesController($scope, TxTeamMessages, NavigatorParameters, $timeout, $filter, Notifications, Params) {
        var vm = this;
        vm.goToTeamMessage = goToTeamMessage;

        // Used by patient-data-handler
        vm.setTxTeamMessagesView = setTxTeamMessagesView;

        activate();

        //////////////////////////////

        function activate(){
            bindEvents();
        }

        /**
         * @description Filters and displays the treating team messages from the TxTeamMessages service.
         */
        function setTxTeamMessagesView() {
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
                TxTeamMessages.readTxTeamMessageBySerNum(message.TxTeamMessageSerNum);
                // Mark corresponding notifications as read
                Notifications.implicitlyMarkNotificationAsRead(
                    message.TxTeamMessageSerNum,
                    Params.NOTIFICATION_TYPES.TxTeamMessage,
                );
            }
            NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':message});
            personalNavigator.pushPage('./views/personal/treatment-team-messages/individual-team-message.html');
        }

        function bindEvents() {
            let navigator = NavigatorParameters.getNavigator();

            // Remove event listeners
            $scope.$on('$destroy', () => navigator.off('prepop'));

            // Reload user profile if announcement was opened via Notifications tab,
            // and profile was implicitly changed.
            navigator.on('prepop', () => NavigatorParameters.reloadPreviousProfilePrepopHandler());
        }
    }
})();
