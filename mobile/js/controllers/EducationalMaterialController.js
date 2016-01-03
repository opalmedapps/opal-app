var myApp=angular.module('MUHCApp');
myApp.controller('EducationalMaterialController',function($scope, $timeout, $cordovaFileOpener2,$cordovaDevice,$cordovaDatePicker){

$scope.openPDF=function(){

	//file:///data/data/com.example.hello/files/pdfs
	var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	if(app){
		if(ons.platform.isAndroid()){
			var ref=window.open('https://www.depdocs.com/opal/www/pdfs/radiotherapy_journey.pdf','_system','location=no');
		}else{
			var ref = cordova.InAppBrowser.open('./pdfs/radiotherapy_journey.pdf', '_blank', 'location=yes');
		}
	}else{
		var ref = window.open('./pdfs/radiotherapy_journey.pdf', '_blank', 'location=yes');
	}

};

$scope.openVideo=function(){
	var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	if(app){
	  var ref = cordova.InAppBrowser.open('https://www.youtube.com/watch?v=2dPfuxb1H8E', '_blank', 'location=yes');
	}else{
	  var ref = window.open('https://www.youtube.com/watch?v=2dPfuxb1H8E', '_blank', 'location=yes');
	}
};
/*var options = {
    date: new Date(),
    mode: 'date', // or 'time'
    minDate: new Date() - 10000,
    allowOldDates: true,
    allowFutureDates: false,
    doneButtonLabel: 'DONE',
    doneButtonColor: '#F2F3F4',
    cancelButtonLabel: 'CANCEL',
    cancelButtonColor: '#000000'
  };

  document.addEventListener("deviceready", function () {

    $cordovaDatePicker.show(options).then(function(date){
        alert(date);
    });

  }, false);*/

});
