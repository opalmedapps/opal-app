var app=angular.module('adminPanelApp');
app.controller('GeneralPatientController',['$scope', '$timeout','Patient','$rootScope','URLs',function($scope, $timeout,Patient, $rootScope,URLs){

  $scope.patientGeneral=Patient.getPatient();
    console.log($scope.patientGeneral);
  $scope.patientImage=URLs.getBasicUrl()+$scope.patientGeneral.ProfileImage;
Patient.getPatientDiagnosisFromServer().then(function(data){
  Patient.setDiagnosis(data.data);
  $timeout(function(){
      $scope.diagnosis=Patient.getDiagnosis();
      console.log($scope.diagnosis);
  });

});
if(typeof Patient.getPatientAppointments()!='undefined')
{
  var apps=Patient.getPatientAppointments();
  if(apps.length>0){
    $timeout(function(){
      var nextAppointment=Patient.getNextAppointment();
      if(nextAppointment==-1){
        $scope.shownAppointmentMessage='Last Appointment';
        $scope.shownAppointment=Patient.getLastAppointment();
      }else{
        $scope.shownAppointmentMessage='Last Appointment';
        $scope.shownAppointment=nextAppointment;
      }
    });
  }else{
    $scope.noNextAppointment=true;
  }
}else{
  Patient.getPatientAppointmentsFromServer().then(function(data){
    console.log(data);
    Patient.setPatientAppointments(data.data);
    var apps=Patient.getPatientAppointments();
    if(apps.length>0){
      $timeout(function(){
        var nextAppointment=Patient.getNextAppointment();
        if(nextAppointment==-1){
          $scope.shownAppointmentMessage='Last Appointment';
          $scope.shownAppointment=Patient.getLastAppointment();
        }else{
          $scope.shownAppointmentMessage='Last Appointment';
          $scope.shownAppointment=nextAppointment;
        }
          });
    }else{
      $scope.noNextAppointment=true;
    }
      console.log($scope.shownAppointment);

  });
}




}]);
app.controller('DoctorsPatientController',['$scope', '$timeout','Patient', function($scope, $timeout, Patient){
  Patient.getPatientDoctorsFromServer().then(function(data){
    console.log(data);
    Patient.setPatientDoctors(data.data);
    $timeout(function(){
      $scope.otherdoctors=Patient.OtherDoctors;
      console.log($scope.otherdoctors);
      $scope.oncologists=Patient.Oncologists;
      console.log($scope.oncologists);
      $scope.primary=Patient.Primary;
      console.log($scope.primary);
    })

  })





}]);
app.controller('AppointmentsPatientController',['$scope', '$timeout','Patient', function($scope, $timeout, Patient){
    $timeout(function(){
  Patient.getPatientAppointmentsFromServer().then(function(data){
    console.log(data);
    Patient.setPatientAppointments(data.data);
      $scope.appointments=Patient.getPatientAppointments();
      console.log($scope.appointments);


    });
  });



}]);
app.controller('TreatmentPlanPatientController',['$scope', '$timeout',function($scope, $timeout){}]);
app.controller('RequestsPatientController',['$scope', '$timeout',function($scope, $timeout){}]);
app.controller('MessagesPatientController',['$scope', '$timeout','Patient','Messages','$rootScope','User', function($scope, $timeout, Patient,Messages,$rootScope,User){
init();
function init(){
  $scope.user=User.getUserFirstName() + ' ' + User.getUserLastName();
  Patient.getPatientMessagesFromServer().then(function(){
    var conversations=Messages.getMessages();
    var index=Messages.findPatientConversationIndexBySerNum(Patient.getPatient().PatientSerNum);
    Patient.setPatientMessages(conversations[index]);
    $scope.conversation=Patient.getPatientMessages();
    $scope.indexCoversation=index;
    $scope.messages=$scope.conversation.Messages;
    console.log($scope.messages);
  });

};
$scope.sendMessage=function(index){
	var messageToSend={};
 var messageDate=new Date();
 Messages.sendMessage($scope.newMessage, Patient.getPatient().PatientSerNum, messageDate);
 $scope.newMessage='';

};



}]);
app.controller('DocumentsPatientController',['$scope', '$timeout','Patient',function($scope, $timeout, Patient){
  Patient.getDocumentsFromServer().then(function(data){
    Patient.setDocuments(data.data);
    $scope.documents=Patient.getDocuments();
    console.log($scope.documents);
  });


}]);
