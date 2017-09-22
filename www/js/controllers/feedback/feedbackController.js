//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = [
        'RequestToServer', 'NetworkStatus','$scope'
    ];

    /* @ngInject */
    function FeedbackController(RequestToServer, NetworkStatus, $scope) {
    	var vm = this;

    	vm.submitFeedback = submitFeedback;
    	vm.reset = reset;

    	activate();

		//////////////////////

		function activate(){
            vm.enableSend=false;
    		bindEvents();
		}

		function bindEvents(){
            $scope.$watch('feedbackText',function(){
                if(($scope.feedbackText===''||!$scope.feedbackText))
                {
                    vm.enableSend = false;
                }else{
                    vm.enableSend = !!NetworkStatus.isOnline();
                }
            });
		}

        function submitFeedback(type){
            if(vm.enableSend)
            {
                RequestToServer.sendRequest('Feedback',{FeedbackContent: $scope.feedbackText, AppRating:3, Type: type});
                vm.feedbackText='';
                vm.submitted=true;
                vm.enableSend = false;
            }
        }

        function reset() {
            vm.submitted=false;
            $scope.feedbackText = '';
        }
    }
})();