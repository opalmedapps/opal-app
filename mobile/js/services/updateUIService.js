var myApp=angular.module('MUHCApp');


myApp.service('UpdateUI', ['EncryptionService','$http', 'Patient','Doctors','Appointments','Messages','Documents','UserPreferences', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', 'Notes', 'LocalStorage','RequestToServer','$filter',function (EncryptionService,$http, Patient,Doctors, Appointments,Messages, Documents, UserPreferences, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork,Notes,LocalStorage,RequestToServer,$filter) {
    function updateAllServices(dataUserObject,mode){
        console.log(mode);
        var promises=[];
        console.log(dataUserObject);
        if(mode=='Online')
        {
          var documents=dataUserObject.Documents;
          var documentProm=Documents.setDocumentsOnline(documents);
          var doctors=dataUserObject.Doctors;
          var doctorProm=Doctors.setUserContactsOnline(doctors);
          var patientFields=dataUserObject.Patient;
          var patientProm=Patient.setUserFieldsOnline(patientFields, dataUserObject.Diagnosis);
          console.log(patientProm);
          promises=[doctorProm,documentProm,patientProm];
        }else{
          var documentProm=Documents.setDocumentsOffline(dataUserObject.Documents);
          var doctorProm=Doctors.setUserContactsOffline(dataUserObject.Doctors);
          var patientProm=Patient.setUserFieldsOffline(dataUserObject.Patient, dataUserObject.Diagnosis);
          promises=[documentProm,doctorProm,patientProm];
        }
        $q.all(promises).then(function(){
          console.log('I am inside!!!');
          console.log(dataUserObject);
          Messages.setUserMessages(dataUserObject.Messages);
          Notifications.setUserNotifications(dataUserObject.Notifications);
          UserPlanWorkflow.setTreatmentPlan(dataUserObject.Tasks, dataUserObject.Appointments);
          var plan={
              '1':{'Name':'CT for Radiotherapy Planning','Date':'2015-10-19T09:00:00Z','Description':'stage1','Type': 'Appointment'},
              '2':{'Name':'Physician Plan Preparation','Date':'2015-10-21T09:15:00Z','Description':'stage2','Type':'Task'},
              '3':{'Name':'Calculation of Dose & Physician Review','Date':'2015-10-23T09:15:00Z','Description':'stage3','Type':'Task'},
              '4':{'Name':'Quality Control','Date':'2015-10-28T10:15:00Z','Description':'stage5','Type':'Task'},
              '5':{'Name':'Scheduling','Date':'2015-10-30T09:15:00Z','Description':'stage6','Type':'Task'},
              '6':{'Name':'First Treatment','Date':'2015-11-02T09:15:00Z','Description':'stage6','Type':'Task'}
          };
          var newDate=new Date();
          var valAdded=-6;

          for (var key in plan) {
            var tmp=new Date(newDate);
            tmp.setDate(tmp.getDate()+valAdded);
            valAdded+=2;
            plan[key].Date=$filter('formatDateToFirebaseString')(tmp);
          }
            console.log(plan);
            UserPlanWorkflow.setUserPlanWorkflow(plan);
            UserPreferences.setUserPreferences(dataUserObject.Patient.Language,dataUserObject.Patient.EnableSMS);
            Appointments.setUserAppointments(dataUserObject.Appointments);
            Notes.setNotes(dataUserObject.Notes);
            console.log(dataUserObject);
            if(mode=='Online')
            {
              LocalStorage.WriteToLocalStorage('All',dataUserObject);
            }

        });
    }

    function updateUIOnline(){
        var r = $q.defer();
        var firebaseLink = new Firebase('https://brilliant-inferno-7679.firebaseio.com/users/' + UserAuthorizationInfo.getUserName()+ '\/'+RequestToServer.getIdentifier());
        obtainDataLoop();
       function obtainDataLoop(){
        firebaseLink.once('value', function (snapshot) {
            var firebaseData = snapshot.val();
            if(firebaseData.Patient===undefined){
                firebaseLink.update({logged:'true'});
                obtainDataLoop();
            }else{
                function decryptPromise(){
                    var r=$q.defer();
                    EncryptionService.decryptData(firebaseData);
                    r.resolve(true);
                    return r.promise;
                }
                function setUpServicesLocalStorage(){
                    updateAllServices(firebaseData,'Online');
                    var imageKeys=Object.keys(firebaseData.Images);
                    window.localStorage.setItem(UserAuthorizationInfo.UserName, JSON.stringify(firebaseData));
                }

                decryptPromise().then( setUpServicesLocalStorage());
                r.resolve(true);
            }

        },function(error){

            r.reject(error);

            });


    }
    return r.promise;
    }
    function updateUIOffline(){
        var r=$q.defer();
        var userName=UserAuthorizationInfo.getUserName();
        var dataUserString=window.localStorage.getItem(userName);
        var dataUserObject=JSON.parse(dataUserString);
        r.resolve(updateAllServices(dataUserObject,'Offline'));
        return r.promise;
    }
    function UpdateSectionOffline(section)
    {
        var r=$q.defer();
        var data='';
        console.log(section);
        data=LocalStorage.ReadLocalStorage(section);
        console.log(data);
        switch(section){
            case 'All':
                updateAllServices(data, 'Offline');
                break;
            case 'Doctors':
                Doctors.setUserContactsOnline(data);
                break;
            case 'Patient':
                Patient.setUserFieldsOnline(data);
                break;
            case 'Appointments':
                Appointments.setUserAppointments(data);
                break;
            case 'Messages':
                Messages.setUserMessages(data);
                break;
            case 'Documents':
                Documents.setDocumentsOffline(data);
                break;
            case 'UserPreferences':
                UserPreferences.setUserPreferences(data.Language,data.EnableSMS);
                break;
            case 'Notifications':
                Notifications.setUserNotifications(data);
                break;
            case 'Notes':
                Notes.setNotes(data);
                break;
            case 'UserPlanWorkflow':
            //To be done eventually!!!
            break;
          }
          setTimeout(function () {
              r.resolve(true);
          }, 7000);
        return r.promise;
    }
    function UpdateSectionOnline(section)
    {
        var r=$q.defer();
        var ref= new Firebase('https://brilliant-inferno-7679.firebaseio.com/Users/');
        var pathToSection=''
        var username=UserAuthorizationInfo.getUserName();
        var deviceId=RequestToServer.getIdentifier();
        console.log(deviceId);
        if(section!=='UserPreferences'){
            pathToSection=username+'/'+deviceId+'/'+section;
        }else{
           pathToSection=username+'/'+deviceId+'/'+'Patient';
        }
        if(section=='All')
        {
            pathToSection=username+'/'+deviceId;
        }
        console.log(pathToSection);
        ref.child(pathToSection).on('value',function(snapshot){
            var data=snapshot.val();
            if(data!=undefined){
                console.log(data);
                data=EncryptionService.decryptData(data);
                switch(section){
                    case 'All':
                        updateAllServices(data, 'Online');
                        break;
                    case 'Doctors':
                        Doctors.setUserContactsOnline(data);
                        break;
                    case 'Patient':
                        Patient.setUserFieldsOnline(data);
                        break;
                    case 'Appointments':
                        Appointments.setUserAppointments(data);
                        break;
                    case 'Messages':
                        Messages.setUserMessages(data);
                        break;
                    case 'Documents':
                        Documents.setDocumentsOnline(data,'Online');
                        break;
                    case 'UserPreferences':
                        UserPreferences.setUserPreferences(data.Language,data.EnableSMS);
                        break;
                    case 'Notifications':
                        Notifications.setUserNotifications(data);
                        break;
                    case 'Notes':
                        Notes.setNotes(data);
                        break;
                    case 'UserPlanWorkflow':
                    //To be done eventually!!!
                    break;
                }
                console.log(data);
                ref.child(pathToSection).set(null);
                ref.child(pathToSection).off();

                r.resolve(true);
            }
        });

        return r.promise;
    }

    this.internetConnection=false;
    return {
        UpdateUserFields:function(){
            //Check if its a device or a computer
            var r=$q.defer();
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if($cordovaNetwork.isOnline()){
                    return updateUIOnline();
                }else{
                    return updateUIOffline();
                }
            }else{
                //Computer check if online
                if(navigator.onLine){
                    console.log('online website');
                    return updateUIOnline();
                }else{
                    console.log('offline website');
                    return updateUIOffline();
                }
             }
        },
        UpdateOffline:function(section)
        {
          return UpdateSectionOffline(section);
        },
        UpdateOnline:function(section)
        {
          return UpdateSectionOnline(section);
        },
        UpdateSection:function(section)
        {
            var r=$q.defer();
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if($cordovaNetwork.isOnline()){
                    this.internetConnection=true;
                    return UpdateSectionOnline(section);
                }else{
                    this.internetConnection=false;
                    //navigator.notification.alert('Connect to the internet for your most recent data, loading last saved data from device. Your documents will not be available',function(){},'Internet Connectivity','Ok');
                    return UpdateSectionOffline(section);
                }
            }else{
                //Computer check if online
                if(navigator.onLine){
                    console.log('online website');
                    this.internetConnection=true;
                    return UpdateSectionOnline(section);
                }else{
                    this.internetConnection=false;
                    console.log('offline website');
                    return UpdateSectionOffline(section);
                }
             }
            return r.promise;
        },
        getInternetConnection:function()
        {
          return this.internetConnection;
        }

    };

}]);
