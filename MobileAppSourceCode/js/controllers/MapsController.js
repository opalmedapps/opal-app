var myApp=angular.module('MUHCApp');
myApp.controller('MapsController',['$timeout', '$scope',function($timeout,$scope){
  console.log('Simgle Document Controller');

}]);

myApp.controller('IndividualMapController',['$timeout', '$scope',function($timeout,$scope){
  var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas'),
            path: "./img/D-S1_map_RadOnc-MedPhys_16June2015_en.png"
        });


  }]);

myApp.controller('IndividualMapController1',['$timeout', '$scope',function($timeout,$scope){
  var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas1'),
            path: "./img/D2_Palliative_psychoncology_16June2015_en.png"
        });


  }]);
myApp.controller('IndividualMapController2',['$timeout', '$scope',function($timeout,$scope){
  var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas2'),
            path: "./img/D-RC_ODC_16June2015_en_FNL.png"
        });


  }]);