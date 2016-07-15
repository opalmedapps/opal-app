var myApp=angular.module('MUHCApp');
myApp.controller('MapsController',['$timeout', '$scope','FirebaseService','RequestToServer', function($timeout,$scope,FirebaseService,RequestToServer){
  var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  $scope.showMap=function(str){

    if(app){
       var ref = cordova.InAppBrowser.open(str, '_blank', 'EnableViewPortScale=yes');
    }else{
       window.open(str);
    }
  }
  function goToScanMyLocation(result)
  {
    console.log('Im in there!');
    
    generalNavigator.pushPage('./views/general/maps/hospital-location-scan.html',{param:result});

   /* RequestToServer.sendRequest('MapLocation',{'QRCode':result});
    var ref=new Firebase(FirebaseService.getFirebaseUserFieldsUrl()+'/MapLocation');
    ref.on('value',function(snapshot)
    {
      var value=snapshot.val();
      if(typeof value!=='undefined')
      {
        console.log(value);
        ref.set(null);
        ref.off();
      }
    });*/
  }
  $scope.scanLocation=function()
  {
    if(app)
    {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          console.log(result);
            if(!result.cancelled)
            {
              console.log('boom');
                if(result.format == "QR_CODE")
                {
                  console.log(result.format);

                    goToScanMyLocation(result.text);
                    /*navigator.notification.prompt("Please enter name of data",  function(input){
                        var name = input.input1;
                        var value = result.text;
                        var data = localStorage.getItem("LocalData");
                        console.log(data);
                        data = JSON.parse(data);
                        data[data.length] = [name, value];
                        localStorage.setItem("LocalData", JSON.stringify(data));
                        alert("Done");
                    });*/
                }
            }
        },
        function (error) {
          console.log(error)
        }
      );
    }

  }
}]);

myApp.controller('IndividualMapController',['$timeout', '$scope','NavigatorParameters','UserPreferences',function($timeout,$scope,NavigatorParameters,UserPreferences ){
  $scope.map=NavigatorParameters.getParameters();
  var language=UserPreferences.getLanguage();
  console.log($scope.map);
  if(language=='EN')
  {
    $scope.name=$scope.map.MapName_EN;
    $scope.description=$scope.map.MapDescription_EN;
  }else if(language=='FR'){
    $scope.name=$scope.map.MapName_FR;
    $scope.description=$scope.map.MapDescription_FR;
  }
  $scope.openMap=function()
  {
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if(app)
    {
      var ref = cordova.InAppBrowser.open($scope.map.MapUrl, '_blank', 'EnableViewPortScale=yes');
    }else{
      window.open($scope.map.MapUrl);
    }
  }


  }]);

/*myApp.controller('IndividualMapController1',['$timeout', '$scope',function($timeout,$scope){
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