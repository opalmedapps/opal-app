//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = [
        'RequestToServer', 'NetworkStatus', 'NativeNotification', '$scope', '$filter', '$timeout'
    ];

    /* @ngInject */
    function FeedbackController(RequestToServer, NetworkStatus, NativeNotification, $scope, $filter, $timeout) {
        var vm = this;

        vm.submitFeedback = submitFeedback;
        vm.reset = reset;

        activate();

        //////////////////////

        function activate() {
            vm.enableSend = false;
            bindEvents();
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