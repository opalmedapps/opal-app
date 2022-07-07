//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Patient
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@requires MUHCApp.service:UserPreferences
 *@description API service used to access the patient fields.
 **/
myApp.service('Patient',['$injector','UserAuthorizationInfo','UserPreferences',
    function($injector, UserAuthorizationInfo, UserPreferences) {

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
     *@name  MUHCApp.service.#TestUser
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing boolean determining whether the patient is a test user
     **/
    var TestUser ='';

    /**
     *@ngdoc property
     *@name  MUHCApp.service.#PatientSerNum
     *@propertyOf MUHCApp.service:Patient
     *@description Property containing PatientSerNum of the patient
     **/
    var PatientSerNum = '';

    /**
     *@ngdoc method
     *@name setPatient
     *@methodOf MUHCApp.service:Patient
     *@param {Object} patientFields Contains patient fields
     *@description Setter method for the patient service.
     **/
    function setPatient(patientFields) {
        if (!patientFields) throw new Error("Failed to set empty patientFields");

        var font = window.localStorage.getItem(UserAuthorizationInfo.getUsername() + 'fontSize');
        UserPreferences.setFontSize(font||'large');
        FirstName = patientFields.FirstName;
        LastName = patientFields.LastName;
        accessLevel = patientFields.AccessLevel;
        Alias = patientFields.Alias;
        TelNum = patientFields.TelNum;
        Email = patientFields.Email;
        TestUser = patientFields.TestUser;
        PatientSerNum = patientFields.PatientSerNum;
        ProfileImage = (patientFields.ProfileImage && patientFields.ProfileImage !== '')
            ? `data:image/${patientFields.DocumentType};base64,${patientFields.ProfileImage}`
            : '';
        patientFields.ProfileImage = ProfileImage;

        return patientFields;
    }

    return {
        /**
         * @desc Requests the Patient entry for the current user and saves it in this service.
         * @returns {Promise<Object>} Resolves with the processed Patient information once downloaded and saved.
         */
        initPatient: async () => {
            let RequestToServer = $injector.get('RequestToServer');
            let result = await RequestToServer.sendRequestWithResponse('UserPatient');
            if (!result.Data || result.Data === "empty") throw new Error("Failed to download the user's patient information; no data was returned");
            return setPatient(result.Data);
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
         *@name getTestUser
         *@methodOf MUHCApp.service:Patient
         *@returns {Boolean} Returns if patient is test user
         **/
        getTestUser:function() {
            var test = parseInt(TestUser, 10)
            if(test===1){
               return true
            }
            return false;
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
         *@name getPatientSerNum
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns PatientSerNum
         **/
        getPatientSerNum:function(){
            return PatientSerNum;
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
         *@name getAccessLevel
         *@methodOf MUHCApp.service:Patient
         *@returns {String} Returns patient access level
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
            PatientSerNum='';
        }
    };
}]);
