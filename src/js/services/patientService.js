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

        let ProfileImage = '';
        let FirstName = '';
        let LastName = '';
        let AccessLevel = '';
        let Email = '';
        let PatientSerNum = '';
        let SelectedProfile = {};

        return {
            setSelectedProfile: profile => SelectedProfile = profile,
            initPatient: initPatient,
            getFirstName: () => FirstName,
            getLastName: () => FirstName,
            getEmail: () => Email,
            getPatientSerNum: () => SelectedProfile?.patient_legacy_id || PatientSerNum,
            getProfileImage: () => ProfileImage,
            getAccessLevel: () => AccessLevel,
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
            let font = window.localStorage.getItem(UserAuthorizationInfo.getUsername() + 'fontSize');
            UserPreferences.setFontSize(font||'large');
            FirstName = patientFields.FirstName;
            LastName = patientFields.LastName;
            AccessLevel = patientFields.AccessLevel;
            Email = patientFields.Email;
            PatientSerNum = patientFields.PatientSerNum;
            ProfileImage = (patientFields.ProfileImage && patientFields.ProfileImage !== '')
                ? `data:image/${patientFields.DocumentType};base64,${patientFields.ProfileImage}`
                : '';
            patientFields.ProfileImage = ProfileImage;
            return patientFields;
        }

        /**
         * @desc Requests the Patient entry for the current user and saves it in this service.
         * @returns {Promise<Object>} Resolves with the processed Patient information once downloaded and saved.
         */
        async function initPatient() {
            let RequestToServer = $injector.get('RequestToServer');
            let result = await RequestToServer.sendRequestWithResponse('UserPatient');
            if (!result.Data || result.Data === "empty") throw new Error("Failed to download the user's patient information; no data was returned");
            return setPatient(result.Data);
        }

        /**
         *@ngdoc method
         *@name clearPatient
         *@methodOf MUHCApp.service:Patient
         *@description Cleans the patient service
         **/
        function clearPatient() {
            ProfileImage = '';
            FirstName = '';
            LastName = '';
            Email = '';
            PatientSerNum = '';
            AccessLevel = '';
            SelectedProfile = {};
        }
    }
]);
