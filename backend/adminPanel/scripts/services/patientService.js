var app=angular.module('adminPanelApp');

app.service('Patient',function(URLs,$http,$q, AllPatients,Messages,$filter,api){
   function getPatientFieldFromServer(url, objectToSend){
     var r=$q.defer();
     var req = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': undefined
      },
      data: objectToSend
     }

     $http(req).then(function(data){
         r.resolve(data);

     }, function(error){
       r.reject(error);

     });
     return r.promise;
   };

   return{
     getPatientUserFromServer:function()
     {
       var r=$q.defer();
       r.resolve(getPatientFieldFromServer(URLs.getPatientUserUrl(), {PatientSerNum:this.Patient.PatientSerNum}));
       return r.promise;
     },
     setPatientUser:function(patientUser)
     {
       this.PatientUser=patientUser;
     },
     getPatientUser:function()
     {
       return this.PatientUser;
     },
     setPatient:function(patient){
       this.Patient=patient;
     },
     getPatient:function(){
       return this.Patient;
     },
     setPatientMessages:function(patientConversation){
       console.log(patientConversation);
       this.PatientConversation=patientConversation;
     },
     getPatientMessagesFromServer:function(){
       var r=$q.defer();

       api.getAllPatients().then(function(result){
 				AllPatients.setPatients(result);
 			r.resolve(	Messages.getMessagesFromServer().then(function(messagesFromService){
 				Messages.setMessages(messagesFromService);
      }));
    });
    return r.promise;
     },
     getPatientMessages:function(){
       return this.PatientConversation;
     },
     getPatientAppointmentsFromServer:function(){
       var r =$q.defer();
       r.resolve(getPatientFieldFromServer(URLs.getPatientAppointmentsUrl(), {PatientSerNum:this.Patient.PatientSerNum}));
       return r.promise;
     },
     getPatientAppointments:function(){
       return this.PatientAppointments;
     },
     setPatientAppointments:function(appointments){
       this.PatientAppointments=[];
       if(appointments!=""){
       for (var i = 0; i < appointments.length; i++) {
         appointments[i].ScheduledStartTime=new Date(appointments[i].ScheduledStartTime);
         appointments[i].ScheduledEndTime=new Date(appointments[i].ScheduledEndTime);
       };
      appointments= $filter('orderBy')(appointments,'ScheduledStartTime',true);
      if(appointments[0].ScheduledStartTime>new Date())
      {
        this.nextAppointment=appointments[0];
      }else{
        this.nextAppointment=-1;
        this.lastAppointment=appointments[0];
      }
      this.PatientAppointments=appointments;
     }

     },
     getPatientDoctorsFromServer:function(){
       var r =$q.defer();
       r.resolve(getPatientFieldFromServer(URLs.getPatientDoctorsUrl(), {PatientSerNum:this.Patient.PatientSerNum}));
       return r.promise;
     },
     setPatientDoctors:function(doctors){
       this.Doctors=[];
       this.Oncologists=[];
       this.Primary=[];
       this.OtherDoctors=[]
       for (var i = 0; i < doctors.length; i++) {
         if(doctors[i].OncologistFlag=="1"){
           this.Oncologists.push(doctors[i]);
         }
         if(doctors[i].PrimaryFlag=="1"){
           this.Primary.push(doctors[i]);
         }
         if(doctors[i].PrimaryFlag=="0"&&doctors[i].OncologistFlag=="0"){
           this.OtherDoctors.push(doctors[i]);
         }

       }
     },
     getPatientTreatmentPlanFromServer:function()
     {

     },
     setPatientTreatmentPlan:function(){

     },
     getTreatmentPlan:function(){

     },
     getPatientDiagnosisFromServer:function(){
       var r =$q.defer();
       r.resolve(getPatientFieldFromServer(URLs.getPatientDiagnosisUrl(), {PatientSerNum:this.Patient.PatientSerNum}));
       return r.promise;
     },
     setDiagnosis:function(diagnosis)
     {
       for (var i = 0; i < diagnosis.length; i++) {
         diagnosis[i].CreationDate=new Date(diagnosis[i].CreationDate);

       }
       diagnosis=$filter('orderBy')(diagnosis, 'CreationDate', true);
       this.PatientDiagnosis=diagnosis;
     },
     getDiagnosis:function()
     {
       return this.PatientDiagnosis;
     },
     getNextAppointment:function(){
       return this.nextAppointment;
     },
     getLastAppointment:function(){
       return this.lastAppointment;
     },
     getDocumentsFromServer:function()
     {
       var r =$q.defer();
       r.resolve(api.getFieldFromServer(URLs.getDocumentsUrl(), {PatientSerNum:this.Patient.PatientSerNum}));
       return r.promise;
     },
     setDocuments:function(documents)
     {
       for (var i = 0; i < documents.length; i++) {
         documents[i].DateAdded=new Date(documents[i].DateAdded);
       }
       this.Documents=documents;

     },
     getDocuments:function(){
       return this.Documents;
     }

   };
 });