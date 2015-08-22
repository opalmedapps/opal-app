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
        var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
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
