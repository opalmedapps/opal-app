/*
 * Filename     :   radiotherapyService.js
 * Description  :   Service that store and manages the radiotherapy information.
 *                  Currently, the Radiotherapy service handles both radiotherapy and imaging.
 * Created by   :   Kayla O'Sullivan-Steben
 * Date         :   March 2021
 */
import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
(function()
{
    angular
    .module('OpalApp')
    .service('Radiotherapy', RadiotherapyService);

    RadiotherapyService.$inject = ['RequestToServer','$filter','$q'];

    function RadiotherapyService(RequestToServer, $filter, $q) {
              
        var dicomList = [];
        var dicomContent = [];
        var imageContent;

        // Variables for 3D render
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
            requestImgDicomContent:requestImgDicomContent,
            requestRTDicomContent: requestRTDicomContent
        };
        return service;

        // Returns the 3D scene
        function getScene(){
            return scene;
        }

        // Requests the list of dicoms
        function requestRTDicoms(dicomType){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('Dicom', [dicomType])
                .then(function (response) {
                    dicomList = response.Data;
                    q.resolve(dicomList);             
                    
                    if(typeof dicomList =='undefined') return ;

                    // Format date
                    dicomList.forEach(function(dicom){
                        dicom.DateAdded = $filter('formatDate')(dicom.DateAdded)
                    })
                }).catch(function (error){
                    console.log('Error in getRTDicoms: ', error);
                    q.resolve([]);
                });

            return q.promise
        }

        // Get contents of specific dicom entry
        function requestRTDicomContent(DicomSerNum){

            clearScene()
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('DicomContent', [DicomSerNum])
            .then(function(response){
                dicomContent = response.Data
                vm.RTPlan = response.Data
                renderElements(); // render 3D scene
                q.resolve(dicomContent)
            })
            
            return q.promise
        }

        // TODO: combine with above function, can add extra parameter indicating type and if statement
        function requestImgDicomContent(DicomSerNum){
            var q = $q.defer();
            RequestToServer.sendRequestWithResponse('DicomContent', [DicomSerNum])
            .then(function(response){
                imageContent = response.Data

                q.resolve(imageContent)
            })
            
            return q.promise
        }

        function getDicomContent(){
            return dicomContent;
        }

        // Removes all children from the scene
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

        // Renders the 3D elements (beams & body)
        function renderElements(){

            // Create scene and set background colour
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xf1f1f1);

            // Add lights to scene
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

            
            // Render beams
            for (let i = 1; i <= vm.RTPlan.numBeams; i++){
                renderBeam(vm.RTPlan.beams[i].beamPoints)
            }

            // Render body from slices
            var slices = vm.RTPlan.struct
            const keys = Object.keys(slices);
            
            renderBody(slices, keys)

            // Rotate and reposition beams and body to be centered 
            group.rotation.y = Math.PI / 2;
            group.position.x -= (parseFloat(vm.RTPlan.firstSlice) + parseFloat(vm.RTPlan.lastSlice))/2 - 130
            scene.add(group)

        }

     
        // Renders a 3D beam from the 5 beam outline points calculated in listener
        function renderBeam(beamPoints){

            // Create THREE JS vectors for each point (beam source and four corners at isocentre)
            let points = [];
            let beamSource = new THREE.Vector3(parseFloat(beamPoints.beamSource[0]),parseFloat(beamPoints.beamSource[1]),parseFloat(beamPoints.beamSource[2]))
            beamPoints.field.forEach(function(pt){
                points.push(new THREE.Vector3(parseFloat(pt[0]), parseFloat(pt[1]), parseFloat(pt[2])))
            })
            points.push(beamSource);

            // Create triangle faces such that a square pyramid shape is formed between teh points
            var indices = [];
            indices.push(2,1,4);
            indices.push(3,2,4);
            indices.push(0,3,4);
            indices.push(1,0,4);
            indices.push(2,1,3);
            indices.push(1,0,3);

            // Create line material connecting the points
            const lineMaterial = new THREE.LineBasicMaterial( { color: 0x008000} );
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
            lineGeometry.setIndex(indices);
            const lines = new THREE.Line( lineGeometry, lineMaterial );
            group.add(lines);

            // Create solid transparent material (fills between the lines)
            lineGeometry.computeVertexNormals();
            const smoothMaterialx = new THREE.MeshMatcapMaterial({color: 0x90EE90, side: THREE.DoubleSide, transparent: true, opacity: 0.07});
            let smoothMeshx = new THREE.Mesh( lineGeometry, smoothMaterialx);
            group.add(smoothMeshx);

            // Create convex shape from beam (used later to determine which points are within the beam and colour them)
            meshes.push(new ConvexHull().setFromObject(smoothMeshx));
       
        }

        // Render 3D body
        function renderBody(slices, keys){
            var pts = []; // The 3D points making up the entire body
            var indices = []; // The indices of those points ordered in such a way that it forms a triangular mesh
            var curr = 0; // The index of the current point (in the overal pts array, not of the current slice)
            var colours = []; // The array of colours assigned to each point

            // Sort slice height (z) to be floats and in order
            keys.sort(function(a, b){return parseFloat(a.replace('_','.'))-parseFloat(b.replace('_','.'))})

      
            // Loop through each slice to form triangle faces between current and subsequent slice
            // For details, refer to Kayla O'Sullivan-Steben's thesis
            for (let i=0; i<keys.length; i++){
                let z = parseFloat(keys[i].replace('_','.')); // the z value (height) of the slice
                let slice = []; // stores the x and y values of each point in the slice (they all have the same z value)
                let slice2 = [];

                // Parse the slice data
                slice = JSON.parse(slices[keys[i]])[0];

                // Do not do for last slice since it will have already been connected to the previous slice
                if (i < keys.length -1){
                    slice2 = JSON.parse(slices[keys[i+1]])[0];
                }

                
                // Loop through the points in the current slice 
                // 'index' variable keeps track of the starting index of slice 2
                // 'j' tracks the iteration on the current slice array (note that the array is [x1,y1,x2,y2...] so j increases by 2)
                let index = 0;
                for (let j=0; j<slice.length; j+=2){
                    pts.push(slice[j], slice[j+1], z);

                    // If first iteration, find starting point on second slice (this ensure both slices align)
                    if (j==0){
                        index = closestIndex(slice[j], slice[j+1], slice2);
                    }


                    // Check if point is inside one of the beams (stored in meshes array) and sets colour accordingly
                    // Note: uses the containsPoint() function in the THREE.JS ConvexHull class
                    let point = new THREE.Vector3(slice[j], slice[j+1], z);
                    let isInside = false;
    
                    for (let i=0; i<meshes.length; i++){
                        if (meshes[i].containsPoint(point)){
                            isInside = true;
                            break;
                        }
                    }
                    if (isInside){
                        colours.push(153,153,255); // blue
                    } else {
                        colours.push(127,127,127); // grey
                    }


                    // Algorithm to create two triangular faces (between points [c,a,d] and [a,b,d] per point (see thesis)
                    // Ignores last slice and last point on each slice, since the last point uses a different agorithm
                    if (j != slice.length-2 && i != keys.length-1){
                        let a = curr;
                        let b = curr - j/2 + slice.length/2 + ((index/2)+j/2) % (slice2.length/2);
                        let c = curr + 1; 
                        let d = curr - j/2+ slice.length/2 + ((index/2)+j/2 +1) % (slice2.length/2);
                    
                        indices.push(c,a,d);
                        indices.push(a,b,d);        
                    }
               
                    // For the final point in the slice, algorithm is such that it links back to first points of each slice
                        // Note that the initial version allowed for two different slice lengths, but the listener now forces them to be equal lenghts.
                        // The functionality for two slice lengths is left commented out in case it is ever used again.
                    if (j == slice.length-2 && i!=keys.length-1){ //&& slice2.length <= slice.length
                            let a = curr;
                            let b = curr  + (((index/2)+ slice2.length/2) )% (slice2.length/2)
                            if (index==0) b += slice2.length/2
                            let c = curr-j/2; 
                            let d = curr+1+((index/2)) % (slice2.length/2)

                            indices.push(c,a,d);
                            indices.push(a,b,d);
                    }

                    // Algorithm to cap top and bottom slices (creates triangles across the slice instead of to next slice)
                    if ((i == keys.length-1 || i==0) && j==0){

                        for (let k = 1; k < slice.length/4; k++){
                            let a = curr + k - 1;
                            let b = curr + (slice.length/2-k);
                            let c = curr + k;
                            let d = curr + (slice.length/2 - k - 1);

                            indices.push(c,a,d);
                            indices.push(a,b,d);
                        }
                    }

                    curr ++;
                   
                }

                /* // For different slice lengths -- need for this is bypassed by forcing same length slices in listener
                if (slice.length < slice2.length){
                    let newCurr = curr+(slice.length/2-1+index/2)%(slice2.length/2); 
                 
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
                */
            }

            // Create buffer geometry from points and set index and position attributes
            var geo = new THREE.BufferGeometry();
            geo.setIndex(indices);
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( pts, 3 ) );

            geo.computeBoundingSphere();                                    
            geo.computeVertexNormals();

            // Set colour attribute
            colours = new Uint8Array(colours);
            geo.setAttribute('color',  new THREE.BufferAttribute(colours,3,true));
            geo.attributes.color.normalized = true     
       
            // Create final mesh
            var mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({vertexColors:THREE.VertexColors, side:THREE.DoubleSide, shininess:0}));
            group.add(mesh);
        }    

        // Calculates the distance between two points
        function distance(x1, y1, x2, y2){
            return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
        }

        // Finds the index of a point in an array closest in distance to a given point (x,y)
        function closestIndex(x, y, array){
            let dist = distance(x, y, array[0], array[1]);
            let index = 0;
            for (let j=2; j<array.length; j+=2){
                let newdist = distance(x,y, array[j], array[j+1]);
                if ( newdist < dist){
                    dist = newdist;
                    index = j;
                }
            }
            return index;
        }
    }
})();

