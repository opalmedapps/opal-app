/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactsController',['$scope','Doctors','$timeout','UpdateUI', 'RequestToServer', 'NavigatorParameters', function($scope,Doctors,$timeout,UpdateUI,RequestToServer,NavigatorParameters){
    doctorsInit();
    function doctorsInit(){
      $scope.noContacts = !Doctors.isThereDoctors();
      console.log($scope.noContacts);
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
       var dataVal= UpdateUI.update('Doctors').
       then(function(){
            doctorsInit();
       });
   }
    $scope.goDoctorContact=function(doctor){
      
      NavigatorParameters.setParameters({Navigator:'generalNavigator',Data:doctor});
        generalNavigator.pushPage('views/general/contacts/individual-contact.html', {param:doctor},{ animation : 'slide' } );
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
myApp.controller('ContactIndividualDoctorController',['$scope','$q','NavigatorParameters', function($scope,$q,NavigatorParameters){
  
  var params = NavigatorParameters.getParameters();
  $scope.doctor = params.Data;
  $scope.inContacts = (params.Navigator == 'generalNavigator')?true:false;
  /*if(typeof personalNavigator!=='undefined'&&typeof personalNavigator.getCurrentPage()!=='undefined'&&typeof personalNavigator.getCurrentPage().options.param!=='undefined')
  {
    var page = personalNavigator.getCurrentPage();
    var parameters=page.options.param;
    delete page.options.param;
    delete page.options.param;
    $scope.inContacts=false;
    $scope.doctor=parameters;
  }else if(typeof generalNavigator!=='undefined'&&typeof generalNavigator.getCurrentPage()!=='undefined'&typeof generalNavigator.getCurrentPage().options.param!=='undefined')
  {
    var page = generalNavigator.getCurrentPage();
    var parameters=page.options.param;
    delete page.options.param;
    delete page.options.param;
    console.log(parameters);
    $scope.doctor=parameters;
    $scope.inContacts=true;
  }*/
  if($scope.doctor.PrimaryFlag===1){
     $scope.header='Primary Physician';
  }else if($scope.doctor.OncologistFlag===1){
      $scope.header='Oncologist';
  }else{
     $scope.header='Doctor';
  }
}]);
