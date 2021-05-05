/*
 * Filename     :   individualRadiotherapyController.js
 * Description  :   Manages the individual radiotherapy views.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   April 2021
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
        vm.showDetails = true;

        vm.show3DPlan = show3DPlan
        vm.goTo3DPlan = goTo3DPlan;

        let camera, scene, renderer, controls;

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

            camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 10 , 700 );
            camera.up.set( 1, 0, 0 );
            camera.position.y = -400
            camera.position.x = 100

            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize( window.innerWidth, window.innerHeight );
            controls = new OrbitControls( camera, renderer.domElement)

            $scope.$on('$destroy', function() {
                navigator.off('postpop');
            })
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

        function show3DPlan(){
            if (scene==undefined){ scene = Radiotherapy.getScene()
            var animate = function () {
                requestAnimationFrame( animate );
            
                controls.update();
            
                renderer.render( scene, camera );

            };
            animate();

        }
            ons.ready(function() {
                document.getElementById("holder").appendChild( renderer.domElement );    
            })
        }


    }

})();
