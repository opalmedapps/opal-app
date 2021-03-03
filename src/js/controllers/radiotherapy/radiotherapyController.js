// add description see diagnosescontroller

import * as THREE from 'three';
import { ConvexBufferGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {body,head, s1, s2, s3, s4, s5, s6 } from './testdata.js';

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
     

        let camera, scene, renderer, group;
        let smoothMeshx, geometry, tube, mesh, points, points3d;
        var pointsno = [];
        var pointsyes = []
        var meshes = [];
        // let geometry, material, mesh;

        var SAD = 1000;
        var beams = {
            1:{
                isocenter: {x:84.86, y:-61.08,z:-0.5},
                gantryAngle: 316,
                X1: 0,
                X2: 86,
                Y1: -90,
                Y2: 80
            },
            2:{
                isocenter: {x:84.86, y:-61.08,z:-0.5},
                gantryAngle: 136,
                X1: -103.33,
                X2: 0,
                Y1: -90,
                Y2: 80
            }
        }

        activate();

        ////////////////

        function activate() {      

            // vm.rtPlans = [
            //     {
            //         name: "Test brainstem 3D"
            //     }

            // ]
         

            
            //grab the language
            vm.language = UserPreferences.getLanguage();

            renderElements();
            
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


        function renderElements(){
           
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf1f1f1);

            group = new THREE.Group();

            camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 1, 1000 );
            camera.position.y = -300
            camera.position.z = 100
            

            const light = new THREE.PointLight(0xffffff, 1.5);
            light.position.set(0,0,2000);
            scene.add(light);

            const light2 = new THREE.PointLight(0xffffff, 1.5);
            light2.position.set(0,0,-2000);
            scene.add(light2);

            const light3 = new THREE.PointLight(0xffffff, 1.5);
            light3.position.set(1000,-1000,0);
            scene.add(light3);

            const light4 = new THREE.PointLight(0xffffff, 1.5);
            light4.position.set(-1000,1000,0);
            scene.add(light4);

            // const axesHelper = new THREE.AxesHelper( 300 );
            // scene.add( axesHelper );
          
            renderBody();
            renderBeam(beams[1])
            renderBeam(beams[2])


        //     let hull = new ConvexHull().setFromObject(meshes[0])
        //     let hull1 = new ConvexHull().setFromObject(meshes[1])
        //     points3d.forEach(function(vertex){
        //         if (hull.containsPoint(vertex) || hull1.containsPoint(vertex)){
        //             pointsyes.push(vertex)
        //         } else {
        //             pointsno.push(vertex)
        //         }
        //     } )

        //     const material = new THREE.LineBasicMaterial( {
        //         color: 0xff6666,})
                
        // const geometry = new THREE.BufferGeometry().setFromPoints( pointsyes );
        // const lines = new THREE.Line(geometry, material)
        // group.add(lines)

            
       
            // var currZ = pointsyes[0].z
            // var newZ = currZ

            // var array = []
            // var geo;
            // var shape = new THREE.Shape();
            // shape.moveTo(0,0);
            // shape.lineTo(1.5,1)
            // shape.lineTo(1.5,-1)
            // shape.lineTo( -1.5,-1);
            // shape.lineTo(-1.5,1)
            // // shape.lineTo( 0, 0 );
    
            // pointsyes.forEach(function(vert){
            //     newZ = vert.z
            //     if (newZ != currZ){
            //             var sampleClosedSpline = new THREE.CatmullRomCurve3( array);
            //             var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4);
            //             geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})
            //             mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:0x4C0B5F, side:THREE.DoubleSide, shininess:40})) //0x04B45F
            //             currZ = newZ;
            //             group.add(mesh)
                        
            //             array = [];
            //         }
    
            //        array.push(vert)
                
            // })

            scene.add(group)

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

        function renderBody(){
            
            let colour = 0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(body);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const positionAttribute = geometry.getAttribute( 'position' );
            points3d = []
            var hole = []
            var total = []

            for ( let i = 0; i < positionAttribute.count; i += 3 ) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute( positionAttribute, i );
                points3d.push( vertex );
                total.push(vertex)
                hole.push(new THREE.Vector3(vertex.x*.9, vertex.y*.9, vertex.z))
                total.push(new THREE.Vector3(vertex.x*.9, vertex.y*.9, vertex.z))
          
            }


            var slice1 = []

            for (let i = 0; i < s1.length; i+=3){
                slice1.push(new THREE.Vector2(s1[i], s1[i+1]))
            }
            const s1shape = new THREE.Shape(slice1)
            const geo1 = new THREE.ShapeBufferGeometry(s1shape)

            const mesh1 = new THREE.Mesh( geo1, new THREE.MeshPhongMaterial( {color:colour, side:THREE.DoubleSide,shininess:30}))
            mesh1.position.z = s1[2]
            group.add(mesh1)

            var slice6 = []

            for (let i = 0; i < s6.length; i+=3){
                slice6.push(new THREE.Vector2(s6[i], s6[i+1]))
            }
            const s6shape = new THREE.Shape(slice6)
            const geo6 = new THREE.ShapeBufferGeometry(s6shape)

            const mesh6 = new THREE.Mesh( geo6, new THREE.MeshPhongMaterial( {color:colour, side:THREE.DoubleSide,shininess:30}))
            mesh6.position.z = s6[2]
            group.add(mesh6)

            var currZ = body[2];
            var newZ = body[2]
            var array = [];

            var shape, geo, mesh, hole;


            shape = new THREE.Shape();
            shape.moveTo(0,0);
            shape.lineTo(1.5,0)
            shape.lineTo(1.5,1)
            shape.lineTo( -1.5, 1);
            shape.lineTo(-1.5,0)
            shape.lineTo( 0, 0 );

            for (let i = 0; i < body.length; i+=18){
                newZ = body[i+2]
                if (newZ != currZ){ 

                    var sampleClosedSpline = new THREE.CatmullRomCurve3( array, true);
                    var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4, true);
                    geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})
                    mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
                    currZ = newZ;
                    group.add(mesh)
                    
                    array = [];
                }

               array.push(new THREE.Vector3(body[i], body[i+1], body[i+2]))
            }
    }


        function renderBeam(beam){
            let xi = beam.isocenter.x;
            let yi = beam.isocenter.y;
            let zi = beam.isocenter.z;

            let angle = beam.gantryAngle * Math.PI / 180;

            let beamSource = [xi + SAD*Math.sin(angle), yi - SAD*Math.cos(angle), zi];

            let c1 = [xi + beam.X1*Math.cos(angle), yi + beam.X1*Math.sin(angle), zi + beam.Y2]
            let c2 = [xi + beam.X2*Math.cos(angle), yi + beam.X2*Math.sin(angle), zi + beam.Y2]
            let c3 = [xi + beam.X2*Math.cos(angle), yi + beam.X2*Math.sin(angle), zi + beam.Y1]
            let c4 = [xi + beam.X1*Math.cos(angle), yi + beam.X1*Math.sin(angle), zi + beam.Y1]

            var beamPoints = [];
            beamPoints.push(beamSource)
            beamPoints.push(c1)
            beamPoints.push(c2)
            beamPoints.push(c3)
            beamPoints.push(c4)

            // beamPoints.push(xi + SAD*Math.sin(angle), yi - SAD*Math.cos(angle), zi)

            // beamPoints.push(xi + beam.X1*Math.cos(angle), yi + beam.X1*Math.sin(angle), zi + beam.Y2)
            // beamPoints.push(xi + beam.X2*Math.cos(angle), yi + beam.X2*Math.sin(angle), zi + beam.Y2)
            // beamPoints.push(xi + beam.X2*Math.cos(angle), yi + beam.X2*Math.sin(angle), zi + beam.Y1)
            // beamPoints.push(xi + beam.X1*Math.cos(angle), yi + beam.X1*Math.sin(angle), zi + beam.Y1)

            let pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(beamPoints, 3));

            const geometry2 = new THREE.SphereGeometry( 5);
            const material2 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            beamPoints.forEach(function(point){
                let sphere = new THREE.Mesh(geometry2, material2);
                sphere.position.set(point[0], point[1], point[2])
                group.add(sphere)                
            });


        
            
            const points = [];
            points.push( new THREE.Vector3(c1[0],c1[1],c1[2]));
            points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            points.push( new THREE.Vector3(c2[0],c2[1],c2[2]));
            points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            points.push( new THREE.Vector3(c3[0],c3[1],c3[2]));
            points.push( new THREE.Vector3(beamSource[0],beamSource[1],beamSource[2]));
            points.push( new THREE.Vector3(c4[0],c4[1],c4[2]));
            points.push( new THREE.Vector3(c1[0],c1[1],c1[2]));
            points.push( new THREE.Vector3(c2[0],c2[1],c2[2]));
            points.push( new THREE.Vector3(c3[0],c3[1],c3[2]));
            points.push( new THREE.Vector3(c4[0],c4[1],c4[2]));
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 4 } );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines)

            lineGeometry.computeVertexNormals();

            const meshGeometry3 = new ConvexGeometry( points );
            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            smoothMeshx = new THREE.Mesh( meshGeometry3, smoothMaterialx)
            group.add(smoothMeshx)

            meshes.push(smoothMeshx)
       
        }
    }

})();
