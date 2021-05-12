(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('individualImagingController', individualImagingController);

    /* @ngInject */
    individualImagingController.$inject = ['$filter','$scope','$timeout','NavigatorParameters','Radiotherapy','UserPreferences'];


    function individualImagingController($filter, $scope, $timeout, NavigatorParameters, Radiotherapy, UserPreferences) {
        var vm = this;
        vm.loading = true
        vm.images = [];
        vm.language = '';
        vm.noImage = false;
        vm.showHeader = showHeader;
        vm.getSrc = getSrc
        // vm.openImage = openImage;
        vm.slice = 0;
        // vm.uploadRT = uploadRT;
        vm.slicePath = '';
        vm.showDetails = false;
        // vm.showDetailedInfo = showDetailedInfo;
        
        
        vm.showImage = true;

        vm.multiImage = false;

        vm.date
        vm.modality
        vm.file;
        vm.files
        vm.filePath = '';
        vm.pixelData = [];
        vm.url = '';
        vm.loaded = false;
        vm.index = 1

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
            file = JSON.parse(file)
            vm.files = file.img
            vm.multiImage = vm.files.length > 1

            vm.modality =file.modality
            vm.date =  $filter('formatDateDicom')(file.date)

            console.log(file)
            vm.loaded = true;
            vm.loading=false
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

            vm.index = 1

            var element = document.getElementById("imgs");
            var startY = 0;
            var currentY = 0;

            element.addEventListener("touchstart", function(e){
                startY = e.touches[0].clientY;
                e.preventDefault(); // prevent page from scrolling 
            })
       
            element.addEventListener("touchmove", function(e){

                currentY = e.touches[0].clientY;
            
                if (Math.abs(currentY-startY)>10){
                    var change = Math.round((currentY - startY)/10)

                    if ((change+vm.index) < 1 ) vm.index = 1
                    else if ((change+vm.index) > vm.files.length) vm.index = vm.files.length
                    else vm.index = vm.index + change

                    $scope.$apply();
                    startY = currentY
                }
       
                e.preventDefault(); // prevent page from scrolling 
                
            })
        }

        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
               // if (index === 0) return true;
               // var current = (new Date(vm.images[index].CreationDate)).setHours(0,0,0,0);
               // var previous = (new Date(vm.images[index-1].CreationDate)).setHours(0,0,0,0);
               // return current !== previous;
        }

    
        function getSrc(index){
            return "data:image/jpg;base64," + vm.files[index]
        }
        
  

    }
               

})();
