var myApp=angular.module('MUHCApp');


myApp.service('UpdateUI', ['EncryptionService','$http', 'Patient','Doctors','Appointments','Messages','Documents','UserPreferences', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', 'Notes', 'LocalStorage','RequestToServer',function (EncryptionService,$http, Patient,Doctors, Appointments,Messages, Documents, UserPreferences, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork,Notes,LocalStorage,RequestToServer) {
    function updateAllServices(dataUserObject,mode){
        function setDocuments(dataUserObject){
            var setDocProm=$q.defer();
            console.log(dataUserObject.Documents);
            Documents.setDocuments(dataUserObject.Documents,mode);
            setDocProm.resolve(true);
            return setDocProm.promise;

        }
        setDocuments(dataUserObject).then(function(){
            UserPlanWorkflow.setUserPlanWorkflow({
                '1':{'Name':'CT for Radiotherapy Planning','Date':'2015-10-19T09:00:00Z','Description':'stage1','Type': 'Appointment'},
                '2':{'Name':'Physician Plan Preparation','Date':'2015-10-21T09:15:00Z','Description':'stage2','Type':'Task'},
                '3':{'Name':'Calculation of Dose','Date':'2015-10-23T09:15:00Z','Description':'stage3','Type':'Task'},
                '4':{'Name':'Physician Review','Date':'2015-10-26T09:15:00Z','Description':'stage4','Type':'Task'},
                '5':{'Name':'Quality Control','Date':'2015-10-28T10:15:00Z','Description':'stage5','Type':'Task'},
                '6':{'Name':'Scheduling','Date':'2015-10-30T09:15:00Z','Description':'stage6','Type':'Task'},
                '7':{'Name':'First Treatment','Date':'2015-11-02T09:15:00Z','Description':'stage6','Type':'Task'}
            });
            UserPreferences.setUserPreferences(dataUserObject.Patient.Language,dataUserObject.Patient.EnableSMS);
            Doctors.setUserContacts(dataUserObject.Doctors);
            Patient.setUserFields(dataUserObject.Patient, dataUserObject.Diagnosis);
            Appointments.setUserAppointments(dataUserObject.Appointments);
            setUpForNews().then( Notifications.setUserNotifications(dataUserObject.Notifications));
            Notes.setNotes(dataUserObject.Notes);
            function setUpForNews(){
                var r=$q.defer();
                Messages.setUserMessages(dataUserObject.Messages);
                r.resolve(true);
                return r.promise;
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
        updateAllServices(dataUserObject,'Offline');
        r.resolve(true);
        return r.promise;
    }
    function UpdateSectionOffline(section)
    {
        var r=$q.defer();
        var data='';
        if(section!='UserPreferences'){
            data=LocalStorage.ReadLocalStorage(section);
        }else{
            data=LocalStorage.ReadLocalStorage('Patient');
        }
        switch(section){
            case 'All':
                updateAllServices(data,'Offline');

                break;
            case 'Doctors':
                Doctors.setUserContacts(data);
                break;
            case 'Patient':
                Patient.setUserFields(data);
                break;
            case 'Appointments':
                Appointments.setUserAppointments(data);
                break;
            case 'Messages':
                Messages.setUserMessages(data);
                break;
            case 'Documents':
                Documents.setDocuments(data,'Offline');
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
        r.resolve(true);
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
                LocalStorage.WriteToLocalStorage(section,data);
                switch(section){
                    case 'All':
                        updateAllServices(data, 'Online');
                    case 'Doctors':
                        console.log(data);
                        Doctors.setUserContacts(data);
                        break;
                    case 'Patient':
                        Patient.setUserFields(data);
                        break;
                    case 'Appointments':
                        Appointments.setUserAppointments(data);
                        break;
                    case 'Messages':
                        Messages.setUserMessages(data);
                        break;
                    case 'Documents':
                        Documents.setDocuments(data,'Online');
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

        UpdateSection:function(section)
        {

            var r=$q.defer();
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if($cordovaNetwork.isOnline()){
                    return UpdateSectionOnline(section);
                }else{
                    return UpdateSectionOffline(section);
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
        }

    };

}]);
