//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Patient
 *@requires $q
 *@requires $cordovaDevice
 *@requires MUHCApp.service:FileManagerService
 *@requires MUHCApp.service:UserPreferences
 *@requires MUHCApp.service:LocalStorage
 *@description API service used to access the patient fields.
 **/
myApp.service('Patient',['$q','$cordovaDevice','FileManagerService','LocalStorage','UserPreferences',function($q, $cordovaDevice,FileManagerService,LocalStorage,UserPreferences){
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#ProfileImage
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing profile picture base64 content
     **/
    var ProfileImage='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#FirstName
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing the first name of the patient
     **/
    var FirstName='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#LastName
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing the last name of the patient
     **/
    var LastName='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#Alias
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing nickname of the patient
     **/
    var Alias='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#TelNum
     *@propertyOf MUHCApp.service:Patient
     *@description Patient access level
     **/
    var accessLevel='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#TelNum
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing telephone number of the patient
     **/
    var TelNum='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#Email
     *@propertyOf MUHCApp.service:Patient
     *@description  Property containing email of the patient
     **/
    var Email='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#PatientId
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing patientid of the patient
     **/
    var PatientId='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#UserSerNum
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing PatientSerNum of the patient
     **/
    var UserSerNum='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#NameFileSystem
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing name of profile image in device storage for the patient
     **/
    var NameFileSystem='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#PathFileSystem
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing full path for profile picture in device stroage
     **/
    var PathFileSystem='';
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#CDVfilePath
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing profile CDV file Path for profile pic in device storage
     **/
    var CDVfilePath='';
    return{
        /**
         *@ngdoc method
         *@name setUserFieldsOnline
         *@methodOf MUHCApp.service:Patient
         *@param {Object} patientFields Contains patient fields
         *@description Setter method for the patient service, saves image profile image into device storage
         **/
        setUserFieldsOnline:function(patientFields){
            var r=$q.defer();
            patientFields=patientFields[0];
            UserPreferences.setEnableSMS(patientFields.EnableSMS);
            //UserPreferences.setLanguage(patientFields.Language);
            UserPreferences.getFontSize();
            if(typeof patientFields=='undefined') return;
            FirstName=patientFields.FirstName;
            LastName=patientFields.LastName;
            accessLevel=patientFields.AccessLevel;
            Alias=patientFields.Alias;
            TelNum=patientFields.TelNum;
            Email=patientFields.Email;
            PatientId=patientFields.PatientId;
            UserSerNum=patientFields.PatientSerNum;
            ProfileImage=(patientFields.ProfileImage&&typeof patientFields.ProfileImage!=='undefined'&&patientFields.ProfileImage!=='')?'data:image/'+patientFields.DocumentType+';base64,'+patientFields.ProfileImage:'./img/patient.png';
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                if(patientFields.ProfileImage&&typeof patientFields.ProfileImage!=='undefined'&&patientFields.ProfileImage!=='')
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
                    var trustHosts = true;
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
                    delete patientFields.ProfileImage;
                    LocalStorage.WriteToLocalStorage('Patient',[patientFields]);
                    r.resolve(patientFields);
                }
            }else{
                if(!patientFields.ProfileImage||typeof patientFields.ProfileImage =='undefined'||patientFields.ProfileImage ==='')
                {
                    ProfileImage='./img/patient.png';
                }
                delete patientFields.ProfileImage;
                LocalStorage.WriteToLocalStorage('Patient',[patientFields]);
                r.resolve(patientFields);
            }
            return r.promise;
        },
        /**
         *@ngdoc method
         *@name setUserFieldsOffline
         *@methodOf MUHCApp.service:Patient
         *@param {Object} patientFields Contains patient fields
         *@description Sets the service offline
         **/
        setUserFieldsOffline:function(patientFields)
        {
            var r=$q.defer();
            patientFields=patientFields[0];
            UserPreferences.setEnableSMS(patientFields.EnableSMS);
            //UserPreferences.setLanguage(patientFields.Language);
            UserPreferences.getFontSize();
            FirstName=patientFields.FirstName;
            LastName=patientFields.LastName;
            accessLevel=patientFields.AccessLevel;
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
                r.resolve(true);
            }else{
                ProfileImage='./img/patient.png';
                r.resolve(true);
            }
            return r.promise;
        },
        /**
         *@ngdoc method
         *@name setAlias
         *@methodOf MUHCApp.service:Patient
         *@param {String} name New nickname for patient
         *@description Sets the nickname for the patient.
         **/
        setAlias:function(name){
            Alias=name;
        },
        /**
         *@ngdoc method
         *@name setTelNum
         *@methodOf MUHCApp.service:Patient
         *@param {String} name New telephone for patient
         *@description Sets TelNum for the patient.
         **/
        setTelNum:function(telephone){
            TelNum=telephone;
        },
        /**
         *@ngdoc method
         *@name setEmail
         *@methodOf MUHCApp.service:Patient
         *@param {String} name New email for patient
         *@description Sets email for the patient.
         **/
        setEmail:function(email){
            Email=email;
        },
        /**
         *@ngdoc method
         *@name getPatientId
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns patient id
         **/
        getPatientId:function()
        {
            return PatientId;
        },
        /**
         *@ngdoc method
         *@name getFirstName
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns first name
         **/
        getFirstName:function(){
            return FirstName;
        },
        /**
         *@ngdoc method
         *@name getLastName
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns last name
         **/
        getLastName:function(){
            return LastName;
        },
        /**
         *@ngdoc method
         *@name getAlias
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns Nickname
         **/
        getAlias:function(){
            return Alias;
        },
        /**
         *@ngdoc method
         *@name getTelNum
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns Tel. Number
         **/
        getTelNum:function(){
            return TelNum;
        },
        /**
         *@ngdoc method
         *@name getEmail
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns Email
         **/
        getEmail:function(){
            return Email;
        },
        /**
         *@ngdoc method
         *@name getUserSerNum
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns PatientSerNum
         **/
        getUserSerNum:function(){
            return UserSerNum;
        },
        /**
         *@ngdoc method
         *@name getProfileImage
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns patient image
         **/
        getProfileImage:function(){
            return ProfileImage;
        },
        /**
         *@ngdoc method
         *@name getProfileImage
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns patient image
         **/
        getAccessLevel:function(){
            return accessLevel;
        },
        /**
         *@ngdoc method
         *@name clearPatient
         *@methodOf MUHCApp.service:Patient
         *@description Cleans the patient service
         **/
        clearPatient:function()
        {
            ProfileImage='';
            FirstName='';
            LastName='';
            Alias='';
            TelNum='';
            Email='';
            PatientId='';
            UserSerNum='';
            NameFileSystem='';
            PathFileSystem='';
            CDVfilePath='';
        }
    };
}]);
