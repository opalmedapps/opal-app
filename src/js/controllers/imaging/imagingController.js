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
        vm.uploadDICOM = uploadDICOM;
        vm.uploadRT = uploadRT;
        vm.slicePath = '';
        vm.showDetails = false;
        vm.showDetailedInfo = showDetailedInfo;
        

        vm.showImage = true;

        vm.multiImage = false;

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
                    name: 'Test Movie',
                    filePath: './img/dicom/testmvid.mp4',
                    type: 'video'
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
        }

        function openImage(image){
            vm.filePath = image.filePath;

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});//, imageCategory: image.type});

            vm.imageType = image.type;

            if (image.type==='dicom-movie') personalNavigator.pushPage('./views/personal/imaging/imaging-dicom.html');
            if (image.type==='RT') personalNavigator.pushPage('./views/personal/imaging/RT.html');

        }        

        function parseByteArray(byteArray){
            console.log("test")
            try{
                var dataSet = dicomParser.parseDicom(byteArray);
                console.log(dataSet)
                getTagOutput(dataSet);
                console.log("TEST")
            } catch (err){}
            vm.loaded = true;

            
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
            //var file = document.getElementById('importFile').files[0];
            
            var files = document.getElementById('importFile').files;
            var file = files[0];        

            var numImages = files.length;

            if (numImages > 1){
                vm.multiImage = true;
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

            const stack = {
                currentImageIdIndex: 0,
                imageIds
            }

            const element = document.getElementById('dicomImage');
     
            cornerstone.enable(element);


            cornerstone.loadImage(imageIds[0]).then(function(image){
                getTagOutput(image.data);
                
                const viewport = cornerstone.getDefaultViewportForImage(element, image);
  

                cornerstoneTools.addStackStateManager(element, ['stack']);
                cornerstoneTools.addToolState(element, 'stack', stack);
                
                cornerstone.displayImage(element, image, viewport);

                document.getElementById('modality').textContent = image.data.string('x00080060');
                document.getElementById('date').textContent = $filter('formatDateDicom')(image.data.string('x00080020'));
                console.log(image.data.string('x00080020'))
                
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
            cornerstone.enable(element);
      
            

            cornerstone.loadImage(imageId).then(function(image) {
                getTagOutput(image.data);
                const viewport = cornerstone.getDefaultViewportForImage(element, image);

                cornerstone.displayImage(element, image, viewport);

                document.getElementById('modality').textContent = image.data.string('x00080060');
                document.getElementById('date').textContent = $filter('formatDateDicom')(image.data.string('x00080020'));
               

            }, function(err) {
                alert(err);
            });

            element.addEventListener('nagi-segment-a', function(e){
                console.log(e)
                document.getElementById('tagContent').innerHTML = vm.output.join('');     
            })
        }
    }
               

})();
