/*
 * Filename     :   radiotherapyService.js
 * Description  :   Service that store and manages the radiotherapy information.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
(function()
{
    angular
    .module('MUHCApp')
    .service('Radiotherapy', RadiotherapyService);

    RadiotherapyService.$inject = ['RequestToServer','$filter','$q'];

    function RadiotherapyService(RequestToServer, $filter, $q) {
              
        var dicomList = [];
        var dicomContent = [];

        let scene = new THREE.Scene()
        let group = new THREE.Group();
        let meshes = [];
        var vm = this;
        vm.RTPlan;


        let service = {
            clearScene: clearScene,
            getDicomContent: getDicomContent,
            getScene: getScene,
            requestRTDicoms: requestRTDicoms,
            requestRTDicomContent: requestRTDicomContent
        };
        return service;


        function getScene(){
            return scene;
        }
        function requestRTDicoms(){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('Dicom')
                .then(function (response) {
                    console.log(response)
                    dicomList = response.Data;
                    q.resolve(dicomList);             
                    
                    if(typeof dicomList =='undefined') return ;

                    dicomList.forEach(function(dicom){
                        dicom.DateAdded = $filter('formatDate')(dicom.DateAdded)
                    })
                }).catch(function (error){
                    console.log('Error in getRTDicoms: ', error);
                    q.resolve([]);
                });

            return q.promise

        }

        function requestRTDicomContent(DicomSerNum){

            clearScene()
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('DicomContent', [DicomSerNum])
            .then(function(response){
                dicomContent = response.Data
                vm.RTPlan = response.Data
                renderElements();
                q.resolve(dicomContent)
            })
            
            return q.promise
        }

        function getDicomContent(){
            return dicomContent;
        }

        function clearScene(){
            meshes = []
            group.position.x = 0;
            group.rotation.y = 0;
            while(scene.children.length > 0){ 
                scene.remove(scene.children[0]); 
            }
            while(group.children.length > 0){
                group.remove(group.children[0])
            }
            scene = new THREE.Scene()
            group = new THREE.Group()

        }

        function renderElements(){

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf1f1f1);

            const light = new THREE.PointLight(0xffffff, 1);
            light.position.set(2000,0,0);
            scene.add(light);

            const light2 = new THREE.PointLight(0xffffff, 1);
            light2.position.set(-2000,0,0);
            scene.add(light2);

            const light3 = new THREE.PointLight(0xffffff, 1);
            light3.position.set(0,-2000,100);
            scene.add(light3);

            const light4 = new THREE.PointLight(0xffffff, 1);
            light4.position.set(0,2000,100);
            scene.add(light4);

            var slices = vm.RTPlan.struct
            const keys = Object.keys(slices);
            

            for (let i = 1; i <= vm.RTPlan.numBeams; i++){
                renderBeamv2(vm.RTPlan.beams[i].beamPoints)
            }

            allSlices(slices, keys)

            group.rotation.y = Math.PI / 2;

            group.position.x -= (parseFloat(vm.RTPlan.firstSlice) + parseFloat(vm.RTPlan.lastSlice))/2 - 130
            scene.add(group)


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
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0x008000} );//0xff0000, linewidth: 4 } );
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            lineGeometry.setIndex(indices)
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines)

            lineGeometry.computeVertexNormals();


            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0x90EE90, side: THREE.DoubleSide, transparent: true, opacity: 0.07});//0xff0000} );0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            let smoothMeshx = new THREE.Mesh( lineGeometry, smoothMaterialx)
            
            group.add(smoothMeshx)

            meshes.push(new ConvexHull().setFromObject(smoothMeshx))
       
        }

        function allSlices(slices, keys){
            var pts = []
            var indices = []
            var curr = 0;
            var colour = 0x999289//0x9189CA//0xA1AFBF
            var colours = []

            keys.sort(function(a, b){return parseFloat(a.replace('_','.'))-parseFloat(b.replace('_','.'))})

      
            for (let i=0; i<keys.length; i++){
                let z = parseFloat(keys[i].replace('_','.'))
                let slice2 = []
                let slice = []

      
                if(JSON.parse(slices[keys[i]]).length > 1) {
                    slice = JSON.parse(slices[keys[i]])[0]
                }
                else slice = JSON.parse(slices[keys[i]])[0]

                if (i < keys.length -1){
                    if(JSON.parse(slices[keys[i+1]]).length > 1) slice2 = JSON.parse(slices[keys[i+1]])[0]
                    else slice2 = JSON.parse(slices[keys[i+1]])[0]
                }

                


                let index = 0;
                for (let j=0; j<slice.length; j+=2){
                    pts.push(slice[j], slice[j+1], z)

                    if (j==0){
                        index = closestIndex(slice[j], slice[j+1], slice2)
                    }

                   let point = new THREE.Vector3(slice[j], slice[j+1], z)
                   let isInside = false 
   
                   for (let i=0; i<meshes.length; i++){
                        if (meshes[i].containsPoint(point)){
                            isInside = true
                            break;
                        }
                    }
                    if (isInside){
                        colours.push(153,153,255)
                    } else {
                        colours.push(127,127,127)
                    }

                //    const raycaster = new THREE.Raycaster()
                //    raycaster.set(point, new THREE.Vector3(1,1,1))
                //    const intersects = raycaster.intersectObjects(meshes)
                //    console.log("mesh",meshes)
                //    if (intersects.length%2 ===1){
                //        console.log(intersects)
                //     colours.push(153,153,255)
                //    } else {
                //     colours.push(127,127,127)
                //    }

                    if (j != slice.length-2 && i != keys.length-1){
                        let a = curr;
                        let b = curr -j/2 + slice.length/2 + ((index/2)+j/2) % (slice2.length/2)
                        let c = curr+1; 
                        let d = curr -j/2+ slice.length/2 + ((index/2)+j/2 +1) % (slice2.length/2) 
                    
                        indices.push(c,a,d)
                        indices.push(a,b,d)        
                    }
               
                    if (j == slice.length-2 && i!=keys.length-1 && slice2.length <= slice.length){
                            let a = curr;
                            let b = curr  + (((index/2)+ slice2.length/2) )% (slice2.length/2)
                            if (index==0) b += slice2.length/2
                            let c = curr-j/2; 
                            let d = curr+1+((index/2)) % (slice2.length/2)


                            indices.push(c,a,d)
                            indices.push(a,b,d)
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
                 
                    index = closestIndex(slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2], slice2[(slice.length/2-1+index/2)%(slice2.length/2)*2+1], slice)
  
                    for (let j = slice.length; j < slice2.length; j+=2){
                                      

                            let a = curr-slice.length/2+(index/2 + (j)/2)%(slice.length/2) 
                            let b = newCurr
                            let c = curr-slice.length/2+(index/2 + (j)/2 + 1)%(slice.length/2)
                            let d = newCurr + 1

                            indices.push(c,a,d)
                            indices.push(a,b,d)

                        newCurr ++

                    }


                            let a = curr-slice.length/2+(index/2 + ( slice2.length-slice.length)/2)%(slice.length/2) //slice.length/2+(index/2 + (j-slice.length)/2)%(slice.length/2)//curr-slice.length/2+(index/2 + (j-slice.length)/2)%(slice.length/2) //newCurr;
                            let b = newCurr
                            let c = curr-slice.length/2+(index/2 + ( slice2.length-slice.length)/2 + 1)%(slice.length/2); 
                            let d = curr+ (newCurr+1-curr)%(slice2.length/2)

                            indices.push(c,a,d)
                            indices.push(a,b,d)
                }

                
            }

            var geo = new THREE.BufferGeometry()
            // var geopts = new THREE.BufferGeometry()
  
            geo.setIndex(indices)
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( pts, 3 ) );
            // geopts.setAttribute('position', new THREE.Float32BufferAttribute(pts,3))

            geo.computeBoundingSphere()
                                                     
            geo.computeVertexNormals();
            colours = new Uint8Array(colours)
            geo.setAttribute('color',  new THREE.BufferAttribute(colours,3,true))
            geo.attributes.color.normalized = true     
       
            colour =0x767676//0x655A4E// 0x967969//0x5E51B1//0x6A5ACD
            var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({vertexColors:THREE.VertexColors, side:THREE.DoubleSide, shininess:0}))//,wireframe:true}))
            group.add(mesh)
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

