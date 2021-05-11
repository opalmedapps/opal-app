
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('individualImagingController', individualImagingController);

    /* @ngInject */
    individualImagingController.$inject = ['$filter','$scope','$timeout','NavigatorParameters','Radiotherapy','UserPreferences'];


    function individualImagingController($filter, $scope, $timeout, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;
        
        vm.images = [];
        vm.language = '';
        vm.noImage = false;
        vm.showHeader = showHeader;
        // vm.openImage = openImage;
        vm.slice = 0;
        vm.uploadDICOM = uploadDICOM;
        // vm.uploadRT = uploadRT;
        vm.slicePath = '';
        vm.showDetails = false;
        // vm.showDetailedInfo = showDetailedInfo;
        
        
        vm.showImage = true;

        vm.multiImage = false;

        vm.date
        vm.modality
        vm.file;
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

            
        Radiotherapy.requestImgDicomContent(7)
        .then(function (file) {
            vm.file = 'data:image/jpg;base64,' + file.img.slice(1,-1);  
            vm.modality =file.modality
            vm.date =  $filter('formatDateDicom')(file.date)

            console.log(file)
            vm.loaded = true;
            // loadSingleDicom(file);
            

            vm.loading = false;
        })
        .catch(function(error){
            $timeout(function(){
                vm.loading = false;
            //     handleRequestError();
            })
        });


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

    

        
  

    }
               

})();
