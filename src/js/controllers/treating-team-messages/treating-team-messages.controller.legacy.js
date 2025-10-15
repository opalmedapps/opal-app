// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('TxTeamMessagesController', TxTeamMessagesController);

    TxTeamMessagesController.$inject = ['$filter', '$timeout', 'Navigator', 'Notifications', 'Params', 'TxTeamMessages'];

    /* @ngInject */
    function TxTeamMessagesController($filter, $timeout, Navigator, Notifications, Params, TxTeamMessages) {
        let vm = this;
        let navigator;

        vm.goToTeamMessage = goToTeamMessage;

        // Used by patient-data-handler
        vm.setTxTeamMessagesView = setTxTeamMessagesView;

        activate();

        //////////////////////////////

        function activate(){
            navigator = Navigator.getNavigator();
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
                Notifications.implicitlyMarkCachedNotificationAsRead(
                    message.TxTeamMessageSerNum,
                    Params.NOTIFICATION_TYPES.TxTeamMessage,
                );
            }
            navigator.pushPage('./views/personal/treating-team-messages/treating-team-message-individual.legacy.html', {'Post': message});
        }
    }
})();
