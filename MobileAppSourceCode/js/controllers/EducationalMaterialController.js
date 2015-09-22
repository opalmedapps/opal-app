var myApp=angular.module('MUHCApp');
myApp.controller('EducationalMaterialController',function($scope, $timeout, $cordovaFileOpener2,$cordovaDevice,$cordovaDatePicker){

$scope.openPDF=function(){
	var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
	//file:///data/data/com.example.hello/files/pdfs
	var ref = window.open('./pdfs/radiotherapy_journey.pdf', '_blank', 'location=yes');
}
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
