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
        .module('OpalApp')
        .controller('IndividualRadiotherapyController', IndividualRadiotherapyController);

    /* @ngInject */
    IndividualRadiotherapyController.$inject = ['$filter','$scope','$timeout','$translatePartialLoader','NavigatorParameters','Radiotherapy','UserPreferences'];


    function IndividualRadiotherapyController($filter, $scope, $timeout, $translatePartialLoader, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;

        // Navigator variables
        let navigator = null;
        let navigatorName = '';
        let parameters;
        
        // vm variables
        vm.beams;
        vm.energyText = '';
        vm.isSingularEnergy = true;
        vm.loading = true;
        vm.RTPlan = {};
        vm.showDetails = true;

        // vm functions
        vm.show3DPlan = show3DPlan;
        vm.updateVisibility = updateVisibility;

        // 3D scene variables
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

            setBeamNumbers();
            setEnergyText();

            vm.loading = false;
        })
        .catch(function(error){
            $timeout(function(){
                vm.loading = false;
                // TODO: Add error handling
                // handleRequestError();
            })
        });

            
            //grab the language
            vm.language = UserPreferences.getLanguage();
            $translatePartialLoader.addPart('radiotherapy'); // Load radiotherapy en/fr.json files

            // Set scene camera
            camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 10 , 700 );
            camera.up.set( 1, 0, 0 );
            camera.position.y = -400;
            camera.position.x = 100;

            // Set renderer and orbit controls
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize( window.innerWidth, window.innerHeight-30);
            controls = new OrbitControls( camera, renderer.domElement); // Allows camera to be rotated around object

            $scope.$on('$destroy', function() {
                navigator.off('postpop');
            })
        }

        // Format beam numbers to be looped through in view as integers
        function setBeamNumbers(){
            vm.beams = Array.from({length: vm.RTPlan.numBeams}, (_, i) => i);
        }

        // Set the text listening the energy(ies). E.g. "6 MV"; "6 MV and 9 MV"; "6 MV, 9 MV and 12 MV";
        // If there are multiple, vm.isSingularEnergy is set to false so that the text in the view uses plural words (i.e. "energy values" vs "an energy value")
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

        // Manages the beam visibility linked to the checkboxes in the view
        function updateVisibility(n){
            scene.children[4].children[n*2].visible = document.getElementById("beamCheckbox-"+n).checked;
            scene.children[4].children[n*2+1].visible = document.getElementById("beamCheckbox-"+n).checked;
        }


        // Show the 3D scene
        function show3DPlan(){ 
            // Render scene if not already rendered
            if (scene==undefined){ 
                scene = Radiotherapy.getScene();

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
