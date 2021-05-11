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
        vm.uploadDICOM = uploadDICOM;
        vm.uploadRT = uploadRT;
        vm.slicePath = '';
        vm.showDetails = false;
        vm.showDetailedInfo = showDetailedInfo;
        

        vm.showImage = true;

        vm.multiImage = false;



        vm.filePath = '';
        vm.pixelData = [];
        vm.url = '';
        vm.loaded = false;

        vm.tags = [];

        vm.output = [];

        vm.imageType = "";

        vm.sliceIndex = 0;
      
        var params = null;
        
        var RTLoaded = false;
        var contourDict = {};

        activate();

        ////////////////

        function activate() {      

            vm.images=[
                {
                    name: 'Test DICOM Movie',
                    filePath: '',
                    type:'dicom-movie'
                },
                {
                    name: 'Test RT Data',
                    filePath: '',
                    type:'RT'
                },
                {
                    name: 'Test Listener Upload',
                    filePath: '',
                    type:'CT'
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
           
            ons.ready(function() {
                document.getElementById('tagContent').innerHTML = vm.output.join('');
            })
        }

        function openImage(image){
            vm.filePath = image.filePath;

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});

            vm.imageType = image.type;

              
            if (image.type==='dicom-movie') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom.html');
            if (image.type==='RT') personalNavigator.pushPage('./views/personal/imaging/imaging-rt.html');
            if (image.type==='CT') personalNavigator.pushPage('./views/personal/imaging/imaging-ct.html');

        }        
      

        function loadRT(file){
            var reader = new FileReader();
            reader.onload = function(file) {
                var arrayBuffer = reader.result;
                // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
                // Uint8Array so we create that here
                var byteArray = new Uint8Array(arrayBuffer);

                var rtData = dicomParser.parseDicom(byteArray); //, {untilTag: "x30060046"}

                var structureSetROISequence = rtData.elements.x30060020.items;

                // Get contour name and number
                structureSetROISequence.forEach(function(sequence){
                    var ROINum = sequence.dataSet.string('x30060022');
                    var ROIName = sequence.dataSet.string('x30060026');
                    contourDict[ROINum] = {};
                    contourDict[ROINum]['name'] = ROIName;
                });
                


                var ROIContourSequence = rtData.elements.x30060039.items;
             
                // TODO: geometric type

                // Get contour colour and number
                ROIContourSequence.forEach(function(ROIsequence){
                    var refROINum = ROIsequence.dataSet.string('x30060084')
                    var ROIDisplayColor = "rgb(0,0,0)";
                    if (ROIsequence.dataSet.string('x3006002a')){
                        var colorArray = ROIsequence.dataSet.string('x3006002a').split("\\");
                        ROIDisplayColor = "rgb(".concat(colorArray[0],",",colorArray[1],",",colorArray[2],")");
                    } 

                    contourDict[refROINum]['colour'] = ROIDisplayColor;

                    // Get contour data for each slice
                    var contourSequence = ROIsequence.dataSet.elements.x30060040.items;
                    contourSequence.forEach(function(contSequence){
                        var contourData = contSequence.dataSet.string('x30060050').split("\\").map(Number);
                        var SOPInstanceUID = contSequence.dataSet.elements.x30060016.items[0].dataSet.string('x00081155');
                        contourDict[refROINum][SOPInstanceUID] = contourData;                       
                    })
               })
            }
            reader.readAsArrayBuffer(file);

            RTLoaded = true;
        }


        function uploadRT(){
            var file = document.getElementById('importFile').files[0];
            loadRT(file);
        }



        function getTag(tag)
        {
            var group = tag.substring(1,5);
            var element = tag.substring(5,9);
            var tagIndex = ("("+group+","+element+")").toUpperCase();
            var attr = TAG_DICT[tagIndex];
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
            var keys = [];
            for (var tag in dataSet.elements){
                keys.push(tag)
            }


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
                
        

                
                var vr;
                if (el.vr !== undefined) {
                    vr = el.vr;
                }
                else {
                    if (tag !== undefined) {
                        vr = tag.vr;
                    }
                }  
        
                if (vr !== undefined){
                
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
                       // text += "Unable to display.";
                    }

                    else {
                        
                        // If it is some other length and we have no string
                        // text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
                        // text += dataSet.string(propertyName);
                    }
                } else {
                    text += dataSet.string(propertyName);
                }
            
                text += dataSet.string(propertyName);
            
                vm.output.push('<li>' + text + '</li>');
            }
        }
    

        

        function uploadDICOM(){
            
            var files = document.getElementById('importFiles').files;
            var file = files[0];        

            var numImages = files.length;

            if (numImages > 1){
                vm.multiImage = true;
                loadMultipleDICOM(files,numImages);

            } else {
                const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                loadSingleDICOM(imageId);
            }

            const element = document.getElementById('dicomImage');
            cornerstone.enable(element);
            
            vm.loaded = true;
        }

        function loadMultipleDICOM(files){
            //const StackScrollMultiTouchTool = cornerstoneTools.StackScrollMultiTouchTool;
            const StackScrollTool = cornerstoneTools.StackScrollTool;
            const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool;
            

            const imageIds = [];
            for (var i=0; i<files.length; i++){
                imageIds.push(cornerstoneWADOImageLoader.wadouri.fileManager.add(files[i]));
            }

            const stack = {
                currentImageIdIndex: 0,
                imageIds
            }

            const element = document.getElementById('dicomImage');
     
            cornerstone.enable(element);

            var viewport;
            var pixelSpacing = [];
            var imgPosition = [];

            cornerstone.loadImage(imageIds[0]).then(function(image){
                getTagOutput(image.data);
                
                viewport = cornerstone.getDefaultViewportForImage(element, image);
  

                cornerstoneTools.addStackStateManager(element, ['stack']);
                cornerstoneTools.addToolState(element, 'stack', stack);
                
                cornerstone.displayImage(element, image, viewport);

                document.getElementById('modality').textContent = image.data.string('x00080060');
                document.getElementById('date').textContent = $filter('formatDateDicom')(image.data.string('x00080020'));

                pixelSpacing = image.data.string('x00280030').split("\\").map(Number);
                imgPosition = image.data.string('x00200032').split("\\").map(Number);

               
                // if (document.getElementById("navi-segment-a")=== false){
                //     document.getElementById('tagContent').innerHTML = vm.output.join('');
                // }
               
            });

            cornerstoneTools.addTool(StackScrollTool)
            cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 1 })
            
            cornerstoneTools.addTool(ZoomTouchPinchTool)
            cornerstoneTools.setToolActive('ZoomTouchPinch', { mouseButtonMask: 1 })

            element.addEventListener("cornerstoneimagerendered", function(e) {
                // Update Slice
                document.getElementById("slice").innerHTML = e.detail.image.imageId.replace(/\D/g, "");

                // Get canvas info for drawing
                const eventData = e.detail;
                const canvas = eventData.canvasContext.canvas;
                const canvasContext = canvas.getContext('2d');
                
                var scale = viewport.scale;

                // UID of current image slice
                var UID = e.detail.image.data.string('x00080018');

                // Draw all contours present on current slice (by UID)
                if (RTLoaded == true){
                    Object.values(contourDict).forEach(function (contour){
                        if (contour.hasOwnProperty(UID)){
                            drawContours(contour[UID], contour['colour'], canvasContext, element, scale, imgPosition, pixelSpacing)
                        }
                    });
                }
            });

           element.addEventListener('nagi-segment-a', function(e){
               document.getElementById('tagContent').innerHTML = vm.output.join('');
           })
        }
 
        function drawContours(contourData, colour, canvasContext, element, scale, imgPosition, pixelSpacing){

            var startCoord = cornerstone.pixelToCanvas(element, {x:(contourData[0]-imgPosition[0])/pixelSpacing[0]/scale, y:(contourData[1]-imgPosition[1])/pixelSpacing[1]/scale})
            var canvasCoords = [];

            canvasContext.beginPath();
            canvasContext.strokeStyle = colour;
            canvasContext.lineWidth = 3;
            canvasContext.moveTo(startCoord.x, startCoord.y)
           
            for (var i = 3; i < contourData.length; i+=3){
                canvasCoords = cornerstone.pixelToCanvas(element, {x:(contourData[i]-imgPosition[0])/pixelSpacing[0]/scale, y:(contourData[i+1]-imgPosition[1])/pixelSpacing[1]/scale})
                canvasContext.lineTo(canvasCoords.x, canvasCoords.y);                
            }

            canvasContext.lineTo(startCoord.x, startCoord.y)
            canvasContext.stroke();
        }
        

        function loadSingleDICOM(imageId) {

            const element = document.getElementById('dicomImage');
            cornerstone.enable(element);
      
            cornerstone.loadImage(imageId).then(function(image) {
                getTagOutput(image.data);
                const viewport = cornerstone.getDefaultViewportForImage(element, image);

                cornerstone.displayImage(element, image, viewport);

                document.getElementById('modality').textContent = image.data.string('x00080060');
                document.getElementById('date').textContent = $filter('formatDateDicom')(image.data.string('x00080020'));
               
                element.addEventListener("cornerstoneimagerendered", function(e) {
                    const eventData = e.detail;
                    const canvas = eventData.canvasContext.canvas;
                    const canvasContext = canvas.getContext('2d');

                    var scale = viewport.scale;

                });
            }, function(err) {
                alert(err);
            });

            element.addEventListener('nagi-segment-a', function(e){
                document.getElementById('tagContent').innerHTML = vm.output.join('');     
            })
        }
    }
               

})();
