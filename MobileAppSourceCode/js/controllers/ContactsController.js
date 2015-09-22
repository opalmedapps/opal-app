/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires $scope
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
myApp.controller('ContactsController',['$scope','Doctors',function($scope,Doctors){   
    $scope.oncologists=Doctors.getOncologists();
    $scope.primaryPhysician=Doctors.getPrimaryPhysician();
    $scope.otherDoctors=Doctors.getOtherDoctors();
    console.log($scope.otherDoctors);
    $scope.goDoctorContact=function(doctor){
        if(doctor===undefined){
            myNavigatorContacts.pushPage('page2.html', {param:$scope.primaryPhysician},{ animation : 'slide' } );
        }else{
            myNavigatorContacts.pushPage('page2.html', {param:doctor},{ animation : 'slide' } );
        }   
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
myApp.controller('ContactIndividualDoctorController',['$scope',function($scope){
 
 var page = myNavigatorContacts.getCurrentPage();
 $scope.doctor=page.options.param;
 if($scope.doctor.PrimaryFlag===1){
    $scope.header='Primary Physician';
 }else if($scope.doctor.OncologistFlag===1){
     $scope.header='Oncologist';
 }else{
    $scope.header='Doctor';
 }

}]);
