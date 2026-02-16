// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('OnceOnlyController', OnceOnlyController);

    OnceOnlyController.$inject = ['$filter', '$scope', '$timeout', 'NativeNotification', 'Navigator', 'Params',
        'Questionnaires', 'UpdateUI'];

    function OnceOnlyController($filter, $scope, $timeout, NativeNotification, Navigator, Params,
                                Questionnaires, UpdateUI) {
        const vm = this;

        let navigator;

        vm.display = display;

        activate();

        function activate() {
            navigator = Navigator.getNavigator();

            // Get the once-only questionnaire and set it in the Questionnaire service
            Questionnaires.clearAllQuestionnaire();
            Questionnaires.requestOnceOnlyQuestionnaire();

            // Force questionnaires to be re-downloaded after this, if the user visits another questionnaires page
            UpdateUI.updateTimestamps('QuestionnaireList', 0);

            display();
        }

        function display() {
            let onceOnlyQuestionnaires = [
                ...Questionnaires.getQuestionnaireList(Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS.NEW_QUESTIONNAIRE_STATUS),
                ...Questionnaires.getQuestionnaireList(Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS.IN_PROGRESS_QUESTIONNAIRE_STATUS),
            ];

            if (onceOnlyQuestionnaires.length === 0) {
                handleError('No once-only questionnaires found with status new or in progress');
                return;
            }

            if (onceOnlyQuestionnaires.length > 1) {
                console.warn('Multiple once-only questionnaires defined for this user; some data may be ignored');
            }

            $timeout(() => {
                navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {
                    animation: 'fade', // OnsenUI
                    answerQuestionnaireId: onceOnlyQuestionnaires[0].qp_ser_num,
                    onceOnly: true,
                });
            }, 500);
        }

        /**
         * @description Handle errors on this page by going back to the previous page with a generic message.
         * @param {*} error A caught error to be printed to the console.
         */
        function handleError(error) {
            if (error) console.error(error);
            navigator.popPage();
            NativeNotification.showNotificationAlert($filter('translate')('SERVER_ERROR_ALERT'));
        }
    }
})();
