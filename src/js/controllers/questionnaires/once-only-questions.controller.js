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
        let pagePushed = 0;

        vm.dataHandlerParameters = {};

        vm.display = display;

        activate();

        function activate() {
            navigator = Navigator.getNavigator();

            bindEvents();

            let purpose = 'once-only';
            if (!Params.QUESTIONNAIRE_PURPOSES.includes(purpose)) {
                $timeout(() => {
                    handleError(`Configuration error: questionnaire purpose "${purpose}" has not been defined`);
                });
            }
            else vm.dataHandlerParameters.purpose = purpose;
        }

        function bindEvents() {
            $scope.$on('$destroy', () => {
                pagePushed = 0;
            });
        }

        async function display() {
            // Force questionnaires to be re-downloaded after this, if the user visits another questionnaires page
            UpdateUI.updateTimestamps('QuestionnaireList', 0);

            let onceOnlyQuestionnaires = [
                ...Questionnaires.getQuestionnaireList(Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS.NEW_QUESTIONNAIRE_STATUS),
                ...Questionnaires.getQuestionnaireList(Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS.IN_PROGRESS_QUESTIONNAIRE_STATUS),
            ];

            if (onceOnlyQuestionnaires.length === 0) {
                handleError('No questionnaires returned from the listener with status new or in progress, and with purpose "once-only"');
                return;
            }

            if (onceOnlyQuestionnaires.length > 1) {
                console.warn('Multiple "once-only" questionnaires defined for this user; some data may be ignored');
            }

            // Needed to prevent multiple pushes, because this function may be called by the patient-data-handler more than once
            if (pagePushed === 0) {
                pagePushed += 1;

                $timeout(() => {
                    navigator.replacePage('views/personal/questionnaires/answeredQuestionnaire.html', {
                        animation: 'fade', // OnsenUI
                        answerQuestionnaireId: onceOnlyQuestionnaires[0].qp_ser_num,
                        onceOnly: true,
                    });
                }, 500);
            }
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
