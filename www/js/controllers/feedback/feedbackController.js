//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('FeedbackController', FeedbackController);

    FeedbackController.$inject = [
        'Patient', 'RequestToServer', 'NetworkStatus','$scope'
    ];

    /* @ngInject */
    function FeedbackController(Patient, RequestToServer, NetworkStatus, $scope) {
    	var vm = this;

    	vm.submitFeedback = submitFeedback;

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
                RequestToServer.sendRequest('Feedback',{FeedbackContent: vm.feedbackText, AppRating:3, Type: type});
                vm.feedbackText='';
                vm.submitted=true;
                vm.enableSend = false;
            }
        }
    }
})();