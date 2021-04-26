/*
 * Filename     :   individualRadiotherapyController3D.js
 * Description  :   Manages the individual radiotherapy views.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   April 2021
 */

import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dicomParser from 'dicom-parser';

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
        vm.uploadDICOM = uploadDICOM;
     
        vm.filesUploaded = false;

        let camera, scene, renderer, scene2;
        let group = new THREE.Group();
        let smoothMeshx, geometry, tube, mesh, points, points3d;
        var meshes = [];
        var topZ, bottomZ;

        var SAD = 1000;
        var numFractions = 0;
        var numBeams = 0;
        var beams = {}

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

            // renderElements()

        }



        function uploadDICOM(){
            vm.filesUploaded = true;
            var file_plan = document.getElementById('importFile').files[0];
            var file_struct = document.getElementById('importFile').files[1];
            loadDICOM(file_plan);
            loadDICOM(file_struct)

        }

        function loadDICOM(file){
            console.log("uploading...")
            var reader = new FileReader();
            reader.onload = function(file) {
    
                var arrayBuffer = reader.result;
                // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
                // Uint8Array so we create that here
                var byteArray = new Uint8Array(arrayBuffer);

                var rtData = dicomParser.parseDicom(byteArray); 
                var modality = rtData.string('x00080060')

                if (modality === 'RTPLAN'){

                SAD =  parseFloat(rtData.elements.x300a00b0.items[0].dataSet.string('x300a00b4'))
                SAD =  parseFloat(rtData.elements.x300a00b0.items[1].dataSet.string('x300a00b4'))
                numFractions = parseInt(rtData.elements.x300a0070.items[0].dataSet.string('x300a0078'))
                numBeams = parseInt(rtData.elements.x300a0070.items[0].dataSet.string('x300a0080'))

                var beamSequence = rtData.elements.x300a00b0.items;
                var beamNumber, gantryAngle, isocenter, controlPt, beamPositionSequence, jawType, X, Y
                beamSequence.forEach(function(beam){
                    beamNumber = beam.dataSet.string('x300a00c0')
                    controlPt = beam.dataSet.elements.x300a0111.items[0]

                    gantryAngle = parseInt(controlPt.dataSet.string('x300a011e'))
                    isocenter = controlPt.dataSet.string('x300a012c').split("\\").map(Number);

                    beamPositionSequence = controlPt.dataSet.elements.x300a011a.items

                    beamPositionSequence.forEach(function(beamPosition){
                        jawType = beamPosition.dataSet.string('x300a00b8')
        
                        if (jawType == 'X' || jawType == 'ASYMX'){
                            X = beamPosition.dataSet.string('x300a011c').split("\\").map(Number)
                        } else if (jawType == 'Y' || jawType == 'ASYMY'){
                            Y = beamPosition.dataSet.string('x300a011c').split("\\").map(Number)
                        }

                    })

                    beams[beamNumber] = {
                        isocenter: isocenter,
                        gantryAngle: gantryAngle,
                        X1: X[0],
                        X2: X[1],
                        Y1: Y[0],
                        Y2: Y[1]
                    }

                    // var patientSetup = rtData.elements.x300a0180.items;//[0].dataSet.string('x00185100')
                    // patientSetup.forEach(function(setup){
                    //     console.log(setup.dataSet.string('x00185100'))
                    // })
                    // console.log(patientPosition)
                    
                })
            } else if (modality === 'RTSTRUCT'){
                var ROINumber;
                var ROIName;

                var structureSetROISequence = rtData.elements.x30060020.items;
                
                // structureSetROISequence.forEach(function(sequence){
                for (var i = 0; i < structureSetROISequence.length; i++){
                    ROIName = structureSetROISequence[i].dataSet.string('x30060026')
                    if (ROIName.toLowerCase().includes("body") || ROIName.toLowerCase().includes("skin") ){
                        // console.log(ROIName)
                        ROINumber = parseInt(structureSetROISequence[i].dataSet.string('x30060022'))
                        // return false
                        break;
                    }

                }

                var ROIContourSequence = rtData.elements.x30060039.items;
                var refROINumber, contours;
                // ROIContourSequence.forEach(function(contourSequence){
                
                for (var i = 0; i < ROIContourSequence.length; i++){
                    refROINumber = parseInt(ROIContourSequence[i].dataSet.string('x30060084'))
                    if (refROINumber === ROINumber){
                        // console.log("ROINumber: ", ROINumber)

                        contours = ROIContourSequence[i].dataSet.elements.x30060040.items
                        break
                    }

                }


                var slice;
                var firstIteration = true;
                contours.forEach(function(contour){

                    slice = contour.dataSet.string('x30060050').split("\\").map(Number);
                    if (firstIteration){
                        renderSliceCap(slice)
                        topZ = slice[2]
                        firstIteration = false;
                    }
                    renderSlice(slice)
                    bottomZ = slice[2]

                })
                renderSliceCap(slice)


                renderElements()
            }

               

            

            }
            reader.readAsArrayBuffer(file);
            
        }
        // Not used yet
        function goToRTPlan(plan){
    

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});
            personalNavigator.pushPage('./views/personal/radiotherapy/radiotherapy-test.html', {plan});

            // personalNavigator.pushPage('./views/personal/radiotherapy/radiotherapy-plan.html', {plan});
            
            // init();
           


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

            // const axesHelper = new THREE.AxesHelper( 300 );
            // scene.add( axesHelper );
          
            // renderBody();
            // renderBeam(beams_manual[1])
            // renderBeam(beams_manual[2])

            // const loader = new THREE.ObjectLoader();
            // console.log(vm.RTPlan.struct)
            // console.log(JSON.parse(vm.RTPlan.struct))
            // console.log(loader.parse(vm.RTPlan.struct))
        
            ////////////////THIS PART WORKS
            
            // console.log(vm.RTPlan.struct)
           
        //    var slices = JSON.parse(vm.RTPlan.struct)
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
                // console.log(slices[key].length/2)
                renderSlicev2(key, JSON.parse(slices[key]), shape)
            })
            

            // allSlices(slices, keys)
            
           //////////////////////////////////////
            // var loader = new THREE.JSONLoader();
            // let loader = new THREE.LegacyJSONLoader();
            // var result = loader.parse(vm.RTPlan.struct)
            
          
