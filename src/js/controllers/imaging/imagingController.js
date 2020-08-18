// add description see diagnosescontroller

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('imagingController', imagingController);

    /* @ngInject */
    imagingController.$inject = ['$timeout','NavigatorParameters','UserPreferences'];


    function imagingController($timeout, NavigatorParameters, UserPreferences) {
        var vm = this;
        
        vm.images = [];
        vm.language = '';
        vm.noImage = false;
        vm.showHeader = showHeader;
        vm.openImage = openImage;
        vm.slice = 0;
        vm.getSlicePath = getSlicePath;
        vm.updateSlice = updateSlice;
        vm.slicePath = '';

        vm.filePath = '';

        activate();

        ////////////////

        function activate() {
            //load the images array into view
            // vm.images=Images.getImages();

    
       

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

        function openImage(image){
            vm.filePath = image.filePath;

            NavigatorParameters.setParameters({'navigatorName':'personalNavigator'});

            if (image.type==='video') personalNavigator.pushPage('./views/personal/imaging/imaging-video.html');
            if (image.type==='single') personalNavigator.pushPage('./views/personal/imaging/imaging-single.html');
            if (image.type==='slices') personalNavigator.pushPage('./views/personal/imaging/imaging-slices.html');

        }

        function getSlicePath(){
            let path = "./img/dicom/testslices/";
            if (vm.slice/10<1) return path + "image-0000"+vm.slice + ".png";
            else if (vm.slice/100 < 1) return path + "image-000"+vm.slice + ".png";
            else return path + "image-00"+vm.slice + ".png";

        }

        function updateSlice(){
            $timeout(function(){}, 0); 
        }
    }

})();


