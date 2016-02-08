var myApp=angular.module('MUHCApp');

myApp.service('Patient',['UserPreferences','$q','$cordovaFileTransfer','$cordovaDevice','FileManagerService','$filter',function(UserPreferences,$q, $cordovaFileTransfer, $cordovaDevice,FileManagerService,$filter){
    var profileImage='';
    return{
        setUserFieldsOnline:function(patientFields,diagnosis){
            var r=$q.defer();
            console.log(patientFields);
            this.FirstName=patientFields.FirstName;
            this.LastName=patientFields.LastName;
            this.Alias=patientFields.Alias;
            this.TelNum=patientFields.TelNum;
            this.Email=patientFields.Email;
            this.Diagnosis=diagnosis;
            this.PatientId=patientFields.PatientId;
            this.Alias=patientFields.Alias;
            this.UserSerNum=patientFields.PatientSerNum;
            this.ProfileImage='data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage;
            profileImage=this.ProfileImage;
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if(typeof patientFields.ProfileImage!=='undefined'||patientFields.ProfileImage=='')
                {
                  patientFields.ProfileImage='data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage;
                  var platform=$cordovaDevice.getPlatform();
                  var targetPath='';
                  if(platform==='Android'){
                      targetPath = cordova.file.dataDirectory+'Patient/patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  }else if(platform==='iOS'){
                    targetPath = cordova.file.documentsDirectory+ 'Patient/patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  }
                  var url = patientFields.ProfileImage;
                  delete patientFields.ProfileImage;
                  var trustHosts = true
                  var options = {};
                  this.NameFileSystem='patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  this.PathFileSystem=targetPath;
                  patientFields.NameFileSystem='patient'+patientFields.PatientSerNum+"."+patientFields.DocumentType;
                  patientFields.PathFileSystem=targetPath;
                  var promise=[FileManagerService.downloadFileIntoStorage(url, targetPath)];
                  $q.all(promise).then(function()
                  {
                    r.resolve(patientFields);
                  },function(error){
            				console.log(error);
            				r.resolve(documents);
            			});
                }else{
                  profileImage='./img/patient.png';
                  r.resolve(patientFields);
                }
              }else{
                if(typeof patientFields.ProfileImage!=='undefined'||patientFields.ProfileImage=='')
                {
                  patientFields.ProfileImage='data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage;
                  profileImage=patientFields.ProfileImage;
                }else{
                  profileImage='./img/patient.png';
                }
                delete patientFields.ProfileImage;
                r.resolve(patientFields);
              }
            return r.promise;
        },
        setUserFieldsOffline:function(patientFields,diagnosis)
        {
          var r=$q.defer();
          this.FirstName=patientFields.FirstName;
          this.LastName=patientFields.LastName;
          this.Alias=patientFields.Alias;
          this.TelNum=$filter('phone-number')(patientFields.TelNum);
          this.Email=patientFields.Email;
          this.PatientId=patientFields.PatientId;
          this.Diagnosis=diagnosis;
          this.UserSerNum=patientFields.PatientSerNum;
          this.ProfileImage=patientFields.ProfileImage;
          this.Alias=patientFields.Alias;
          if(patientFields.PathFileSystem)
          {
            var promise=[FileManagerService.getFileUrl(patientFields.PathFileSystem)];
            $q.all(promise).then(function(result){
              console.log(result);
              patientFields.ProfileImage=result[0];
              profileImage=result[0];
              console.log(profileImage);
              r.resolve(patientFields);
            },function(error){
              console.log(error);
              r.resolve(patientFields);
            });
          }else{
            this.ProfileImage='./img/patient.png';
            r.resolve(patientFields);
          }
          return r.promise;
        },
        setDiagnosis:function(diagnosis){
            this.Diagnosis=diagnosis;
        },
        setFirstName:function(name){
            this.FirstName=name;
        },
        setLastName:function(name){
            this.LastName=name;
        },
        setAlias:function(name){
            this.Alias=name;
        },
        setTelNum:function(telephone){
            this.TelNum=telephone;
        },
        setEmail:function(email){
            this.Email=email;
        },
        getDiagnosis:function(){
            return this.Diagnosis;
        },
        getPatientId:function()
        {
          return this.PatientId;
        },
        getFirstName:function(){
            return this.FirstName;
        },
        getLastName:function(){
            return this.LastName;
        },
        getAlias:function(){
            return this.Alias;
        },
        getTelNum:function(){
            return this.TelNum;
        },
        getEmail:function(){
            return this.Email;
        },
        getUserSerNum:function(){
            return this.UserSerNum;
        },
        setProfileImage:function(img){
            this.ProfileImage='data:image/png;base64,'+img;
        },
        getProfileImage:function(){
            return profileImage;
        },
        getStatus:function(){
            return this.Status;
        }
    };
}]);