//             console.log(slices)
//             var array = []
//              for (let i = 0; i < slices.length; i+=3){
//                         array.push(new THREE.Vector3(slice[i], slice2[i+1], slice2[i+2]))  
//                     }
//             // console.log(array)
//             var geo, mesh;
//                       var shape = new THREE.Shape();
//             shape.moveTo(0,0);
//             shape.lineTo(1.5,1)
//             shape.lineTo(1.5,-1)
//             shape.lineTo( -1.5,-1);
//             shape.lineTo(-1.5,1)
//             shape.lineTo( 0, 0 );

//             var sampleClosedSpline = new THREE.CatmullRomCurve3( array, true);
//             // var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4, true);
//  geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:100000})
//  mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
//  group.add(mesh)


            // console.log(JSON.parse(vm.RTPlan.struct))
            // var json = JSON.parse(vm.RTPlan.struct)
            // // console.log(geometry)
            // loader.parseGeometries(json, loader.parseShapes(json.shapes)
            //     , function(geom){
            //     console.log(geom)
            // })
            // var model = loader.parse( vm.RTPlan.struct );
            let colour = 0xA1AFBF
            // var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40}))
            
            // group.add(mesh)
            for (let i = 1; i <= vm.RTPlan.numBeams; i++){
                renderBeamv2(vm.RTPlan.beams[i].beamPoints)
            }


            console.log(group.position.z)
            console.log("HELLO")
            console.log(parseFloat(vm.RTPlan.firstSlice) - parseFloat(vm.RTPlan.lastSlice))
            group.position.z -= (parseFloat(vm.RTPlan.firstSlice) + parseFloat(vm.RTPlan.lastSlice))/2 - 100


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

            // var avg = (parseFloat(keys[0].replace('_','.') + parseFloat(keys[-1].replace('_','.'))))/2
            // console.log(avg)
            // if (avg < 0){
                // group.position.z -= (avg - 100)
            // }
            // group.position.z += 100
            // group.position.x = 0
            // group.position.y = 0

            //   var avg = (parseFloat(keys[0])+bottomZ)/2

            // var group1 = new THREE.Group(JSON.parse(vm.RTPlan.struct))
     
            scene.add(group)

          
