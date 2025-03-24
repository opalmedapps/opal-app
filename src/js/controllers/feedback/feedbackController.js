//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = [
        '$filter', '$scope', '$timeout', 'NativeNotification', 'NavigatorParameters',
        'NetworkStatus', 'RequestToServer',
    ];

    /* @ngInject */
    function FeedbackController($filter, $scope, $timeout, NativeNotification, NavigatorParameters,
                                NetworkStatus, RequestToServer) {
        var vm = this;

        vm.submitFeedback = submitFeedback;
        vm.reset = reset;

        activate();

        //////////////////////

        function activate() {
            let navigator = NavigatorParameters.getNavigator();
            let parameters = navigator.getCurrentPage().options;

            vm.enableSend = false;
            bindEvents();

            initializeContentBasedOnType(parameters.contentType);
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
                    vm.placeholder = 'LEAVEMESSAGE';
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
            if (vm.enableSend) {
                RequestToServer.sendRequestWithResponse('Feedback', {
                    FeedbackContent: $scope.feedbackText,
                    AppRating: 3,
                    Type: type
                }).then(function(){
                    $timeout(function(){
                        $scope.feedbackText = '';
                        vm.submitted = true;
                        vm.enableSend = false; 
                    });
                }).catch(function(error){
                    console.error(error);
                    NativeNotification.showNotificationAlert($filter('translate')("FEEDBACK_ERROR"));
                });
                
            }
        }

        function reset() {
            vm.submitted = false;
            $scope.feedbackText = '';
        }
    }
})();