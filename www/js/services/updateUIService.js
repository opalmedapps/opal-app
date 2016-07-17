var myApp=angular.module('MUHCApp');


myApp.service('UpdateUI', ['Announcements','TxTeamMessages','EncryptionService','$timeout', '$rootScope','Patient','Doctors','Appointments','Messages','Documents','EducationalMaterial','UserPreferences', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', 'LocalStorage','RequestToServer','$filter','Diagnoses','FirebaseService','MapLocation','Questionnaires',
'NativeNotification',function (Announcements, TxTeamMessages, EncryptionService,$timeout, $rootScope, Patient,Doctors, Appointments,Messages, Documents, EducationalMaterial, UserPreferences, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork,LocalStorage,RequestToServer,$filter,Diagnoses,FirebaseService,MapLocation,Questionnaires, NativeNotification ) {
  var sectionServiceMappings={
    'All':
      {
        init:setAllServices,
        update:updateAllServices
      },
    'Documents':
    {
      init:Documents.setDocumentsOnline,
      update:Documents.updateDocuments,
      setOffline:Documents.setDocumentsOffline
    },
    'Patient':{
      init:Patient.setUserFieldsOnline,
      update:Patient.setUserFieldsOnline,
      setOffline:Patient.setUserFieldsOffline
    },
    'Doctors':{
      init:Doctors.setUserContactsOnline,
      update:Doctors.updateUserContacts,
      setOffline:Doctors.setUserContactsOffline
    },
    'Appointments':{
      init:Appointments.setUserAppointments,
      update:Appointments.updateUserAppointments
    },
    /*'Messages':
    {
      init:Messages.setUserMessages,
      update:Messages.updateUserMessages
    },
    /*'LabTests': {
      init:LabResults.setTestResults,
      update:LabResults.updateTestResults
    },*/
    'MapLocation':
    {
      update:MapLocation.updateMapLocation,
      live:true
    },
    'Checkin':
    {
      live:true
    },
    'CheckinUpdate':
    {
      live:true
    },
    'CheckCheckin':
    {
      live:true
    },
    'Diagnosis':
    {
      init:Diagnoses.setDiagnoses,
      update:Diagnoses.updateDiagnoses
    },
    'TxTeamMessages':
    {
      init:TxTeamMessages.setTxTeamMessages,
      update:TxTeamMessages.updateTxTeamMessages
    },
    'Questionnaires':
     { 
       init:Questionnaires.setPatientQuestionnaires,
       update:Questionnaires.updatePatientQuestionnaires
     },
    'Announcements':
    {
      init:Announcements.setAnnouncements,
      update:Announcements.updateAnnouncements
    },
    'EducationalMaterial':
    {
      init:EducationalMaterial.setEducationalMaterial,
      update:EducationalMaterial.updateEducationalMaterial
    },
    'Notifications':
    {
      init:Notifications.setUserNotifications,
      update:Notifications.updateUserNotifications
    }
  };
  function initLocalStorage()
  {
    var objectToLocalStorage={};
    for (var key in sectionServiceMappings.length) {
      objectToLocalStorage[key]=[{}];
    }
    LocalStorage.WriteToLocalStorage('All',objectToLocalStorage);
  }
    function setAllServices(dataUserObject,mode)
    {

      console.log(mode);
      var promises=[];
      console.log(dataUserObject);
      if(mode=='Online')
      {
        console.log('boom');
        initLocalStorage();
        console.log('I am in there');
        var documents=dataUserObject.Documents;
        var documentProm=Documents.setDocumentsOnline(documents);
        var doctors=dataUserObject.Doctors;
        var doctorProm=Doctors.setUserContactsOnline(doctors);
        var patientFields=dataUserObject.Patient;
        var patientProm=Patient.setUserFieldsOnline(patientFields);
        console.log(patientProm);
        promises=[doctorProm,documentProm,patientProm];
      }else{
        $rootScope.statusRoot="Mode offline";
        var documentProm=Documents.setDocumentsOffline(dataUserObject.Documents);
        var doctorProm=Doctors.setUserContactsOffline(dataUserObject.Doctors);
        var patientProm=Patient.setUserFieldsOffline(dataUserObject.Patient);
        promises=[documentProm,doctorProm,patientProm];
      }
      $q.all(promises).then(function(){
        
        UserPlanWorkflow.setTreatmentPlan(dataUserObject.Tasks, dataUserObject.Appointments);
        var plan={
            '1':{'Name':'CT for Radiotherapy Planning','Date':'2015-10-19T09:00:00Z','Description':' CT simulation includes a CT scan of the area of your body to be treated with radiation. The CT images acquired during your scan will be reconstructed and used to design the best and most precise treatment plan for you.','Type': 'Appointment'},
            '2':{'Name':'Physician Plan Preparation','Date':'2015-10-21T09:15:00Z','Description':'During this stage countoring of area is performed by Medical Physicist and approved by physician','Type':'Task'},
            '3':{'Name':'Calculation of Dose & Physician Review','Date':'2015-10-23T09:15:00Z','Description':'The dose is calculated the physician reviews and approves the treatment plan.','Type':'Task'},
            '4':{'Name':'Physics Quality Control','Date':'2015-10-28T10:15:00Z','Description':'In the QA stage, the physicians plan is compared to previous plans performed for similar patients to make sure everything is normal and the plan fits the standards','Type':'Task'},
            '5':{'Name':'Scheduling','Date':'2015-10-30T09:15:00Z','Description':'At this stage, the scheduling of the treatment appointments is done.','Type':'Task'},
            '6':{'Name':'First Treatment','Date':'2015-11-02T09:15:00Z','Description':'First treatment for radiation','Type':'Task'}
        };
        var newDate=new Date();
        var valAdded=-6;

        for (var key in plan) {
          var tmp=new Date(newDate);
          tmp.setDate(tmp.getDate()+valAdded);
          valAdded+=2;
          plan[key].Date=$filter('formatDateToFirebaseString')(tmp);
        }
          Questionnaires.setPatientQuestionnaires(dataUserObject.Questionnaires);
          EducationalMaterial.setEducationalMaterial(dataUserObject.EducationalMaterial);
          TxTeamMessages.setTxTeamMessages(dataUserObject.TxTeamMessages);
          Announcements.setAnnouncements(dataUserObject.Announcements);
          Diagnoses.setDiagnoses(dataUserObject.Diagnosis);
          /*LabResults.setTestResults(dataUserObject.LabTests);
          Messages.setUserMessages(dataUserObject.Messages);*/
          UserPlanWorkflow.setUserPlanWorkflow(plan);
          //UserPreferences.setUserPreferences(dataUserObject.Patient[0].Language,dataUserObject.Patient[0].EnableSMS);
          UserPreferences.getFontSize();
          Appointments.setUserAppointments(dataUserObject.Appointments);
          Notifications.setUserNotifications(dataUserObject.Notifications);
          console.log(dataUserObject);
        /*if(mode=='Online')
          {
            LocalStorage.WriteToLocalStorage('All',dataUserObject);
          }*/

      });
    }
    function updateAllServices(dataUserObject){
        var promises=[];
        console.log(dataUserObject);
        for(var key in dataUserObject)
        {
          if(sectionServiceMappings.hasOwnProperty(key))
          {
            sectionServiceMappings[key].update(dataUserObject[key]);
          }
        }
    }


    function updateSection(sections, parameters)
    {

      //Start promise
      var r=$q.defer();
      //Firebase url
      var ref= new Firebase(FirebaseService.getFirebaseUrl()+'Users/');
      var pathToSection='';
      var username=UserAuthorizationInfo.getUserName();
      var deviceId=RequestToServer.getIdentifier();
      //Set path to read data
      if(sections=='All')
      {
        pathToSection=username+'/'+deviceId+'/All';
      }else if(sections=='ArrayFields'){
        pathToSection=username+'/'+deviceId+'/ArrayFields';
      }else{
        pathToSection=username+'/'+deviceId+'/Field/'+sections;
        /*if(sections!=='UserPreferences'){

        }else{
           pathToSection=username+'/'+deviceId+'/'+'Patient';
        }*/
      }
      //Connection to Firebase
      ref.child(pathToSection).on('value',function(snapshot){
          var data=snapshot.val();
          //Only if data is defined as firebase also calls value first time when data is undefined
          if(data&&typeof data!=='undefined'){
              //Decrypts incoming data
              var time=(new Date()).getTime();
              data=EncryptionService.decryptData(data);
              console.log(sections, data);
              if(data.Response=='No Results')
              {
                console.log('Deleting response');
                //ref.child(pathToSection).set(null);
                ref.child(pathToSection).off();
                r.resolve('No new results');
              }
              //To update all, searches into the appropiate table mappings and update appropiate sections
              else if(sections=='All')
              {
                RequestToServer.updateTimestamps('All',time);
                sectionServiceMappings[sections]['update'](data,'Online');
                //updateAllServices(data, 'Online');
              }else if(sections=='ArrayFields'){
                RequestToServer.updateTimestamps(parameters,time);


                //Updates an array of fields, e.g. ['Messages','Documents'];
                for (var i = 0; i < paramaters.length; i++) {
                  sectionServiceMappings[paramaters[i]]['update'](data[paramaters[i]],'Online');
                }
              }else{
                  if(!sectionServiceMappings[sections].hasOwnProperty('live'))
                  {
                      RequestToServer.updateTimestamps(sections,time);
                  }
                  if(sectionServiceMappings[sections].hasOwnProperty('update'))
                  {
                      sectionServiceMappings[sections]['update'](data);
                  }
                }
              //Delete the data now that it has been proccessed, and dettaches the firebase ref.
              console.log(pathToSection);
              ref.child(pathToSection).set(null,function(as){
                console.log(as);
              });
              ref.child(pathToSection).off();
              //Resolve our promise to finish the loading and get the application going.
              console.log('About to return',sections, data);
              r.resolve(data);
          }
      },function(error){
        console.log(error);
        r.reject(error);
      });
      return r.promise;
    }

    //Initiatiates all the services online at either login, or simple entering the app once
    //patient is already register
    function initServicesOnline()
    {
      //Sets the path for data fetching
      var r=$q.defer();
      var ref= new Firebase(FirebaseService.getFirebaseUrl()+'Users/');
      var username=UserAuthorizationInfo.getUserName();
      var deviceId=RequestToServer.getIdentifier();
      var pathToSection=username+'/'+deviceId+'/All';
      ref.child(pathToSection).on('value',function(snapshot){
          var data=snapshot.val();
          if(data&&typeof data!=='undefined'){
            //Data decryption
              data=EncryptionService.decryptData(data);
              //Initializing all the services
              sectionServiceMappings['All'].init(data, 'Online');
              //Detaching and deleting ref and data respectively
              //ref.child(pathToSection).set(null);
              ref.child(pathToSection).off();
              //returning the promise of work done
              r.resolve(true);
            }
            /*setTimeout(function(){
              ref.child(pathToSection).set(null);
              ref.child(pathToSection).off();
              r.resolve(true);
            },40000);*/
          });
        return r.promise;
    }
    //Initiating services offline
    function initServicesOffline()
    {

      var r=$q.defer();
      console.log('Inside the init offline function');
      data=LocalStorage.ReadLocalStorage('All');
      console.log(data);
      sectionServiceMappings.All.init(data, 'Offline');
      r.resolve(true);
      return r.promise;
    }
    function initServicesFromLocalStorage()
    {
      var r=$q.defer();
      data=LocalStorage.ReadLocalStorage('All');
      console.log(data);
      sectionServiceMappings.All.init(data, 'Offline');
      var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app){
          if($cordovaNetwork.isOnline()){
            updateSection('All').then(function()
            {
              r.resolve(true);
            }).catch(function(error){
              console.log(error);
              r.resolve(true);
            });
          }else{
            r.resolve(true);
          }
      }else{
        r.resolve(true);
      }
      $timeout(function(){
        r.resolve(true);
      },40000);

      return r.promise;
    }

    return {
        UpdateOffline:function(section)
        {
          return UpdateSectionOffline(section);
        },
        UpdateOnline:function(section)
        {
          return UpdateSectionOnline(section);
        },
        //Function to update fields in the app, it does not initialize them, it only updates the new fields.
        //Parameter only defined when its a particular array of values.
        update:function(section,parameters)
        {
           return updateSection(section,parameters);
        },
        init:function()
        {
          var r=$q.defer();
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
                  console.log(LocalStorage.isUserDataDefined());
                  if(LocalStorage.isUserDataDefined())
                  {
                    return initServicesFromLocalStorage();
                  }else{
                    return initServicesOnline();
                  }
          }else{
              //Computer check if online
              return initServicesOnline();
           }
        },
        UpdateSection:function(section,onDemand)
        {
            var r=$q.defer();
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if($cordovaNetwork.isOnline()){
                    return UpdateSectionOnline(section);
                }else{
                    if(onDemand)
                    {
                      r.reject('No internet connection');
                    }else{
                      return UpdateSectionOffline(section);
                    }
                }
            }else{
                //Computer check if online
                if(navigator.onLine){
                    console.log('online website');
                    return UpdateSectionOnline(section);
                }else{
                    console.log('offline website');
                    return UpdateSectionOffline(section);
                }
             }
            return r.promise;
        }
    };

}]);
