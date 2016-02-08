var myApp=angular.module('MUHCApp');
myApp.controller('MapsController',['$timeout', '$scope',function($timeout,$scope){
  $scope.showMap=function(str){
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if(app){
       var ref = cordova.InAppBrowser.open(str, '_blank', 'EnableViewPortScale=yes');
    }else{
       window.open(str);
    }
  }
}]);

/*myApp.controller('IndividualMapController',['$timeout', '$scope',function($timeout,$scope){
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


  }]);*/
