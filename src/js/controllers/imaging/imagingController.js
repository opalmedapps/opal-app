// add description see diagnosescontroller
import * as dicomParser from 'dicom-parser';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import Hammer from "hammerjs";

import {TAG_DICT} from './dataDictionary.js';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;


cornerstoneTools.init({
    globalToolSyncEnabled: true,
  });

//const scrollToIndex = cornerstoneTools.import('util/scrollToIndex');


(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('imagingController', imagingController);

    /* @ngInject */
    imagingController.$inject = ['$filter','$scope','$timeout','NavigatorParameters','UserPreferences'];


    function imagingController($filter, $scope, $timeout, NavigatorParameters, UserPreferences) {
        var vm = this;
        
        vm.images = [];
        vm.language = '';
        vm.noImage = false;
        vm.showHeader = showHeader;
        vm.openImage = openImage;
        vm.slice = 0;
        //vm.getSlicePath = getSlicePath;
        // vm.updateSlice = updateSlice;
        vm.uploadDICOM = uploadDICOM;
        // vm.uploadDOSE = uploadDOSE;
        vm.uploadRT = uploadRT;
        vm.slicePath = '';
        vm.showDetails = false;
        vm.showDetailedInfo = showDetailedInfo;
        

        vm.showImage = true;

        // vm.uploadFiles = uploadFiles;


        vm.filePath = '';
        vm.filemodel = '';
        vm.pixelData = [];
        vm.url = '';
        vm.loaded = false;

        vm.tags = [];

        vm.output = [];

        vm.imageType = "";

        vm.sliceIndex = 0;
      
        var params = null;
        

        activate();

        ////////////////

        function activate() {      

            vm.images=[
                {
                    name: 'Test X-Ray',
                    filePath: './img/dicom/testsingle.png',
                    type: 'single'
                },
                {
                    name: 'Test Movie',
                    filePath: './img/dicom/testmvid.mp4',
                    type: 'video'
                },
                {
                    name: 'Test CT slices',
                    filePath: '',
                    type: 'slices'
                },
                {
                    name: 'Test DICOM Upload',
                    filePath: '',
                    type: 'dicom'
                },
                {
                    name: 'Test DICOM Movie',
                    filePath: '',
                    type:'dicom-movie'
                },
                {
                    name: 'Test RT Data',
                    filePath: '',
                    type:'RT'
                }

            ]

            if(vm.images.length === 0){
                vm.noImage = true;
            }
            
            //grab the language
            vm.language = UserPreferences.getLanguage();

        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
               // if (index === 0) return true;
               // var current = (new Date(vm.images[index].CreationDate)).setHours(0,0,0,0);
               // var previous = (new Date(vm.images[index-1].CreationDate)).setHours(0,0,0,0);
               // return current !== previous;
        }

        function showDetailedInfo(){
            vm.showDetails = true;
            console.log(vm.output.length)
           
            ons.ready(function() {
                document.getElementById('tagContent').innerHTML = vm.output.join('');
            })
            
            
            
           
          
            // personalNavigator.pushPage('./views/personal/imaging/imaging-details.html');
            

            // ons.ready(function() {
            //     personalNavigator.on('postpush', function() {
            //     document.getElementById('tagContent').innerHTML = vm.output.join('');
                  
            //     });
            //   });
            
            

        }

        function openImage(image){
            vm.filePath = image.filePath;

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});

            // personalNavigator.pushPage('./views/personal/imaging/load-image.html');

            vm.imageType = image.type;
            console.log(vm.imageType)

            if (image.type==='video') personalNavigator.pushPage('./views/personal/imaging/imaging-video.html');
            if (image.type==='single') personalNavigator.pushPage('./views/personal/imaging/imaging-single.html');
            if (image.type==='slices') personalNavigator.pushPage('./views/personal/imaging/imaging-slices.html');
            if (image.type==='dicom') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom.html');
            if (image.type==='dicom-movie') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom-movie.html');
            if (image.type==='RT') personalNavigator.pushPage('./views/personal/imaging/RT.html');

        }

        // function uploadFiles(){

        //     params = NavigatorParameters.getParameters();

        //     // Set category if specified in NavigatorParameters, otherwise defaults to clinical
        //     if(params.hasOwnProperty('imageCategory')){
        //         vm.imageType = params.imageCategory;
        //     }

        //     console.log(vm.imageType);
        //     if (vm.imageType==='video') personalNavigator.pushPage('./views/personal/imaging/imaging-video.html');
        //     if (vm.imageType==='single') personalNavigator.pushPage('./views/personal/imaging/imaging-single.html');
        //     if (vm.imageType==='slices') personalNavigator.pushPage('./views/personal/imaging/imaging-slices.html');
        //     if (vm.imageType==='dicom') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom.html');
        //     if (vm.imageType==='dicom-movie') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom-movie.html');
        //     if (vm.imageType==='RT') personalNavigator.pushPage('./views/personal/imaging/RT.html');
            

        // }

        // function getSlicePath(){
        //     let path = "./img/dicom/testslices/";
        //     if (vm.slice/10<1) return path + "image-0000"+vm.slice + ".png";
        //     else if (vm.slice/100 < 1) return path + "image-000"+vm.slice + ".png";
        //     else return path + "image-00"+vm.slice + ".png";

        // }

        // function updateSlice(){
        //     $timeout(function(){}, 0); 
        // }
