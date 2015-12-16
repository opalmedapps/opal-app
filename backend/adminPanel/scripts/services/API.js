var app=angular.module('adminPanelApp');

app.service('api',function ($rootScope, $http,$q,URLs) {
  return{

    getAllPatients:function(){
//First Name, Last Name, patient Id, ram q on patient id card.
//Patients per schedule date.
//Patients today, then Currently being treated.
//


    	var r=$q.defer();
    	var userDoctor=$rootScope.currentUser.DoctorSerNum;
    	var userAdmin=$rootScope.currentUser.AdminSerNum;
    	var patientsURL='';
      if(userDoctor){
       	patientsURL=URLs.getBasicURLPHP()+"getAllPatients.php?DoctorSerNum="+userDoctor;
       }else if(userAdmin){
       	 patientsURL=URLs.getBasicURLPHP()+"getAllPatients.php?AdminSerNum="+userAdmin;
       	console.log(patientsURL);
       }
      $http.get(patientsURL).success( function (response){
        if(typeof response[0].LastName!== 'undefined'){
   			console.log(response);
          r.resolve(response);

        }else if(response='No users!!'){
          r.reject({message:'Doctor has no patients using the app!',
            type:'alert-warning'});

        }else{
        	console.log('error');
        	r.reject('error');
        }
      });
      return r.promise;
    }
  ,getFieldFromServer:function (url, objectToSend){
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
        console.log(data);
        r.resolve(data.data);

    }, function(error){
      r.reject(error);

    });
    return r.promise;
  }
}
});
app.service('AllPatients',function(api,$q,URLs){
  return{
    setPatients:function(patients)
    {
      this.Patients=patients;
    },
    getPatients:function()
    {
      return this.Patients;

    },
    findPatient:function(serNum){
      if(this.Patients!='No Users!'){

        for (key in this.Patients){

          if(this.Patients[key].PatientSerNum==serNum)
          {
            return this.Patients[key];
          }else{
            return 'No Users!'
          }
        };
      }else{
        return 'No Users!';
      }

    }
  };

});


