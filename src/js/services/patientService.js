/**
 *@ngdoc service
 *@name MUHCApp.service:Patient
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@requires MUHCApp.service:UserPreferences
 *@description API service used to access the patient fields.
 **/

angular
    .module('MUHCApp')
    .service('Patient',['$injector','UserAuthorizationInfo','UserPreferences',
    function($injector, UserAuthorizationInfo, UserPreferences) {

        var ProfileImage='';
        var FirstName='';
        var LastName='';
        var Alias='';
        var accessLevel='';
        var TelNum='';
        var Email='';
        var TestUser ='';
        var PatientSerNum = '';
        var SelectedProfile = {};

        return {
            setSelectedProfile: setSelectedProfile,
            getSelectedProfile: getSelectedProfile,
            initPatient: initPatient,
            getFirstName: getFirstName,
            getLastName: getLastName,
            getTelNum: getTelNum,
            getEmail: getEmail,
            getPatientSerNum: getPatientSerNum,
            getProfileImage: getProfileImage,
            getAccessLevel: getAccessLevel,
            clearPatient: clearPatient,
        };

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
        /**
         * @desc Set the informations for the current patient profile selected
         * @param {object} profile  Single profile from the list of patient return by the new backend 
         */
        function setSelectedProfile(profile) {
            return SelectedProfile = profile;
        };

        /**
         * @returns {object} The currently selected profile
         */
        function getSelectedProfile() {
            return SelectedProfile;
        };

        /**
         * @desc Requests the Patient entry for the current user and saves it in this service.
         * @returns {Promise<Object>} Resolves with the processed Patient information once downloaded and saved.
         */
        async function initPatient() {
            let RequestToServer = $injector.get('RequestToServer');
            let result = await RequestToServer.sendRequestWithResponse('UserPatient');
            if (!result.Data || result.Data === "empty") throw new Error("Failed to download the user's patient information; no data was returned");
            return setPatient(result.Data);
        };

        /**
         *@ngdoc method
        *@name getFirstName
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns first name
        **/
        function getFirstName() {
            return FirstName;
        };

        /**
         *@ngdoc method
        *@name getLastName
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns last name
        **/
        function getLastName() {
            return LastName;
        };

        /**
         *@ngdoc method
        *@name getTelNum
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns Tel. Number
        **/
        function getTelNum() {
            return TelNum;
        };

        /**
         *@ngdoc method
        *@name getTelNum
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns Tel. Number
        **/
        function getTelNum() {
            return TelNum;
        };

        /**
         *@ngdoc method
        *@name getEmail
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns Email
        **/
        function getEmail() {
            return Email;
        };
    
        /**
         *@ngdoc method
        *@name getPatientSerNum
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns PatientSerNum
        **/
        function getPatientSerNum() {
            return SelectedProfile?.patient_legacy_id || PatientSerNum;
        };

        /**
         *@ngdoc method
        *@name getProfileImage
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns patient image
        **/
        function getProfileImage() {
            return ProfileImage;
        };

        /**
         *@ngdoc method
        *@name getAccessLevel
        *@methodOf MUHCApp.service:Patient
        *@returns {String} Returns patient access level
        **/
        function getAccessLevel() {
            return accessLevel;
        };

        /**
         *@ngdoc method
        *@name clearPatient
        *@methodOf MUHCApp.service:Patient
        *@description Cleans the patient service
        **/
        function clearPatient() {
            ProfileImage='';
            FirstName='';
            LastName='';
            Alias='';
            TelNum='';
            Email='';
            PatientSerNum='';
            SelectedProfile={};
        };    
    }
]);
