/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactsController',['$scope','Doctors','$timeout','UpdateUI', 'RequestToServer', function($scope,Doctors,$timeout,UpdateUI,RequestToServer){
    doctorsInit();
    function doctorsInit(){
      $scope.oncologists=Doctors.getOncologists();
      $scope.primaryPhysician=Doctors.getPrimaryPhysician();
      $scope.otherDoctors=Doctors.getOtherDoctors();
    }
    console.log($scope.oncologists);
    $scope.load = function($done) {
      RequestToServer.sendRequest('Refresh','Doctors');
      $timeout(function() {
        loadInfo();
        $done();
      }, 3000);
    };

    function loadInfo(){
       var dataVal= UpdateUI.UpdateSection('Doctors').
       then(function(){
            doctorsInit();
       });
   }
    $scope.goDoctorContact=function(doctor){
        myNavigator.pushPage('templates/contacts/individual-contact.html', {param:{doctor:doctor,flagInConversation:0}},{ animation : 'slide' } );
    };
}]);
/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactIndividualDoctorController',['$scope','$q',function($scope,$q){

  var page = myNavigator.getCurrentPage();
  var parameters=page.options.param;
  if(parameters.flagInConversation==1){
     $scope.showMessageInApp=false;
  }else{
     $scope.showMessageInApp=true;
  }
  $scope.doctor=parameters.doctor;
  if($scope.doctor.PrimaryFlag===1){
     $scope.header='Primary Physician';
  }else if($scope.doctor.OncologistFlag===1){
      $scope.header='Oncologist';
  }else{
     $scope.header='Doctor';
  }

 $scope.goToConversation=function(doctor){
    param=doctor;
    function goToMessage(){
        var r=$q.defer();
        myNavigator.popPage({animation:'none'});
        r.resolve(true);
        return r.promise;
    }
    goToMessage().then(function(){
        menu.setMainPage('views/patientPortal.html',{param: doctor},{closedMenu:true});
    });
 };

}]);
