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

            
            const axesHelper = new THREE.AxesHelper( 100 );
            scene.add( axesHelper );
            console.log(axesHelper)
            const light = new THREE.PointLight(0xffffff, 1);
            light.position.set(0,0,2000);
            scene.add(light);

            const light2 = new THREE.PointLight(0xffffff, 1);
            light2.position.set(0,0,-2000);
            scene.add(light2);

            const light3 = new THREE.PointLight(0xffffff, 1);
            light3.position.set(0,-2000,100);
            scene.add(light3);

            const light4 = new THREE.PointLight(0xffffff, 1);
            light4.position.set(0,2000,100);
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


            // keys.forEach(function(key){
            //     renderSlicev2(key, JSON.parse(slices[key]), shape)
            // })
            
            allSlices(slices, keys)

            let colour = 0xA1AFBF

            for (let i = 1; i <= vm.RTPlan.numBeams; i++){
                // renderBeamv2(vm.RTPlan.beams[i].beamPoints)
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
            var normals = []
            var colour = 0xA1AFBF

            console.log(slices)
            console.log(keys.length)
            // let newKeys = {}
            // for(var i=0; i < keys.length; i++) {
            //     newKeys[keys[i]] = parseFloat(keys[i].replace('_','.'));
            //     console.log(newkeys[i])
            //    }
            // keys = keys.map(Number)
            keys.sort(function(a, b){return parseFloat(a.replace('_','.'))-parseFloat(b.replace('_','.'))})

            console.log(keys)
            for (let i=0; i<keys.length; i++){
                console.log(i)
                // console.log("Key:", keys[i])
                let z = parseFloat(keys[i].replace('_','.'))
                // let z = keys[i]
                let slice2 = []
                let slice = JSON.parse(slices[keys[i]]).map(Number)
                if (i < keys.length -1){
                    slice2 = JSON.parse(slices[keys[i+1]]).map(Number)
                }
                console.log("LENGTH:",slice.length/2)
                // console.log(slice.length)
                let index = 0;
                for (let j=0; j<slice.length; j+=2){
                   
                    // console.log("J:",j,slice.length)
                    pts.push(slice[j], slice[j+1], z)
                    // pts.push(new THREE.Vector3(slice[j], slice[j+1], z))
                    
                    if (z>=0) normals.push( 0, 0, 1 );
                    else normals.push(0,0,-1)
                    
                    if (j==0){
                        index = closestIndex(slice[j], slice[j+1], slice2)
                       console.log("ind", index)
                    }

                    // if (i == 0){
                    //     for (let k = 0; k < slice.length; k+=2){
                    //         indices.push(k)
                    //     }
                    //     indices.push(0)
                        

                    // }

                    // if (i == keys.length-1){
                    //     for (let k = 0; k < slice.length; k+=2){
                    //         indices.push(curr + k)
                    //     }
                    //     indices.push(curr)
                        

                    // }

                    if (j != slice.length-2 && i != keys.length-1){

                    let maxdist =0// Math.max(distance(slice[j], slice[j+1], slice[j+2], slice[j+3]),distance(slice[j], slice[j+1], slice2[(j+index)%slice2.length], slice2[(j+index)%slice2.length+1]), distance(slice2[(j+index)%slice2.length], slice2[(j+index+1)%slice2.length],slice2[(j+index+2)%slice2.length],slice2[(j+index+3)%slice2.length]) )
                    
                    if ( maxdist < 70){
                        // console.log(curr)
                        let a = curr;
                    let b = curr -j/2 + slice.length/2 + ((index/2)+j/2) % (slice2.length/2)
                    let c = curr+1; 
                    let d = curr -j/2+ slice.length/2 + ((index/2)+j/2 +1) % (slice2.length/2) 
                    
                    if(true){
                        console.log("ind/2", index/2)
                        // console.log(a,b, "ind:",index/2, "j",j/2,"len",slice.length/2, ((index/2)+j/2) % (slice2.length/2) );
                        console.log(c,a,d)
                        console.log(a,b,d)
                    }
                    if (Math.abs(c-d) > 105) console.log("OVER FIFTY", c,a,d,"J",j)
                        if (a<0) console.log("NEG A", a, j)
                        if (b<0) console.log("NEG B", b, j)
                        if (c<0) console.log("NEG C", c, j)
                        indices.push(c,a,d)
                        indices.push(a,b,d)
                    }
                    }
                    // console.log(j)
                    if (j == slice.length-2 && slice2.length <= slice.length){
                        console.log(j/2)
                        console.log("ind:",index/2)
                        if (true){//(distance(slice[j], slice[j+1], slice[0], slice[1]) < 70 && distance(slice[j], slice[j+1], slice2[0], slice2[1]) < 70){
                            let a = curr;
                            let b = curr  + (((index/2)+ slice2.length/2) )% (slice2.length/2)
                            if (index==0) b += slice2.length/2
                           //+ ((index/2) + j) //% (slice2.length/2)
                        //    console.log("currr", curr)
                        //    console.log("j/2",j/2,"slice/2",slice.length/2)
                            let c = curr-j/2; 
                            let d = curr+1+((index/2)) % (slice2.length/2)
                            // console.log(curr)
                            // console.log(j)
                            // let d = curr - j + slice.length/2 + ((index/2) + j) +1//% (slice2.length/2) + 1
                            console.log("last")
                            // if (a<0) console.log("NEG A", a, j)
                            // if (b<0) console.log("NEG B", b, j)
                            // if (c<0) console.log("NEG C", c, j)
                            console.log(c,a,d)
                            console.log(a,b,d)

                            // console.log(a,b, "ind:",index/2, "j",j/2,"len",slice2.length/2, ((index/2)+j/2) % (slice2.length/2) );
                            // console.log(c,a,d)
                            // console.log(a,b,d)
                            indices.push(c,a,d)
                            indices.push(a,b,d)
                        }
    
                    }

                    
                console.log("curr:",curr,"j:",j,"slice:",slice[j], slice[j+1], z)

                    curr ++;
                   
                }

                if (slice.length < slice2.length){
                    let newCurr = curr+(slice.length/2-1+index/2)%(slice2.length/2); ';/['
                    console.log("cur",curr,"newcurr",newCurr)
                    console.log("slice:",slice.length,"slice2:",slice2.length)
                    console.log("slice2[newCurr-curr], slice2[newCurr-curr+1]",slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2], slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2+1])
                    index = closestIndex(slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2], slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2+1], slice)
                    console.log("indeeeex",index)     
                    console.log(indices)    
                    for (let j = slice.length; j < slice2.length; j+=2){
                                      

                        let maxdist =0// Math.max(distance(slice[j], slice[j+1], slice[j+2], slice[j+3]),distance(slice[j], slice[j+1], slice2[(j+index)%slice2.length], slice2[(j+index)%slice2.length+1]), distance(slice2[(j+index)%slice2.length], slice2[(j+index+1)%slice2.length],slice2[(j+index+2)%slice2.length],slice2[(j+index+3)%slice2.length]) )
                    
                        if ( maxdist < 70){
                            // console.log(curr)
                            let a = curr-slice.length/2+(index/2 + (j)/2)%(slice.length/2) //curr+j;
                            let b = newCurr// + j/2 //curr -j/2 + slice2.length/2 + ((index/2)+j/2) % (slice.length/2)
                            let c = curr-slice.length/2+(index/2 + (j)/2 + 1)%(slice.length/2)//curr+j+1; 
                            let d = newCurr + 1//j/2 + 1//curr -j/2+ slice2.length/2 + ((index/2)+j/2 +1) % (slice.length/2) 

                            indices.push(c,a,d)
                            indices.push(a,b,d)
                            console.log("newcurr",newCurr)
                            console.log(c,a,d)
                            console.log(a,b,d)
                        }
                        newCurr ++

                    }


                            let a = curr-slice.length/2+(index/2 + ( slice2.length-slice.length)/2)%(slice.length/2) //slice.length/2+(index/2 + (j-slice.length)/2)%(slice.length/2)//curr-slice.length/2+(index/2 + (j-slice.length)/2)%(slice.length/2) //newCurr;
                            let b = newCurr//  + (((index/2)+ slice.length/2) )//% (slice2.length/2))
                           //+ ((index/2) + j) //% (slice2.length/2)
                        //    console.log("currr", curr)
                        //    console.log("j/2",j/2,"slice/2",slice.length/2)
                            let c = curr-slice.length/2+(index/2 + ( slice2.length-slice.length)/2 + 1)%(slice.length/2); 
                            let d = curr+ (newCurr+1-curr)%(slice2.length/2)//newCurr - slice2.length/2 //+((index/2) +1) //% (slice2.length/2))
              
                            console.log("last")
             
                            console.log(c,a,d)
                            console.log(a,b,d)
                            indices.push(c,a,d)
                            indices.push(a,b,d)
                }

                
                console.log("CURR",curr)
                
            }
            // console.log(pts)
            console.log(indices)
            var geo = new THREE.BufferGeometry()//.setFromPoints(pts)
            var geopts = new THREE.BufferGeometry()//.setFromPoints(pts)
            console.log(geo)
            geo.setIndex(indices)
            // geo.setIndex(new THREE.BufferAttribute(indices, 1))
            // geo.setAttribute('position', pts)
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( pts, 3 ) );
            geopts.setAttribute('position', new THREE.Float32BufferAttribute(pts,3))
            // geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
            var mesh2 = new THREE.Points(geopts, new THREE.PointsMaterial({color:0xff0000}))
            scene.add(mesh2)
            group.add(mesh2)
            geo.computeBoundingSphere()
            // geo.computeFaceNormals();                                                        
            geo.computeVertexNormals();
            // console.log(pts)
            colour = 0x6A5ACD
            var mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({color:colour, side:THREE.DoubleSide, shininess:40}))//,wireframe:true}))
            group.add(mesh)
            // console.log(indices)
            group.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );



        }    

        function distance(x1, y1, x2, y2){
            return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2))

        }

        function closestIndex(x, y, array){
            let dist = distance(x, y, array[0], array[1]);
            let index = 0;
            for (let j=2; j<array.length; j+=2){
                let newdist = distance(x,y, array[j], array[j+1])
                if ( newdist < dist){
                    dist = newdist
                    index = j
                }
            }
            return index;

        }
    }

})();
