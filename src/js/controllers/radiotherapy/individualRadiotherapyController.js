/*
 * Filename     :   individualRadiotherapyController.js
 * Description  :   Manages the individual radiotherapy views.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   April 2021
 */


(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualRadiotherapyController', IndividualRadiotherapyController);

    /* @ngInject */
    IndividualRadiotherapyController.$inject = ['$filter','$scope','$timeout','$translatePartialLoader','NavigatorParameters','Radiotherapy','UserPreferences'];


    function IndividualRadiotherapyController($filter, $scope, $timeout, $translatePartialLoader, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;

        vm.RTPlan = {};

        let navigator = null;
        let navigatorName = '';
        let parameters;
        
        vm.loading = true;

        vm.cancerType = 'breast';
        vm.energyText = '';
        vm.isSingularEnergy = true;

        vm.goTo3DPlan = goTo3DPlan;


        activate();

        ////////////////

        function activate() {      

            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            parameters = NavigatorParameters.getParameters();
   
            vm.plan = parameters.Post;

            

        
        Radiotherapy.requestRTDicomContent(vm.plan.DicomSerNum)
        .then(function (plan) {
            vm.RTPlan = plan;  

            setEnergyText();

            vm.loading = false;
        })
        .catch(function(error){
            $timeout(function(){
                vm.loading = false;
            //     handleRequestError();
            })
        });

            
            //grab the language
            vm.language = UserPreferences.getLanguage();
            $translatePartialLoader.addPart('radiotherapy');


        }

        function setEnergyText(){
            let energyArray = vm.RTPlan.beamEnergy;
            if (energyArray.length === 1){
                vm.isSingularEnergy = true;
                vm.energyText = energyArray[0];
            } else {
                vm.isSingularEnergy = false;
                vm.energyText = energyArray[0];
                var i;
                for (i = 1; i < energyArray.length - 1; i++){
                    vm.energyText += ", ";
                    vm.energyText += energyArray[i];
                } 
                vm.energyText += " and ";
                vm.energyText += energyArray[i];
            }
        }

        
        function goTo3DPlan(plan){
            NavigatorParameters.setParameters({'Navigator': navigator, 'Post': vm.RTPlan})
            navigator.pushPage('./views/personal/radiotherapy/radiotherapy-plan.html', {plan});

        }

    }

})();
