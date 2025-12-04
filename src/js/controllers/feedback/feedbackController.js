// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = [
        '$filter', '$scope', '$timeout', 'NativeNotification', 'Navigator',
        'NetworkStatus', 'RequestToServer', 'User'
    ];

    /* @ngInject */
    function FeedbackController($filter, $scope, $timeout, NativeNotification, Navigator,
                                NetworkStatus, RequestToServer, User) {
        var vm = this;
        vm.isSubmitting = false;
        vm.userInfo = {};

        vm.submitFeedback = submitFeedback;
        vm.reset = reset;

        activate();

        //////////////////////

        function activate() {
            let navigator = Navigator.getNavigator();
            let parameters = navigator.getCurrentPage().options;

            vm.enableSend = false;
            bindEvents();

            initializeContentBasedOnType(parameters.contentType);
            vm.userInfo = User.getUserInfo();
        }

        /**
         * @description Sets strings in the view based on the type of feedback.
         * @param {string} contentType The type of feedback.
         */
        function initializeContentBasedOnType(contentType) {
            vm.feedbackType = contentType;
            switch (contentType) {
                case 'general':
                    vm.title = 'FEEDBACK';
                    vm.description = 'FEEDBACK_MESSAGE';
                    vm.placeholder = 'FEEDBACK_LEAVE_MESSAGE';
                    break;
                case 'research':
                    vm.title = 'RESEARCH_FEEDBACK';
                    vm.description = 'RESEARCH_FEEDBACK_MESSAGE';
                    vm.placeholder = 'RESEARCH_FEEDBACK_PLACEHOLDER';
                    break;
                default:
                    throw `Invalid contentType = "${contentType}" for feedback form`;
            }
        }

        function bindEvents() {
            $scope.$watch('feedbackText', function () {
                if (($scope.feedbackText === '' || !$scope.feedbackText)) {
                    vm.enableSend = false;
                } else {
                    vm.enableSend = NetworkStatus.isOnline();
                }
            });
        }

        function submitFeedback(type) {
            if (vm.enableSend && !vm.isSubmitting) {
                vm.isSubmitting = true;
                RequestToServer.sendRequestWithResponse('Feedback', {
                    FeedbackContent: $scope.feedbackText,
                    AppRating: 3,
                    Type: type
                }).then(function(){
                    $timeout(function(){
                        $scope.feedbackText = '';
                        vm.submitted = true;
                        vm.enableSend = false;
                        vm.isSubmitting = false;
                    });
                }).catch(function(error){
                    console.error(error);
                    $timeout(function() {
                        NativeNotification.showNotificationAlert($filter('translate')("FEEDBACK_ERROR"));
                        vm.isSubmitting = false;
                    });
                });

            }
        }

        function reset() {
            vm.submitted = false;
            $scope.feedbackText = '';
            vm.isSubmitting = false;
        }
    }
})();