app.service('User',function(URLs, $q,api,$http,$rootScope){
  return{
    getNumberOfPatientsForUserFromServer:function(){
      var r=$q.defer();

      if(this.UserRole=='Doctor')
      {
        console.log(this.UserRole);
        var DoctorSerNum=this.UserTypeSerNum;
        r.resolve( api.getFieldFromServer(URLs.getCountOfPatientsUrl(), {'DoctorSerNum':DoctorSerNum}));
      }else{
        r.resolve(api.getFieldFromServer(URLs.getCountOfPatientsUrl(), {'AdminSerNum':this.UserTypeSerNum}));
      }
      return r.promise;

    },
    setCredentials:function(username,password)
    {
      this.Password=password;
      this.Username=username;
    },
    setNumberOfDoctorPatients:function(data)
    {
      this.NumberOfDoctorPatients=data;
    },
    getNumberOfDoctorPatients:function()
    {
      return this.NumberOfDoctorPatients;
    },
    setUserRole:function(role){
      this.UserRole=role;
    },
    getUserRole:function(){
      return this.UserRole;
    },
    setUserTypeSerNum:function(serNum){
      this.UserTypeSerNum=serNum;
    },
    getUserTypeSerNum:function()
    {
      return this.UserTypeSerNum;
    },
    setUserEmail:function(email)
    {
      this.AccountObject.Email=email;
      this.UserFields.Email=email;
      this.Email=email;
    },
    setUserFirstName:function(username)
    {
      this.AccountObject.FirstName=username;
      this.UserFields.FirstName=username;
      this.FirstName=username;
    },
    getUserFirstName:function(){
      return this.FirstName;
    },
    setUserLastName:function(lastname){
      this.AccountObject.LastName=lastname;
      this.UserFields.LastName=lastname;
      this.LastName=lastname;
    },
    setUserTelNum:function(telNum)
    {
      this.AccountObject.Phone=telNum;
      this.UserFields.Phone=telNum;
      this.Phone=telNum;
    },
    setUserImage:function(image)
    {
      this.Image=URLs.getBasicUrl()+image;
      this.UserFields.Image=URLs.getBasicUrl()+image;
      this.AccountObject.Image=URLs.getBasicUrl()+image;
    },
    updateUserField:function(field, newValue)
    {
      if(field=='Image')
      {
        this['Image']=URLs.getBasicUrl()+newValue;
        this.UserFields.Image=URLs.getBasicUrl()+newValue;
        this.AccountObject.Image=URLs.getBasicUrl()+newValue;
      }else if(field=='Username')
      {
        this[field]=newValue;
        this.UserFields[field]=newValue;
        this.AccountObject[field].Value=newValue;
        $rootScope.currentUser.Username=newValue;
      }else if(field=='Password')
      {
        this[field]=newValue;
        this.UserFields[field]=newValue;
        this.AccountPassword.Value=newValue;
      }else{
        console.log(field);
        this[field]=newValue;
        this.UserFields[field]=newValue;
        this.AccountObject[field].Value=newValue;
      }


    },
    getUserLastName:function(){
      return this.LastName;
    },
    getUserFromServer:function()
    {
      var r=$q.defer();

      r.resolve( api.getFieldFromServer(URLs.getUserUrl(), {'Username':this.Username}));

      return r.promise;
    },
    setUserSerNum:function(userSerNum)
    {
      console.log(userSerNum['UserSerNum']);
      this.UserSerNum=userSerNum['UserSerNum'];
    },
    setUserFields:function(fields,username,password){

      this.UserFields={};
      this.FirstName=fields.FirstName;
      this.LastName=fields.LastName;
      this.Email=fields.Email;
      this.Password=password
      this.Username=username
      var serNum;
      if(fields.DoctorSerNum){
        serNum=fields.DoctorSerNum;
        this.UserTypeSerNum=fields.DoctorSerNum;
        this.DoctorAriaSer=fields.DoctorAriaSer;
        this.UserRole='Doctor';
        this.UserFields.UserRole='Doctor';
        this.UserFields.UserTypeSerNum=fields.DoctorSerNum;
        this.Image=fields.Image;
      }else{
        serNum=fields.AdminSerNum;
        this.UserTypeSerNum=fields.AdminSerNum;
        this.UserFields.UserTypeSerNum=fields.AdminSerNum;
        this.UserRole='Admin';
        this.UserFields.UserRole='Admin';
        this.Image='Admin image to be added';
      }
      this.Phone=fields.Phone;
      this.UserFields={
        UserTypeSerNum:serNum,
        Password:password,
        FirstName:fields.FirstName,
        LastName:fields.LastName,
        Email:fields.Email,
        DoctorAriaSer:fields.DoctorAriaSer,
        Image:fields.Image,
        Phone:fields.Phone,
        Username:username
      };
      var arrayKeys=Object.keys(this.UserFields);
      this.AccountObject={};
      for (var i = 0; i < arrayKeys.length; i++) {
        if(arrayKeys[i]!='UserTypeSerNum'&&arrayKeys[i]!='Password'&&arrayKeys[i]!='DoctorAriaSer'){
          console.log(arrayKeys[i]);
          if(arrayKeys[i]!='Image'){
            this.AccountObject[arrayKeys[i]]=
            {
              'Value':this.UserFields[arrayKeys[i]],
              'Edit':false,
              'newValue':this.UserFields[arrayKeys[i]]
            }
          }else{
            this.AccountObject[arrayKeys[i]]=
            {
              'Value':URLs.getBasicUrl()+this.UserFields[arrayKeys[i]],
              'Edit':false,
              'newValue':this.UserFields[arrayKeys[i]]
            }
          }

        }else if(arrayKeys[i]=='Password')
        {
          this.AccountPassword=
          {
            'Value':this.UserFields[arrayKeys[i]],
            'Edit':false,
            'newValue':''
          }
        }

      }

    },
    getAccountFields:function(){
      return this.AccountObject;
    },
    getUsername:function(){
      return this.Username;
    },
    getUserFields:function()
    {
      return this.UserFields;
    },
    getUserPassword:function(){
      return this.AccountPassword;
    },
    updateFieldInServer:function(field,newValue)
    {
      var r=$q.defer();
      objectToSend={};
      objectToSend.field=field;
      objectToSend.newValue=newValue;
      if(field=='Password'||field=='Username')
      {
        objectToSend.UserSerNum=this.UserSerNum;
      }else if(this.UserRole=='Doctor'){
        objectToSend.DoctorSerNum=this.UserTypeSerNum;
      }else{
        objectToSend.AdminSerNum=this.UserTypeSerNum;
      }
      var url=URLs.getUpdateFieldUrl();
      var req = {
       method: 'POST',
       url: url,
       headers: {
         'Content-Type': undefined
       },
       data: objectToSend
      }
      $http(req).then(function(data){
        console.log(data.data);
          r.resolve(data);

      }, function(error){
        r.reject(error);

      });
      return r.promise;


    }
  };
});
 app.service('Messages',function($http, $q, $rootScope,$filter,AllPatients, User,URLs){
   function findPatientConversationIndexBySerNum(array,serNum){
      for (var i = 0; i < array.length; i++) {
        if(array[i].PatientSerNum==serNum){
          return i;
        }
      }
    }
 	return{
 		getMessagesFromServer:function(){
 			var r=$q.defer();
 			var userDoctor=$rootScope.currentUser.DoctorSerNum;
    		var userAdmin=$rootScope.currentUser.AdminSerNum;
    		patientsURL='';
    		if(userDoctor){
		       	patientsURL=URLs.getMessagesUrl()+"?DoctorSerNum="+userDoctor;
            console.log(patientsURL);
		    }else if(userAdmin){
		       	patientsURL=URLs.getMessagesUrl()+"?AdminSerNum="+userAdmin;
		       	console.log(patientsURL);
		    }
	 		$http.get(patientsURL).success(function(response)
	      	{
	        if (response == 'No Users!')
	        {
            console.log(response);
            r.resolve('No Messages Found');

	         }else if(response=='No parameters set!'){
            console.log(response);
            r.reject('Incorrect Parameters');
	         }else{
            r.resolve(response);
           }
	      });
      return r.promise;
    },
    findPatientConversationIndexBySerNum:  function (serNum){
       for (var i = 0; i < this.UserConversationsArray.length; i++) {
         if(this.UserConversationsArray[i].PatientSerNum==serNum){
           return i;
         }
       }
     },
    setMessages:function (messages){
      console.log(messages);
        var userDoctor=$rootScope.currentUser.DoctorSerNum;
        var userAdmin=$rootScope.currentUser.AdminSerNum;
        var UserTypeSerNum;
        var userRole;
        if(userDoctor){
          UserTypeSerNum=userDoctor;
          userRole='Doctor';
         }else if(userAdmin){
          UserTypeSerNum=userAdmin;
          userRole='Admin';
         }

        this.UserConversationsArray = [];
         $rootScope.NumberOfNewMessages=0;
         if (messages === undefined) return -1;
        //Iterating through each conversation
        this.ConversationsObject={};
        var keysArray = Object.keys(messages);
        var patients=AllPatients.getPatients();
        console.log(patients);
        for (var i = 0; i < patients.length; i++) {
            var conversation={}
            var partnerSerNum=patients[i].PatientSerNum;
            var key='Patient:'+partnerSerNum;
            console.log(key);
            console.log(patients[i]);
            conversation.PatientSerNum=partnerSerNum;
            conversation.ConversationPartnerFirstName=patients[i].FirstName;
            conversation.ConversationPartnerLastName=patients[i].LastName;
            conversation.Messages=[];
            conversation.DateOfLastMessage=null;
            conversation.EmptyConversation=true;
            conversation.ReadStatus=1;
            conversation.Role='Patient';
            conversation.PatientId=patients[i].PatientId;
            conversation.AriaSer=patients[i].PatientAriaSer;
            this.ConversationsObject[key]=conversation;
        };
        console.log(this.ConversationsObject);
        console.log(messages);
        if(messages!=='No Messages Found'){
          for (var i = 0; i < keysArray.length; i++) {
              var Message={};
              var message=messages[keysArray[i]];
              if(messages[i].ReceiverRole==userRole&&messages[i].ReceiverSerNum==UserTypeSerNum)
              {
                partnerSerNum=message.SenderSerNum;
                key=message.SenderRole+':'+message.SenderSerNum;
                Message.Role=0;
                Message.MessageContent=message.MessageContent;
                Message.Date=new Date(message.MessageDate);
                Message.ReadStatus=parseInt(message.ReceiverReadStatus);
                Message.MessageSerNum=message.MessageSerNum;
                this.ConversationsObject[key].EmptyConversation=false;
                this.ConversationsObject[key].Messages.push(Message);

              }else{
                partnerSerNum=message.ReceiverSerNum;
                key=message.ReceiverRole+':'+message.ReceiverSerNum;
                Message.Role=1;
                Message.MessageContent=message.MessageContent;
                Message.Date=new Date(message.MessageDate);
                Message.ReadStatus=1;
                Message.MessageSerNum=message.MessageSerNum;
                this.ConversationsObject[key].EmptyConversation=false;
                this.ConversationsObject[key].Messages.push(Message);
              }
          }
          var keysArrayConvo = Object.keys(this.ConversationsObject);
          for (var i = 0; i < keysArrayConvo.length; i++) {
              this.ConversationsObject[keysArrayConvo[i]].Messages=$filter('orderBy')(this.ConversationsObject[keysArrayConvo[i]].Messages,'Date',false);

              if(this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1]!==undefined){
                  this.ConversationsObject[keysArrayConvo[i]].DateOfLastMessage=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].Date;
                  this.ConversationsObject[keysArrayConvo[i]].ReadStatus=this.ConversationsObject[keysArrayConvo[i]].Messages[this.ConversationsObject[keysArrayConvo[i]].Messages.length-1].ReadStatus;
                  if(this.ConversationsObject[keysArrayConvo[i]].ReadStatus===0){
                      $rootScope.NumberOfNewMessages+=1;
                  }
              }
              this.UserConversationsArray.push(this.ConversationsObject[keysArrayConvo[i]]);


          };
          console.log(this.UserConversationsArray);
        }else{
          var objectKeys=Object.keys(this.ConversationsObject);
          for (var i = 0; i < objectKeys.length; i++) {
            this.UserConversationsArray.push(this.ConversationsObject[objectKeys[i]]);
          }
        }


        return this.UserConversationsArray;


    },
    getMessages:function(){
        return this.UserConversationsArray;
    },
    sendMessage:function(content, patientSerNum, dateOfmessage){
      var r=$q.defer();
      var objectToSend={};
      objectToSend.MessageContent=content;
      objectToSend.MessageDate=$filter('date')(dateOfmessage,'yyyy-MM-dd HH:mm:ss');;
      objectToSend.ReceiverReadStatus=0;
      objectToSend.SenderRole=User.getUserRole();
      objectToSend.SenderSerNum=User.getUserTypeSerNum();
      objectToSend.ReceiverRole='Patient';
      objectToSend.ReceiverSerNum=patientSerNum;
      objectMessage={};
      objectMessage.Role='1';
      objectMessage.Date=dateOfmessage;
      objectMessage.MessageContent=content;
      objectMessage.ReadStatus=1;

      var indexConvo=findPatientConversationIndexBySerNum(this.UserConversationsArray , patientSerNum);
      this.UserConversationsArray[indexConvo].Messages.push(objectMessage);
      var req = {
       method: 'POST',
       url: URLs.getSendMessageUrl(),
       headers: {
         'Content-Type': undefined
       },
       data: objectToSend
      }

      $http(req).then(function(data){
        if(data=='MessageSent'){
          console.log(data);
        }

      }, function(error){
        console.log(error);
      });
    }

};


 });
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

 app.service('URLs',function(){
   var basicURL='http://172.26.66.41/devDocuments/david/muhc/qplus/';
   var patientDocumentsURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Documents';
   var doctorImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Doctors';
   var patientImagesURL='http://172.26.66.41/devDocuments/david/muhc/qplus/listener/Patients';
   var basicURLPHP=basicURL+'php/'

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
     }

   };



 });
