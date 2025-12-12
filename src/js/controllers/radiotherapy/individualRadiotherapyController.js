import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * @description Manages the individual radiotherapy views.
 * @author Kayla O'Sullivan-Steben
 * @date April 2021
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IndividualRadiotherapyController', IndividualRadiotherapyController);

    IndividualRadiotherapyController.$inject = ['$scope', '$timeout', '$translatePartialLoader', 'Navigator',
        'Radiotherapy','UserPreferences'];

    function IndividualRadiotherapyController($scope, $timeout, $translatePartialLoader, Navigator,
                                              Radiotherapy, UserPreferences) {
        let vm = this;

        let navigator;

        // 3D scene variables
        let camera, scene, renderer, controls;

        vm.beams = [];
        vm.energyText = '';
        vm.isSingularEnergy = true;
        vm.loading = true;
        vm.RTPlan = {};
        vm.showDetails = true;

        vm.show3DPlan = show3DPlan;
        vm.updateVisibility = updateVisibility;

        activate();

        ////////////////

        function activate() {
            bindEvents();

            navigator = Navigator.getNavigator();
            let parameters = Navigator.getParameters();

            vm.plan = parameters.Post;

            Radiotherapy.requestRTDicomContent(vm.plan.DicomSerNum).then(plan => {
                vm.RTPlan = plan;

                setBeamNumbers();
                setEnergyText();

            }).catch(error => {
                console.error(error);
                $timeout(() => {
                    // TODO: Add error handling
                    // handleRequestError();
                });

            }).finally(() => {
                vm.loading = false;
            });

            // Grab the language
            vm.language = UserPreferences.getLanguage();
            $translatePartialLoader.addPart('radiotherapy'); // Load radiotherapy en/fr.json files

            // Set scene camera
            camera = new THREE.PerspectiveCamera(100, window.innerWidth/window.innerHeight, 10 , 700);
            camera.up.set(1, 0, 0);
            camera.position.y = -400;
            camera.position.x = 100;

            // Set renderer and orbit controls
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight - 30);
            controls = new OrbitControls(camera, renderer.domElement); // Allows camera to be rotated around object
        }

        function bindEvents() {
            $scope.$on('$destroy', () => {
                navigator.off('postpop');
            });
        }

        /**
         * @description Formats beam numbers to be looped through in the view as integers.
         */
        function setBeamNumbers() {
            vm.beams = Array.from({length: vm.RTPlan.numBeams}, (_, i) => i);
        }

        /**
         * @description Sets the text listing the energy(ies), e.g. "6 MV"; "6 MV and 9 MV"; "6 MV, 9 MV and 12 MV".
         *              If there are multiple, vm.isSingularEnergy is set to false so that the text in the view uses plural words
         *              (i.e. "energy values" vs "an energy value").
         */
        function setEnergyText() {
            let energyArray = vm.RTPlan.beamEnergy;
            if (energyArray.length === 1) {
                vm.isSingularEnergy = true;
                vm.energyText = energyArray[0];
            }
            else {
                vm.isSingularEnergy = false;
                vm.energyText = energyArray[0];
                let i;
                for (i = 1; i < energyArray.length - 1; i++) {
                    vm.energyText += ', ';
                    vm.energyText += energyArray[i];
                }
                vm.energyText += ' and ';
                vm.energyText += energyArray[i];
            }
        }

        /**
         * @description Manages the beam visibility linked to the checkboxes in the view.
         */
        function updateVisibility(n) {
            scene.children[4].children[n*2].visible = document.getElementById('beamCheckbox-' + n).checked;
            scene.children[4].children[n*2+1].visible = document.getElementById('beamCheckbox-' + n).checked;
        }

        /**
         * @description Shows the 3D scene.
         */
        function show3DPlan() {
            // Render scene if not already rendered
            if (!scene) {
                scene = Radiotherapy.getScene();

                let animate = function () {
                    requestAnimationFrame(animate);
                    controls.update();
                    renderer.render(scene, camera);
                };
                animate();
            }

            ons.ready(function() {
                document.getElementById('holder').appendChild(renderer.domElement);
            });
        }
    }
})();