//             console.log(new THREE.ObjectLoader().parseGeometries(vm.RTPlan.struct))
// // console.log(JSON.parse(vm.RTPlan.struct))
//              scene2 = new THREE.ObjectLoader().parse(vm.RTPlan.struct)

            // scene2.background = new THREE.Color(0xf1f1f1);
            // scene2.add(light)
            // scene2.add(group)


            vm.loading = false;
            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setPixelRatio(window.devicePixelRatio)
            renderer.setSize( window.innerWidth, window.innerHeight );
            document.getElementById("holder").appendChild( renderer.domElement );

            // const json = scene.toJSON();
            
            // const scene2 = new THREE.ObjectLoader().parse(json)

            // scene.position.z += 100

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

        function renderAllSlices(contourData){
            var slices = [];
            contourData.forEach(function(contour){
                slices.push.apply(slices, contour.dataSet.string('x30060050').split("\\").map(Number));
            })
            console.log(slices)

            let colour = 0xA1AFBF//0x657383//0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            var array = [];

            var shape, geo, mesh;


            shape = new THREE.Shape();
            shape.moveTo(0,0);
            shape.lineTo(1.5,0)
            shape.lineTo(1.5,1.5)
            shape.lineTo( -1.5, 1.5);
            shape.lineTo(-1.5,0)
            shape.lineTo( 0, 0 );

            // console.log(slice[2]);
            for (let i = 0; i < slices.length; i+=9){
                array.push(new THREE.Vector3(slices[i], slices[i+1], slices[i+2]))  
            }

            // console.log(array)
            
            var sampleClosedSpline = new THREE.CatmullRomCurve3( array, true);
                       // var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4, true);
            geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:100000})
            mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
            group.add(mesh)
            
        }

        function renderSlicev2(z, slice, shape){
           
            z = parseFloat(z.replace('_','.'))
            slice = slice.map(Number)
   
            
            
            let colour = 0xA1AFBF//0x657383//0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            var array = [];

            var  geo, mesh;


            // console.log(slice[2]);
            // var zz = slice[2]
            
            for (let i = 0; i < slice.length; i+=2){
                array.push(new THREE.Vector3(slice[i], slice[i+1], z))  
            }
          
            
            var sampleClosedSpline = new THREE.CatmullRomCurve3(array, true)

            // const points = sampleClosedSpline.getPoints( 50 );
            // console.log(points)
            // const geometry = new THREE.BufferGeometry().setFromPoints( points );

            // var sampleClosedSpline2 = new THREE.CatmullRomCurve3(points, true)

            // // var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2,4, true);
            geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})

           
            var mesh2 = new THREE.PointsMaterial({color:colour})
            const pts = new THREE.Points(geometry, mesh2)

            mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
            // mesh.position.z = slice[2]
            // group.add(pts)
            // group.add(mesh)
            // console.log(sampleClosedSpline)
            // var gr = new THREE.Group()
            // gr.add(mesh)
            // var json = JSON.stringify(points);
            // // console.log(json)
            // var response = JSON.parse(json)
            // // console.log(response)
            // var sampleClosedSpline3 = new THREE.CatmullRomCurve3(response, true)
            // console.log(sampleClosedSpline3)

            // geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline3,steps:500})

           
            // var mesh2 = new THREE.PointsMaterial({color:colour})
            // const pts = new THREE.Points(geometry, mesh2)

            // mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40}))
            // geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})
            group.add(mesh)
            // const loader = new THREE.ObjectLoader()
            // var newgeo = loader.parse(json)
            // console.log(newgeo)

    }
        function renderSlice(slice){
            
            let colour = 0xA1AFBF//0x657383//0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            var array = [];

            var shape, geo, mesh;


            shape = new THREE.Shape();
            shape.moveTo(0,0);
            shape.lineTo(1.5,0)
            shape.lineTo(1.5,2)
            shape.lineTo( -1.5, 2);
            shape.lineTo(-1.5,0)
            shape.lineTo( 0, 0 );

            // console.log(slice[2]);
            for (let i = 0; i < slice.length; i+=3){
                array.push(new THREE.Vector3(slice[i], slice[i+1], slice[i+2]))  
            }
            
            var sampleClosedSpline = new THREE.CatmullRomCurve3( array, true);
            // var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4, true);
            geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:1000})
            mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:40})) //LineBasicMaterial())//
            group.add(mesh)
    }


        function renderBody(){
            
            let colour = 0xBEBBD5//0x29293d//3104B4//0B4C5F//// 0x//0xa29093 //0x669999
            geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(body);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const positionAttribute = geometry.getAttribute( 'position' );
            points3d = []
            var hole = []
            var total = []

            // for ( let i = 0; i < positionAttribute.count; i += 3 ) {
            //     const vertex = new THREE.Vector3();
            //     vertex.fromBufferAttribute( positionAttribute, i );
            //     points3d.push( vertex );
            //     total.push(vertex)
            //     hole.push(new THREE.Vector3(vertex.x*.9, vertex.y*.9, vertex.z))
            //     total.push(new THREE.Vector3(vertex.x*.9, vertex.y*.9, vertex.z))
          
            // }


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

            for (let i = 0; i < body.length; i+=21){
                newZ = body[i+2]
                if (newZ != currZ){ 

                    var sampleClosedSpline = new THREE.CatmullRomCurve3( array, true);
                    var tube = new THREE.TubeBufferGeometry( sampleClosedSpline, 64, 2, 4, true);
                    geo = new THREE.ExtrudeBufferGeometry(shape, {extrudePath:sampleClosedSpline,steps:500})
                    mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:30})) //LineBasicMaterial())//
                    currZ = newZ;
                    group.add(mesh)
                    
                    array = [];
                }

               array.push(new THREE.Vector3(body[i], body[i+1], body[i+2]))
            }
    }


        function renderBeam(beam){
            let xi = beam.isocenter[0]//.x;
            let yi = beam.isocenter[1]//.y;
            let zi = beam.isocenter[2]//.z;

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
            const material2 = new THREE.MeshBasicMaterial( {color:0xff0000} );
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
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000} );//0xff0000, linewidth: 4 } );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines)

            lineGeometry.computeVertexNormals();

            const meshGeometry3 = new ConvexGeometry( points );
            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});//0xff0000} );0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            smoothMeshx = new THREE.Mesh( meshGeometry3, smoothMaterialx)
            // group.add(smoothMeshx)
          
            group.add(smoothMeshx)
       
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
            // let z = parseFloat(z.replace('_','.'))
            // let slice = slice.map(Number)

            console.log(slices)
            for (let i=0; i<keys.length; i++){
                let z = parseFloat(keys[i].replace('_','.'))
                // console.log(key)
                // console.log(slices[key])
                
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
                    // console.log("j", j)
                    // console.log("curr", curr)
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
            // for (let i=0; i<slice1.length && i<slice2.length; i++){
            //     slice
            // }


        }    
    }

})();
