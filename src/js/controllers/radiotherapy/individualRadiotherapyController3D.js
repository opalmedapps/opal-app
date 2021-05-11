/*
 * Filename     :   individualRadiotherapyController3D.js
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


            camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 10 , 600 );
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
            // document.getElementById("holder").appendChild( renderer.domElement );


            const controls = new OrbitControls( camera, renderer.domElement );

            var animate = function () {
                requestAnimationFrame( animate );
              
                renderer.render( scene, camera );
              };
              
              animate();
        }


        


        

        function renderBeamv2(beamPoints){
            let points = [];
            let beamSource = new THREE.Vector3(parseFloat(beamPoints.beamSource[0]),parseFloat(beamPoints.beamSource[1]),parseFloat(beamPoints.beamSource[2]))
            beamPoints.field.forEach(function(pt){
                points.push(new THREE.Vector3(parseFloat(pt[0]), parseFloat(pt[1]), parseFloat(pt[2])))
            })
            points.push(beamSource)



            var indices = [];
            indices.push(2,1,4)
            indices.push(3,2,4)
            indices.push(0,3,4)
            indices.push(1,0,4)
            indices.push(2,1,3)
            indices.push(1,0,3)
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0xff0000} );//0xff0000, linewidth: 4 } );
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            lineGeometry.setIndex(indices)
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines)

            lineGeometry.computeVertexNormals();


            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.1});//0xff0000} );0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            smoothMeshx = new THREE.Mesh( lineGeometry, smoothMaterialx)
            console.log("adding mesh")
            
            group.add(smoothMeshx)
       
        }

        function allSlices(slices, keys){
            var pts = []
            var indices = []
            var curr = 0;
            var normals = []
            var colour = 0x999289//0x9189CA//0xA1AFBF

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
                let slice = []

                // console.log(JSON.parse(slices[keys[i]])[0])
                if(JSON.parse(slices[keys[i]]).length > 1) {

                    console.log(JSON.parse(slices[keys[i]])[0])
                    slice = JSON.parse(slices[keys[i]])[0]//.map(Number)
                }
                else slice = JSON.parse(slices[keys[i]])[0]//.map(Number)
                if (i < keys.length -1){
                    if(JSON.parse(slices[keys[i+1]]).length > 1) slice2 = JSON.parse(slices[keys[i+1]])[0]//.map(Number)
                    else slice2 = JSON.parse(slices[keys[i+1]])[0]//.map(Number)
                    // slice2 = JSON.parse(slices[keys[i+1]])[0].map(Number)
                }

                

                console.log("conts per z:",JSON.parse(slices[keys[i]]).length)
                console.log("LENGTH:",slice.length/2)
                // console.log(slice.length)
                let index = 0;
                for (let j=0; j<slice.length; j+=2){
                   
                    // console.log("J:",j,slice.length)
                    pts.push(slice[j], slice[j+1], z)
                    // pts.push(new THREE.Vector3(slice[j], slice[j+1], z))
                    
                    
                    if (j==0){
                        index = closestIndex(slice[j], slice[j+1], slice2)
                       console.log("ind", index)
                    }

                   

                    if (j != slice.length-2 && i != keys.length-1){
                    let distAB = distance(slice[j], slice[j+1], slice2[(j+index) % slice2.length], slice2[1+(j+index) % slice2.length] );
                    let distAC = distance(slice[j], slice[j+1], slice[j+2], slice[j+3]);;
                    let distAD = distance(slice[j], slice[j+1],slice2[(2+j+index) % slice2.length], slice2[1+(2+j+index) % slice2.length])//distance(slice2[(2+j+index) % slice2.length], slice2[1+(2+j+index) % slice2.length], slice2[(j+index) % slice2.length], slice2[1+(j+index) % slice2.length]);;
                    // console.log("dists",distAB,distAC,distAD) 
                    let maxdist = Math.max(distAB,distAC,distAD)// Math.max(distance(slice[j], slice[j+1], slice[j+2], slice[j+3]),distance(slice[j], slice[j+1], slice2[(j+index)%slice2.length], slice2[(j+index)%slice2.length+1]), distance(slice2[(j+index)%slice2.length], slice2[(j+index+1)%slice2.length],slice2[(j+index+2)%slice2.length],slice2[(j+index+3)%slice2.length]) )
                    // if (maxdist >100){
                    //     index = closestIndex(slice[j], slice[j+1], slice2)
                    // }
                    // if (maxdist>50 ){
                    //     console.log("HELLO")
                    //     console.log("currindex",index)  
                    //     index = (closestIndex(slice[j], slice[j+1], slice2) - j +slice2.length)  %slice2.length
                    //     console.log("newindex",index)
                    //     console.log(j)
                    //     console.log("lengths",slice.length,slice2.length)
                    // }
      
                        let a = curr;
                    let b = curr -j/2 + slice.length/2 + ((index/2)+j/2) % (slice2.length/2)
                    let c = curr+1; 
                    let d = curr -j/2+ slice.length/2 + ((index/2)+j/2 +1) % (slice2.length/2) 
                    
            
                    if (Math.abs(c-d) > 105) console.log("OVER FIFTY", c,a,d,"J",j)
                        if (a<0) console.log("NEG A", a, j)
                        if (b<0) console.log("NEG B", b, j)
                        if (c<0) console.log("NEG C", c, j)
                        indices.push(c,a,d)
                        indices.push(a,b,d)
                    }
                    // console.log(j)
                    if (j == slice.length-2 && i!=keys.length-1&& slice2.length <= slice.length){
                            let a = curr;
                            let b = curr  + (((index/2)+ slice2.length/2) )% (slice2.length/2)
                            if (index==0) b += slice2.length/2
                            let c = curr-j/2; 
                            let d = curr+1+((index/2)) % (slice2.length/2)
                            console.log("last")

                            indices.push(c,a,d)
                            indices.push(a,b,d)

                            console.log(c,a,d)
                            console.log(a,b,d)
                    }

                    // Cap top and bottom
                    if ((i == keys.length-1 || i==0) && j==0){

                        for (let k = 1; k < slice.length/4; k++){
                            let a = curr + k - 1;
                            let b = curr + (slice.length/2-k)
                            let c = curr + k;
                            let d = curr + (slice.length/2 - k - 1)
                            indices.push(c,a,d)
                            indices.push(a,b,d)
                        }
                    }

                    

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
            
            //group.add(mesh2)
            geo.computeBoundingSphere()
            // geo.computeFaceNormals();                                                        
            geo.computeVertexNormals();
            // console.log(pts)
            colour =0x767676//0x655A4E// 0x967969//0x5E51B1//0x6A5ACD
            var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:colour, side:THREE.DoubleSide, shininess:20}))//,wireframe:true}))
            group.add(mesh)
            // console.log(indices)
            // group.add( new THREE.AmbientLight( 0xffffff, 0.1 ) );



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
