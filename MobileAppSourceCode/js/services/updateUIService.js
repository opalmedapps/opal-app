var myApp=angular.module('MUHCApp');


myApp.service('UpdateUI', ['EncryptionService','$http', 'Patient','Doctors','Appointments','Messages','Documents','UserPreferences', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', function (EncryptionService,$http, Patient,Doctors, Appointments,Messages, Documents, UserPreferences, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork) {
    function updateAllServices(dataUserObject,mode){
        function setDocuments(){
            var setDocProm=$q.defer();
            Documents.setDocuments(dataUserObject.Images,mode);
            setDocProm.resolve(true);
            return setDocProm.promise;

        }
        setDocuments().then(function(){
            UserPlanWorkflow.setUserPlanWorkflow({
                '1':{'Name':'Consult \t Appointment','Date':'2015-08-20T09:15:00Z','Description':'stage1','Type': 'Appointment'},
                '2':{'Name':'Ct-Sim','Date':'2015-08-26T09:15:00Z','Description':'stage2','Type':'Appointment'},
                '3':{'Name':'Ready For \t Contour','Date':'2015-09-23T09:15:00Z','Description':'stage3','Type':'Task'},
                '4':{'Name':'Ready For \t Dose Calculation','Date':'2015-09-20T09:15:00Z','Description':'stage4','Type':'Task'},
                '5':{'Name':'Ready for \t MD Contour','Date':'2015-09-20T10:15:00Z','Description':'stage5','Type':'Task'},
                '6':{'Name':'Ready For \t Physics QA','Date':'2015-09-21T09:15:00Z','Description':'stage6','Type':'Task'},
                '7':{'Name':'Ready For \t Treatment','Date':'2015-09-31T09:15:00Z','Description':'stage7','Type':'Task'}
            });
            Doctors.setUserContacts(dataUserObject.Doctors);
            Patient.setUserFields(dataUserObject.Patient, dataUserObject.Diagnosis);
            UserPreferences.setUserPreferences(dataUserObject.Patient.Language,dataUserObject.Patient.EnableSMS);
            Appointments.setUserAppointments(dataUserObject.Appointments);
            setUpForNews().then( Notifications.setUserNotifications(dataUserObject.Notifications));
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
        var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.getUserName());
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
    }
    };
        
}]);