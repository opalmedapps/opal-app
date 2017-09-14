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
    	vm.rateMaterial = rateMaterial;

    	activate();

		//////////////////////

		function activate(){
            vm.suggestionText='';
            vm.FirstName=Patient.getFirstName();
            vm.LastName=Patient.getLastName();
            vm.profilePicture=Patient.getProfileImage();
            vm.enableSend=false;
    		bindEvents();
            initRater();
		}

		function bindEvents(){
            $scope.$watch('feedbackText',function(){
                if((vm.feedbackText===''||!vm.feedbackText))
                {
                    vm.enableSend = !vm.emptyRating;
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


        function initRater()
        {
            vm.rate = [];
            vm.submitted = false;
            vm.emptyRating = true;
            for(var i = 0; i < 5;i++)
            {
                vm.rate.push({
                    'Icon':'ion-ios-star-outline'
                });
            }
        }

        function rateMaterial (index)
        {
            vm.enableSend=true;
            vm.emptyRating = false;
            vm.ratingValue = index+1;
            for(var i = 0; i < index+1;i++)
            {
                vm.rate[i].Icon = 'ion-star';
            }
            for(var j = index+1; j < 5;j++)
            {
                vm.rate[j].Icon = 'ion-ios-star-outline';
            }
        }
    }
})();