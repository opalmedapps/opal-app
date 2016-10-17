var app=angular.module('adminPanelApp');

app.service('URLs',function(Credentials){
   var basicURL=Credentials.basicURL;
   var patientDocumentsURL=Credentials.patientDocumentsURL;//'http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Documents';
   var doctorImagesURL=Credentials.doctorImagesURL;//'http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Doctors';
   var patientImagesURL=Credentials.patientImagesURL;//'http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Patients';
   var basicURLPHP=Credentials.basicURL+'php/';
   return{
     getBasicURLPHP:function(){
       return basicURLPHP;
     },
     getBasicUrl:function(){
       return basicURL;
     },
     getSendMessageUrl:function(){
       return basicURLPHP+'SendMessage.php';
     },
     getMessagesUrl:function(){
       return basicURLPHP+'GetMessages.php';
     },
     getPatientMessagesUrl:function(){
       return basicURLPHP+'GetPatientMessages.php';
     },
     getPatientDoctorsUrl:function(){
       return basicURLPHP+'GetDoctors.php';
     },
     getPatientAppointmentsUrl:function(){
       return basicURLPHP+'GetAppointments.php';
     },
     getPatientDiagnosisUrl:function(){
       return basicURLPHP+'GetPatientDiagnosis.php';
     },
     getCountOfPatientsUrl:function(){
       return basicURLPHP+'CountPatients.php';
     },
     getUpdateFieldUrl:function(){
       return basicURLPHP+'updateField.php';
     },
     getDocumentsUrl:function(){
       return basicURLPHP+'ObtainUserDocuments.php';
     },
     getUserUrl:function()
     {
       return basicURLPHP+'getUser.php';
     },
     getPatientUserUrl:function()
     {
       return basicURLPHP+'getPatientUser.php';
     },
     getPatientDocumentsUrl:function()
     {
       return patientDocumentsURL;
     },
     getDoctorImagesUrl:function()
     {
       return doctorImagesURL;
     },
     getPatientImageUrl:function()
     {
       return patientImagesURL;
     },
     getUserAuthenticationUrl:function()
     {
       return basicURLPHP+'Authenticate.php';
     },
     getValidatePasswordUrl:function()
     {
      return basicURLPHP+'validatePassword.php';
     },
     getUserInformation:function()
     {
      return basicURLPHP+'getUserFields.php';
     },
     getDoctorImageUrl:function()
     {
      return '/home/VarianFILEDATA/Doctors/';
     },
     readMessageUrl:function()
     {
      return basicURLPHP+'readMessage.php';
     },
     getPatientActivityUrl:function()
     {
      return basicURLPHP+'patientActivity/getPatientActivityLog.php';
     },
     getPatientSessionActivityUrl:function()
     {
      return basicURLPHP+'patientActivity/getPatientSessionActivity.php';
     },
     getInsertMapUrl:function()
     {
      return basicURLPHP+'hospital-maps/insertMap.php';
     },
     getUrlFeedback:function()
      {
        return basicURLPHP+'feedback/getFeedback.php';
      },
    getUrlEducationalMaterialFeedback:function()
      {
        return basicURLPHP+'feedback/getEducationalMaterialFeedback.php';
      },
      getUrlEducationalMaterialRating:function()
      {
        return basicURLPHP+'feedback/getIndividualEducationalMaterialRating.php';
      }


   };



 });
