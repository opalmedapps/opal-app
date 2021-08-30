// add description see diagnosescontroller

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('radiotherapyController', radiotherapyController);

    /* @ngInject */
    radiotherapyController.$inject = ['$filter','$scope','$timeout','NavigatorParameters','UserPreferences'];


    function radiotherapyController($filter, $scope, $timeout, NavigatorParameters, UserPreferences) {
        var vm = this;

        vm.rtPlans = [];
        

        vm.showHeader = showHeader;
        vm.goToRTPlan = goToRTPlan;
     

        // let camera, scene, renderer;
        // let geometry, material, mesh;


        activate();

        ////////////////

        function activate() {      

            vm.rtPlans = [
                {
                    name: "Test brainstem 3D"
                }

            ]
         

            
            //grab the language
            vm.language = UserPreferences.getLanguage();

            init();

        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
               // if (index === 0) return true;
               // var current = (new Date(vm.images[index].CreationDate)).setHours(0,0,0,0);
               // var previous = (new Date(vm.images[index-1].CreationDate)).setHours(0,0,0,0);
               // return current !== previous;
        }

        function goToRTPlan(plan){
    

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});

            personalNavigator.pushPage('./views/personal/radiotherapy/radiotherapy-plan.html', {plan});
            
            init();
           


        }
        
        function init() {

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

            var renderer = new THREE.WebGLRenderer();
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.getElementById("holder").appendChild( renderer.domElement );

            var geometry = new THREE.BoxGeometry( 1, 1, 1 );
            var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            var cube = new THREE.Mesh( geometry, material );
            scene.add( cube );

            camera.position.z = 5;

            const controls = new OrbitControls( camera, renderer.domElement );

            var animate = function () {
                requestAnimationFrame( animate );
              
                renderer.render( scene, camera );
              };
              
              animate();
            
        }
      

    }
               

})();
