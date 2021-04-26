/*
 * Filename     :   individualRadiotherapyController3D.js
 * Description  :   Manages the individual radiotherapy views.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   April 2021
 */

import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualRadiotherapyController3D', IndividualRadiotherapyController3D);

    /* @ngInject */
    IndividualRadiotherapyController3D.$inject = ['$filter','$scope','$timeout','$translatePartialLoader','NavigatorParameters','Radiotherapy','UserPreferences'];


    function IndividualRadiotherapyController3D($filter, $scope, $timeout, $translatePartialLoader, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;

        vm.rtPlans = [];
        vm.plan = {};
        vm.RTPlan = {};

        let navigator = null;
        let navigatorName = '';
        let parameters;
        
        vm.loading = true;

        vm.cancerType = 'breast';
        vm.energyText = '';
        vm.isSingularEnergy = true;

        vm.goToRTPlan = goToRTPlan;


        let camera, scene, renderer, scene2;
        let group = new THREE.Group();
        let smoothMeshx;


        activate();

        ////////////////

        function activate() {      

            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
            parameters = NavigatorParameters.getParameters();
   
            vm.RTPlan = parameters.Post;
            console.log(vm.RTPlan)
            

            renderElements();


            
            //grab the language
            vm.language = UserPreferences.getLanguage();
            $translatePartialLoader.addPart('radiotherapy');


        }



    
        // Not used yet
        function goToRTPlan(plan){
    

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});
            personalNavigator.pushPage('./views/personal/radiotherapy/radiotherapy-test.html', {plan});


        }


        function renderElements(){
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf1f1f1);


            camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 10 , 550 );
            // camera.up.set( 0, 0, 1 );
            camera.position.y = -400
            camera.position.z = 100

            

            const light = new THREE.PointLight(0xffffff, 1);
            light.position.set(0,0,2000);
            scene.add(light);

            const light2 = new THREE.PointLight(0xffffff, 1);
            light2.position.set(0,0,-2000);
            scene.add(light2);

            const light3 = new THREE.PointLight(0xffffff, 1);
            light3.position.set(1000,-1000,0);
            scene.add(light3);

            const light4 = new THREE.PointLight(0xffffff, 1);
            light4.position.set(-1000,1000,0);
            scene.add(light4);

      
            var slices = vm.RTPlan.struct
            const keys = Object.keys(slices);
            
            var shape = new THREE.Shape();
            var pos = parseFloat(vm.RTPlan.sliceThickness)/2 + 0.5
            shape.moveTo(0,0);
            shape.lineTo(pos,0)
            shape.lineTo(pos,10)
            shape.lineTo(-pos, 10);
            shape.lineTo(-pos,0)
            shape.lineTo( 0, 0 );


            keys.forEach(function(key){
                renderSlicev2(key, JSON.parse(slices[key]), shape)
            })
            


            let colour = 0xA1AFBF

            for (let i = 1; i <= vm.RTPlan.numBeams; i++){
                renderBeamv2(vm.RTPlan.beams[i].beamPoints)
            }


            console.log(group.position.z)
            console.log("HELLO")
            console.log(parseFloat(vm.RTPlan.firstSlice) - parseFloat(vm.RTPlan.lastSlice))
            group.position.z -= (parseFloat(vm.RTPlan.firstSlice) + parseFloat(vm.RTPlan.lastSlice))/2 - 100

            scene.add(group)


            vm.loading = false;
            renderer = new THREE.WebGLRenderer({antialias: true});
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

        function renderSliceCap(slice){
            let colour = 0xA1AFBF//0x657383//0x29293d
            var slice1 = []

            for (let i = 0; i < slice.length; i+=21){
                slice1.push(new THREE.Vector2(slice[i], slice[i+1]))
            }
            const s1shape = new THREE.Shape(slice1)
            const geo1 = new THREE.ShapeBufferGeometry(s1shape)

            const mesh1 = new THREE.Mesh( geo1, new THREE.MeshPhongMaterial( {color:colour, side:THREE.DoubleSide,shininess:30}))
            mesh1.position.z = slice[2]
            group.add(mesh1)  
        }

        

        function renderSlicev2(z, slice, shape){
           
            z = parseFloat(z.replace('_','.'))
            slice = slice.map(Number)
   
            
            let colour = 0xA1AFBF//0x657383//0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            var array = [];

            var  geo, mesh;

            
            for (let i = 0; i < slice.length; i+=2){
                array.push(new THREE.Vector3(slice[i], slice[i+1], z))  
            }
          
            
            var sampleClosedSpline = new THREE.CatmullRomCurve3(array, true)
            geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})
            mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
         
            group.add(mesh)

    }

        

        function renderBeamv2(beamPoints){
            let points = [];
            let beamSource = new THREE.Vector3(parseFloat(beamPoints.beamSource[0]),parseFloat(beamPoints.beamSource[1]),parseFloat(beamPoints.beamSource[2]))
            beamPoints.field.forEach(function(pt){
                points.push(new THREE.Vector3(parseFloat(pt[0]), parseFloat(pt[1]), parseFloat(pt[2])))
            })
            beamPoints.field.forEach(function(pt){
                points.push(new THREE.Vector3(parseFloat(pt[0]), parseFloat(pt[1]), parseFloat(pt[2])))
                points.push(beamSource)
            })
            // points.push( new THREE.Vector3(c1[0],c1[1],c1[2]));
            // points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            // points.push( new THREE.Vector3(c2[0],c2[1],c2[2]));
            // points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            // points.push( new THREE.Vector3(c3[0],c3[1],c3[2]));
            // points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            // points.push( new THREE.Vector3(c4[0],c4[1],c4[2]));
            // points.push( new THREE.Vector3(c1[0],c1[1],c1[2]));
            // points.push( new THREE.Vector3(c2[0],c2[1],c2[2]));
            // points.push( new THREE.Vector3(c3[0],c3[1],c3[2]));
            // points.push( new THREE.Vector3(c4[0],c4[1],c4[2]));
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000} );//0xff0000, linewidth: 4 } );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines)

            lineGeometry.computeVertexNormals();
            const meshGeometry3 = new ConvexGeometry( points );

            // var convexGeom = new THREE.ConvexBufferGeometry(points);
            // var convexMat = new THREE.MeshNormalMaterial({wireframe: false});
            // smoothMeshx = new THREE.Mesh( convexGeom, convexMat)

            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.1});//0xff0000} );0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            smoothMeshx = new THREE.Mesh( meshGeometry3, smoothMaterialx)
            console.log("adding mesh")
            
            group.add(smoothMeshx)
       
        }

        function allSlices(slices, keys){
            var pts = []
            var indices = []
            var curr = 0;

            var colour = 0xA1AFBF

            console.log(slices)
            for (let i=0; i<keys.length; i++){
                let z = parseFloat(keys[i].replace('_','.'))
                
                let slice = JSON.parse(slices[keys[i]]).map(Number)
                
                for (let j=0; j<slice.length; j+=2){
                    console.log(slice.length/2)

                    pts.push(new THREE.Vector3(slice[j], slice[j+1], z))
                    if (j != slice.length-1 && i != keys.length-1){
                    let a = curr;
                    let b = curr + slice.length/2
                    let c = curr+1; 
                    let d = curr + slice.length/2 + 1
                    indices.push(a,b,c)
                    indices.push(b,c,d)
                }

                    curr ++;
                }
            }

            var geo = new THREE.BufferGeometry().setFromPoints(pts)
            geo.setIndex(indices)
            // geo.computeFaceNormals();
            // geo.computeVertexNormals();
            var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:colour, side:THREE.DoubleSide, shininess:40, wireframe:true}))
            group.add(mesh)
            console.log(indices)
            group.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );



        }    
    }

})();
