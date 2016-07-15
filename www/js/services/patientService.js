var myApp=angular.module('MUHCApp');

myApp.service('Patient',['$q','$cordovaFileTransfer','$cordovaDevice','FileManagerService','$filter','LocalStorage','UserPreferences',function($q, $cordovaFileTransfer, $cordovaDevice,FileManagerService,$filter,LocalStorage,UserPreferences){
    var ProfileImage='';
    var FirstName='';
    var LastName='';
    var Alias='';
    var TelNum='';
    var Email='';
    var PatientId='';
    var UserSerNum='';
    var NameFileSystem='';
    var PathFileSystem='';
    var CDVfilePath='';
    return{
        setUserFieldsOnline:function(patientFields){
            var r=$q.defer();
            patientFields=patientFields[0];
            
            UserPreferences.setEnableSMS(patientFields.EnableSMS);
            UserPreferences.setLanguage(patientFields.Language);
            console.log(UserPreferences.getLanguage());
            UserPreferences.getFontSize();
            if(typeof patientFields=='undefined') return;
            FirstName=patientFields.FirstName;
            LastName=patientFields.LastName;
            Alias=patientFields.Alias;
            TelNum=patientFields.TelNum;
            Email=patientFields.Email;
            PatientId=patientFields.PatientId;
            UserSerNum=patientFields.PatientSerNum;
            ProfileImage=(patientFields.ProfileImage)?'data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage:'./img/patient.png';
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if(typeof patientFields.ProfileImage!=='undefined'||patientFields.ProfileImage=='')
                {
                  patientFields.ProfileImage='data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage;
                  patientFields.NameFileSystem='patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  var platform=$cordovaDevice.getPlatform();
                  var targetPath='';
                  if(platform==='Android'){
                      targetPath = cordova.file.dataDirectory+'Patient/patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                    patientFields.CDVfilePath="cdvfile://localhost/files/Patient/"+patientFields.NameFileSystem;
                  }else if(platform==='iOS'){
                    targetPath = cordova.file.documentsDirectory+ 'Patient/patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                    patientFields.CDVfilePath="cdvfile://localhost/persistent/Patient/"+patientFields.NameFileSystem;

                  }
                  var url = patientFields.ProfileImage;
                  delete patientFields.ProfileImage;
                  var trustHosts = true
                  var options = {};
                  CDVfilePath=patientFields.CDVfilePath;
                  NameFileSystem='patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  PathFileSystem=targetPath;
                  patientFields.PathFileSystem=targetPath;
                  LocalStorage.WriteToLocalStorage('Patient',[patientFields]);
                  var promise=[FileManagerService.downloadFileIntoStorage(url, targetPath)];
                  $q.all(promise).then(function()
                  {
                    r.resolve(patientFields);
                  },function(error){
            				console.log(error);
            				r.resolve(patientFields);
            			});
                }else{
                  ProfileImage='./img/patient.png';
                  r.resolve(patientFields);
                }
              }else{
                if(!patientFields.ProfileImage||typeof patientFields.ProfileImage=='undefined'||patientFields.ProfileImage=='')
                {
                  ProfileImage='./img/patient.png';

                }
                delete patientFields.ProfileImage;
                LocalStorage.WriteToLocalStorage('Patient',[patientFields]);
                r.resolve(patientFields);
              }
            console.log(UserPreferences.getLanguage());
            return r.promise;
        },
        setUserFieldsOffline:function(patientFields)
        {
          var r=$q.defer();
          patientFields=patientFields[0];
          UserPreferences.setEnableSMS(patientFields.EnableSMS);
          UserPreferences.setLanguage(patientFields.Language);
          UserPreferences.getFontSize();
          FirstName=patientFields.FirstName;
          LastName=patientFields.LastName;
          Alias=patientFields.Alias;
          TelNum=patientFields.TelNum;
          Email=patientFields.Email;
          PatientId=patientFields.PatientId;
          UserSerNum=patientFields.PatientSerNum;
          ProfileImage= (patientFields.ProfileImage)?patientFields.ProfileImage:'./img/patient.png';
          Alias=patientFields.Alias;
          if(patientFields.PathFileSystem)
          {
            ProfileImage=patientFields.CDVfilePath;
            console.log(ProfileImage);
            /*var promise=[FileManagerService.getFileUrl(patientFields.PathFileSystem)];
            $q.all(promise).then(function(result){
              console.log(result);
              patientFields.ProfileImage=result[0];
              ProfileImage=result[0];
              console.log(ProfileImage);
              r.resolve(patientFields);
            },function(error){
              console.log(error);
              r.resolve(patientFields);
            });*/
            r.resolve(true);
          }else{
            ProfileImage='./img/patient.png';
            r.resolve(true);
          }
          return r.promise;
        },
        setFirstName:function(name){
            FirstName=name;
        },
        setLastName:function(name){
            LastName=name;
        },
        setAlias:function(name){
            Alias=name;
        },
        setTelNum:function(telephone){
            TelNum=telephone;
        },
        setEmail:function(email){
            Email=email;
        },
        getPatientId:function()
        {
          return PatientId;
        },
        getFirstName:function(){
            return FirstName;
        },
        getLastName:function(){
            return LastName;
        },
        getAlias:function(){
            return Alias;
        },
        getTelNum:function(){
            return TelNum;
        },
        getEmail:function(){
            return Email;
        },
        getUserSerNum:function(){
            return UserSerNum;
        },
        setProfileImage:function(img){
            ProfileImage='data:image/png;base64,'+img;
        },
        getProfileImage:function(){
            return ProfileImage;
        },
        getStatus:function(){
            return Status;
        }
    };
}]);