/*
        function getOrdering(files){
            var rearrange = [];

            
        
            for (let i = 0; i<files.length; i++){
                const reader = new FileReader();
                console.log(files.length)
                reader.readAsArrayBuffer(files[i]);
                const dicomPart10AsArrayBuffer = reader.result;                
                const byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
                try {
                    const dataSet = dicomParser.parseDicom(byteArray);
                    rearrange.push(dataSet.string('x00200013'));
                    console.log("rearrange")
                    console.log(rearrange)
                } catch (err) {
                    console.log(`DicomParsing Error: ${err}`);
                    alert(`DicomParsing Error: ${err}`);
                } 
            }
        }
        */

        /*
        function getAllTags(file){
            const reader = new FileReader();
            const tags = [
            'x00080005',
            'x00081030',
            'x0008103e',
            'x00080060',
            'x00080012',
            'x00080090',
            'x00200013'
            ];

            reader.readAsArrayBuffer(file);
            reader.onload = function(event) {
            const dicomPart10AsArrayBuffer = reader.result;                
            const byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
            try {
                const dataSet = dicomParser.parseDicom(byteArray);
                let output = '<ul>';
                let item = '';
                for (let i = 0; i < tags.length; i++) {
                //item = getTag(tags[i]);
                output += '<li>' + tags[i].tag + ' -> ' +' : ' + dataSet.string(tags[i]) + '</li>';
                } // end for i 
                output += '</ul>';
                document.getElementById('dicomContent').innerHTML = output;
                console.log(output)
            } catch (err) {
                console.log(`DicomParsing Error: ${err}`);
                alert(`DicomParsing Error: ${err}`);
            } // end try catch
            }; // end reader.onload
                
            reader.onerror = function(err) {
            alert(`Reading Error: $(err)`);
            };  // end reader.onerror
                
        }  
        */


        // function uploadDOSE(){
        //     var file = document.getElementById('importFile').files[0];
        //     const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        //     loadDose(imageId);

        // }

        // function loadDose(imageId){
           
        //     //const element = document.getElementById('');
            
        //     cornerstone.loadImage(imageId).then(function(image) {
                    
        //         //const viewport = cornerstone.getDefaultViewportForImage(element, image);
        //         console.log("DOSE");
        //         console.log(image.data);
    
        //         //cornerstone.displayImage(element, image, viewport);
        //         dataSet = dicomParser.parseDicom(byteArray, options);
        //     });
        // }

        

        function parseByteArray(byteArray){
            console.log("test")
            try{
                var dataSet = dicomParser.parseDicom(byteArray);
                console.log(dataSet)
                getTagOutput(dataSet);
                console.log("TEST")
            } catch (err){}
            vm.loaded = true;

            // showDetailedInfo();
            
            setTimeout(function(){showDetailedInfo();}, 10000);
            
            
            
            
           
        }
    
            
    
        

        function loadRT(file){
            var reader = new FileReader();
            reader.onload = function(file) {
                var arrayBuffer = reader.result;
                // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
                // Uint8Array so we create that here
                var byteArray = new Uint8Array(arrayBuffer);
                parseByteArray(byteArray);
            }
            reader.readAsArrayBuffer(file);

            


        }

        function uploadRT(){
            var file = document.getElementById('importFile').files[0];
            // loadRT(file);
            loadRT(file);


 
        }

        function getTag(tag)
        {
            var group = tag.substring(1,5);
            var element = tag.substring(5,9);
            var tagIndex = ("("+group+","+element+")").toUpperCase();
            var attr = TAG_DICT[tagIndex];
            //console.log(attr)
            return attr;
        }

        function dataDownloadLink(element, text) {
            var linkText = "<a class='dataDownload' href='#' data-tag='" + element.tag + "'";
                linkText += " data-dataOffset='" + element.dataOffset + "'";
                linkText += " data-length='" + element.length + "'";
                linkText += ">" + text + "</a>";
            return linkText;
        }

        function getTagOutput(dataSet){
            console.log(dataSet.string("x30060020"))
            var keys = [];
                for (var tag in dataSet.elements){
                    keys.push(tag)
                }
                console.log(keys.length)

                // var output= [];

                for(var k=0; k < keys.length; k++) {
                    var propertyName = keys[k];
                    var el = dataSet.elements[propertyName];

                    var text = "";
                    var title = "";

                    var color = 'black';

                    var fullTag = getTag(el.tag);

                    if (fullTag != undefined){

                        text += "<b>";
                        text += fullTag.name;
                        text += ": ";
                        text += "</b>"
                    } else {
                        text += "<b>";
                        text += propertyName;
                        text += ": ";
                        text += "</b>"
                    }
                   
                    console.log(el)
                   // text += dataSet.string(propertyName);
                   // console.log(dataSet.string(propertyName));    

                                   
                
                //    var str = dataSet.string(propertyName);
                //    var stringIsAscii = isASCII(str);

                //    if (isStringVr(vr)) {
                //     // Next we ask the dataset to give us the element's data in string form.  Most elements are
                //     // strings but some aren't so we do a quick check to make sure it actually has all ascii
                //     // characters so we know it is reasonable to display it.
                //     var str = dataSet.string(propertyName);
                //     var stringIsAscii = isASCII(str);

                //     if (stringIsAscii) {
                //         // the string will be undefined if the element is present but has no data
                //         // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                //         // data.  Note that the length of the element will be 0 to indicate "no data"
                //         // so we don't put anything here for the value in that case.
                //         if (str !== undefined) {
                //             text += '"' + str + '"' + mapUid(str);
                //         }
                //     }
                //     else {
                //         if (element.length !== 2 && element.length !== 4) {
                //             color = '#C8C8C8';
                //             // If it is some other length and we have no string
                //             text += "<i>binary data</i>";
                //         }
                //     }
                // }
               // console.log(el.vr)

                        console.log("hello0")
                    var vr;
                    if (el.vr !== undefined) {
                        vr = el.vr;
                    }
                    else {
                        if (tag !== undefined) {
                            vr = tag.vr;
                        }
                    }  
                console.log("hello1")
               if (vr !== undefined){
                   console.log("here")
                    console.log(vr)
               if (vr === 'US') {
                   text += dataSet.uint16(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/2; i++) {
                       text += '\\' + dataSet.uint16(propertyName, i);
                   }
               }
               else if (vr === 'SS') {
                   text += dataSet.int16(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/2; i++) {
                       text += '\\' + dataSet.int16(propertyName, i);
                   }
               }
               else if (vr === 'UL') {
                   text += dataSet.uint32(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/4; i++) {
                       text += '\\' + dataSet.uint32(propertyName, i);
                   }
               }
               else if (vr === 'SL') {
                   text += dataSet.int32(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/4; i++) {
                       text += '\\' + dataSet.int32(propertyName, i);
                   }
               }
               else if (vr == 'FD') {
                   text += dataSet.double(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/8; i++) {
                       text += '\\' + dataSet.double(propertyName, i);
                   }
               }
               else if (vr == 'FL') {
                   text += dataSet.float(propertyName);
                   for(var i=1; i < dataSet.elements[propertyName].length/4; i++) {
                       text += '\\' + dataSet.float(propertyName, i);
                   }
               }
               else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
                   color = '#C8C8C8';
                   // If it is some other length and we have no string
                   if(el.length === 2) {
                       text += "<i>" + dataDownloadLink(el, "binary data") + " of length " + el.length + " as uint16: " +dataSet.uint16(propertyName);
                   } else if(el.length === 4) {
                       text += "<i>" + dataDownloadLink(el, "binary data") + " of length " + el.length + " as uint32: " +dataSet.uint32(propertyName);
                   } else {
                       text += "<i>" + dataDownloadLink(el, "binary data") + " of length " + el.length + " and VR " + vr + "</i>";
                   }
               }
               else if(vr === 'AT') {
                   var group = dataSet.uint16(propertyName, 0);
                   var groupHexStr = ("0000" + group.toString(16)).substr(-4);
                   var element = dataSet.uint16(propertyName, 1);
                   var elementHexStr = ("0000" + element.toString(16)).substr(-4);
                   text += "x" + groupHexStr + elementHexStr;
               }
               else if(vr === 'SQ') {
                   text += "STUFF -- HOW TO DISPLAY";
               }

               else {
                   // If it is some other length and we have no string
                  // text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
                  // text += dataSet.string(propertyName);
               }
            } else {
                 text += dataSet.string(propertyName);
                 console.log("here2")

                
            }
            
            text += dataSet.string(propertyName);

           
       


                    vm.output.push('<li>' + text + '</li>');
                    // output.push('<ul>');
                    // document.getElementById('tagContent').innerHTML = vm.output.join('');

                    // // each item contains its own data set so we iterate over the items
                    // // and recursively call this function
                    // var itemNumber = 0;
                    // el.items.forEach(function (item) {
                    //     output.push('<li>Item #' + itemNumber++ + ' ' + item.tag);
                    //     //var lengthText = " length=" + item.length;
                    //     // if (item.hadUndefinedLength) {
                    //     //     lengthText += " (-1)";
                    //     // }

                    //     // if(showLength === true) {
                    //     //     text += lengthText + "; ";
                    //     //     output.push(lengthText);
                    //     // }
                    //     output.push('</li>');
                    //     output.push('<ul>');
                    //     //dumpDataSet(item.dataSet, output);
                    //     output.push('</ul>');
                    // });
                    // output.push('</ul>');
                    //console.log(vm.output)
                }
        }

        

        function uploadDICOM(){
            //var file = document.getElementById('importFile').files[0];
            
            var files = document.getElementById('importFile').files;
            var file = files[0];        

            var numImages = files.length;

            if (numImages > 1){
                loadMultipleDICOM(files,numImages);

            } else {
                const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                loadSingleDICOM(imageId);
                //console.log(typeof(imageId));

            }

            const element = document.getElementById('dicomImage');
            cornerstone.enable(element);
            
            vm.loaded = true;
        }

        function loadMultipleDICOM(files, numImages){
            //const StackScrollMultiTouchTool = cornerstoneTools.StackScrollMultiTouchTool;
            const StackScrollTool = cornerstoneTools.StackScrollTool;
            const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
            

            const imageIds = [];
            for (var i=0; i<files.length; i++){
                imageIds.push(cornerstoneWADOImageLoader.wadouri.fileManager.add(files[i]));
            }

            //console.log(typeof(imageIds[0]));
            const stack = {
                currentImageIdIndex: 0,
                imageIds
            }

           

            const element = document.getElementById('dicomImage');
            
                
            cornerstone.enable(element);


            cornerstone.loadImage(imageIds[0]).then(function(image){
                // console.log(image.data.string('x00200013'));
                // console.log(image.data);
                console.log("******")
                getTagOutput(image.data);
                // console.log(image.data.elements);
                // console.log(TAG_DICT)
                // console.log(TAG_DICT["(0002,0010)"])

                // var keys = [];
                // for (var tag in image.data.elements){
                //     keys.push(tag)
                // }
                // console.log(keys.length)

              

                // for(var k=0; k < keys.length; k++) {
                //     var propertyName = keys[k];
                //     var el = image.data.elements[propertyName];

                //     var text = "";
                //     var title = "";

                //     var color = 'black';

                //     var fullTag = getTag(el.tag);

                //     text += fullTag.name;
                //     text += ": ";
                //     text += image.data.string(propertyName);
                //     console.log(image.data.string(propertyName));                      
                

                //     vm.output.push('<li>' + text + '</li>');
          
                // }
        

                
                


                const viewport = cornerstone.getDefaultViewportForImage(element, image);

                

                cornerstoneTools.addStackStateManager(element, ['stack']);
                cornerstoneTools.addToolState(element, 'stack', stack);
                // scrollToIndex(element, stack.currentImageIdIndex);
                cornerstone.displayImage(element, image, viewport);
                // console.log(image.data)
                // console.log(image.data.string('x00080060'))
                // for (let i=0; i<image.data.elements.length; i++){
                //     console.log(image.data[i])
                // }
                document.getElementById('modality').textContent = image.data.string('x00080060');
                document.getElementById('date').textContent = $filter('formatDateDicom')(image.data.string('x00080020'));
                console.log(image.data.string('x00080020'))
                //console.log(image.data.elements)

                // if (document.getElementById("navi-segment-a")=== false){
                //     document.getElementById('tagContent').innerHTML = vm.output.join('');
                // }
               
            });

            cornerstoneTools.addTool(StackScrollTool)
            cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 })
            
            cornerstoneTools.addTool(ZoomTouchPinchTool)
            cornerstoneTools.setToolActive('ZoomTouchPinch', { mouseButtonMask: 1 })

            element.addEventListener('cornerstonenewimage', function (e) {
                document.getElementById("slice").innerHTML = e.detail.image.imageId.replace(/\D/g, "");
                // vm.sliceIndex = e.detail.image.imageId;
                // document.getElementById('slice').textContent = vm.slicetickness;//e.detail.image.imageId;
                // window.downloadURL = e.detail.image.imageId.replace('wadouri:', '');
           });
           element.addEventListener('nagi-segment-a', function(e){
               console.log(e)
               document.getElementById('tagContent').innerHTML = vm.output.join('');
                
           })
        }


        function loadSingleDICOM(imageId) {
            const element = document.getElementById('dicomImage');
            const start = new Date().getTime();
            
            const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;


            cornerstone.loadImage(imageId).then(function(image) {
                getTagOutput(image.data);
                const viewport = cornerstone.getDefaultViewportForImage(element, image);

                cornerstone.displayImage(element, image, viewport);

                // const MagnifyTool = cornerstoneTools.MagnifyTool;
                // cornerstoneTools.addTool(MagnifyTool)
                // cornerstoneTools.setToolActive('Magnify', { mouseButtonMask: 1 })

                // var hammertime = new Hammer(element);
                // hammertime.get('pinch').set({enable: true});

                
                // const ZoomTool = cornerstoneTools.ZoomTool;

                // cornerstoneTools.addTool(cornerstoneTools.ZoomTool, {
                // // Optional configuration
                // configuration: {
                //     invert: false,
                //     preventZoomOutsideImage: false,
                //     minScale: .1,
                //     maxScale: 20.0,
                // }
                // });

                // cornerstoneTools.addTool(ZoomTool);
                // cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 })
                // var hammertime = new Hammer(element);
                // hammertime.get('pinch').set({enable: true});
                
                
               
                cornerstoneTools.addTool(ZoomTouchPinchTool)
                cornerstoneTools.setToolActive('ZoomTouchPinch', {mouseButtonMask: 0, isTouchActive: true})

                // cornerstoneTools.touchInput.enable(element);
                // cornerstoneTools.zoomTouchPinch.activate(element);                

                if(false){
                    vm.loaded = true;
                function getTransferSyntax() {
                    const value = image.data.string('x00020010');
                    return value //+ ' [' + uids[value] + ']';
                }

                function getSopClass() {
                    const value = image.data.string('x00080016');
                    return value //+ ' [' + uids[value] + ']';
                }

                function getPixelRepresentation() {
                    const value = image.data.uint16('x00280103');
                    if(value === undefined) {
                        return;
                    }
                    return value + (value === 0 ? ' (unsigned)' : ' (signed)');
                }

                function getPlanarConfiguration() {
                    const value = image.data.uint16('x00280006');
                    if(value === undefined) {
                        return;
                    }
                    return value + (value === 0 ? ' (pixel)' : ' (plane)');
                }

                document.getElementById('transferSyntax').textContent = getTransferSyntax();
                document.getElementById('sopClass').textContent = getSopClass();
                document.getElementById('samplesPerPixel').textContent = image.data.uint16('x00280002');
                document.getElementById('photometricInterpretation').textContent = image.data.string('x00280004');
                document.getElementById('numberOfFrames').textContent = image.data.string('x00280008');
                document.getElementById('planarConfiguration').textContent = getPlanarConfiguration();
                document.getElementById('rows').textContent = image.data.uint16('x00280010');
                document.getElementById('columns').textContent = image.data.uint16('x00280011');
                document.getElementById('pixelSpacing').textContent = image.data.string('x00280030');
                document.getElementById('bitsAllocated').textContent = image.data.uint16('x00280100');
                document.getElementById('bitsStored').textContent = image.data.uint16('x00280101');
                document.getElementById('highBit').textContent = image.data.uint16('x00280102');
                document.getElementById('pixelRepresentation').textContent = getPixelRepresentation();
                document.getElementById('windowCenter').textContent = image.data.string('x00281050');
                document.getElementById('windowWidth').textContent = image.data.string('x00281051');
                document.getElementById('rescaleIntercept').textContent = image.data.string('x00281052');
                document.getElementById('rescaleSlope').textContent = image.data.string('x00281053');
                document.getElementById('basicOffsetTable').textContent = image.data.elements.x7fe00010 && image.data.elements.x7fe00010.basicOffsetTable ? image.data.elements.x7fe00010.basicOffsetTable.length : '';
                document.getElementById('fragments').textContent = image.data.elements.x7fe00010 && image.data.elements.x7fe00010.fragments ? image.data.elements.x7fe00010.fragments.length : '';
                document.getElementById('minStoredPixelValue').textContent = image.minPixelValue;
                document.getElementById('maxStoredPixelValue').textContent = image.maxPixelValue;
                document.getElementById('totalTime').textContent = time + "ms";
                document.getElementById('loadTime').textContent = image.loadTimeInMS + "ms";
                document.getElementById('decodeTime').textContent = image.decodeTimeInMS + "ms";
                }
            }, function(err) {
                alert(err);
            });
        }
    }
               

})();


