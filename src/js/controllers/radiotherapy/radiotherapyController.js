// add description see diagnosescontroller

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {body} from './testdata.js';


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

            // initCube();
            initBody();
        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
               // if (index === 0) return true;
               // var current = (new Date(vm.images[index].CreationDate)).setHours(0,0,0,0);
               // var previous = (new Date(vm.images[index-1].CreationDate)).setHours(0,0,0,0);
               // return current !== previous;
        }

        // Not used yet
        function goToRTPlan(plan){
    

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});

            personalNavigator.pushPage('./views/personal/radiotherapy/radiotherapy-plan.html', {plan});
            
            // init();
           


        }
        
        function initCube() {

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

        function initBody(){
            var scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);

            var camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 1, 500 );
            camera.position.z = 100;

            const light = new THREE.PointLight(0xffffff, 1.5);
            light.position.set(1000,1000,2000);
            scene.add(light);

            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(body);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        

            const material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:true});
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);



            const geometry2 = new THREE.SphereGeometry( 5);
            const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            const sphere = new THREE.Mesh( geometry2, material2 );
            sphere.position.set(84.86,-61.08,-0.5)
            // scene.add( sphere );

            // const geometry2 = new THREE.SphereGeometry( 5);
            // const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            const sphere2 = new THREE.Mesh( geometry2, material2 );
            sphere2.position.set(-609.84,-780.38,-0.5)
            scene.add( sphere2 );

            const sphere3 = new THREE.Mesh( geometry2, material2 );
            sphere3.position.set(145.9,-120.7,-0.5)
            // scene.add( sphere3 );

            const sphere4 = new THREE.Mesh( geometry2, material2 );
            sphere4.position.set(84.86,-61.08,-90.5)
            scene.add( sphere4 );

            const sphere5 = new THREE.Mesh( geometry2, material2 );
            sphere5.position.set(84.86,-61.08,70.5)
            scene.add( sphere5 );

            const sphere6 = new THREE.Mesh( geometry2, material2 );
            sphere6.position.set(145.9,-120.7,70.5)
            scene.add( sphere6 );

            const sphere7 = new THREE.Mesh( geometry2, material2 );
            sphere7.position.set(145.9,-120.7,-90.5)
            scene.add( sphere7 );
            // const colx1 

            const points = [];
            // points.push( new THREE.Vector3(84.86,-61.08,-0.5));
            // points.push( new THREE.Vector3(-609.84,-780.38,-0.5));
            // points.push( new THREE.Vector3(145.9,-120.7,-0.5));
            // points.push( new THREE.Vector3(-609.84,-780.38,-0.5));
            points.push( new THREE.Vector3(84.86,-61.08,-90.5));
            points.push( new THREE.Vector3(-609.84,-780.38,-0.5));
            points.push( new THREE.Vector3(84.86,-61.08,70.5));
            points.push( new THREE.Vector3(-609.84,-780.38,-0.5));
            points.push( new THREE.Vector3(145.9,-120.7,70.5));
            points.push( new THREE.Vector3(-609.84,-780.38,-0.5));
            points.push( new THREE.Vector3(145.9,-120.7,-90.5));
            points.push( new THREE.Vector3(145.9,-120.7,70.5));
            points.push( new THREE.Vector3(84.86,-61.08,70.5));
            points.push( new THREE.Vector3(84.86,-61.08,-90.5));
            points.push( new THREE.Vector3(145.9,-120.7,-90.5));
            const material3 = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 4 } );
            const geometry3 = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry3, material3 );
            scene.add(line)


            var renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.getElementById("holder").appendChild( renderer.domElement );



            

            const controls = new OrbitControls( camera, renderer.domElement );


            var animate = function () {
                requestAnimationFrame( animate );
              
                renderer.render( scene, camera );
              };
              
              animate();
            

        }
      

    }
               

})();
