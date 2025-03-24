//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

angular
    .module('MUHCApp')
    .service('RequestToServer',['$injector', 'UserAuthorizationInfo', 'EncryptionService', 'FirebaseService', 'Constants', 'UUID', 'ResponseValidator', 'Params', 'UserPreferences', 'Patient',
    function($injector, UserAuthorizationInfo, EncryptionService, FirebaseService, Constants, UUID, ResponseValidator, Params, UserPreferences, Patient){

        let firebase_url;
        let response_url;

        return {
            sendRequestWithResponse: sendRequestWithResponse,
            sendRequest: sendRequest,
            apiRequest: apiRequest,
            handleMultiplePatientsRequests: handleMultiplePatientsRequests
        };

        /**
         * @description Encrypt and send data to firebase
         * @param {string} typeOfRequest Type of request being process 
         * @param {object} parameters Data being use to make the request 
         * @param {string} encryptionKey Optional encrytion key
         * @param {string} referenceField Option refenrece field for the listener's legacy section
         * @returns Firebase unique reference key where the data is uploaded
         */
        function sendRequest(typeOfRequest, parameters, encryptionKey, referenceField, patientID) {
            firebase_url = FirebaseService.getDBRef();
            response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));
            if (parameters) parameters = JSON.parse(JSON.stringify(parameters));
            let requestType = encryptionKey ? typeOfRequest : EncryptionService.encryptData(typeOfRequest);
            let requestParameters = encryptionKey ? EncryptionService.encryptWithKey(parameters, encryptionKey) : EncryptionService.encryptData(parameters);
            let request_object = getRequestObject(requestType, requestParameters, typeOfRequest, patientID);
            let reference = getReferenceField(typeOfRequest, referenceField)
            let pushID =  firebase_url.child(reference).push(request_object);

            return pushID.key;
        }

        /**
         * @description Call the new listener structure that relays the request to Django backend
         * @param {object} parameters Required fields to process request
         * @param {object | null} Data the is needed to be passed to the request.
         * @returns Promise that contains the response data
         */
        function apiRequest(parameters, data = null) {
            return new Promise(async (resolve, reject) => {
                let formatedParams = formatParams(parameters, data);
                let requestKey = sendRequest('api', formatedParams);
                let firebasePath = `${UserAuthorizationInfo.getUsername()}/${requestKey}`;
                let dbReference = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));
    
                dbReference.child(firebasePath).on('value', snapshot => {
                    if (snapshot.exists())  {
                        const apiData = ResponseValidator.validateApiResponse(snapshot.val());
                        dbReference.child(firebasePath).set(null);
                        dbReference.child(firebasePath).off();
                        apiData instanceof Error ? reject(apiData) : resolve(apiData);
                    }
                });
            });
        }

        function formatParams(parameters, data){
            if (parameters.method === 'get' && data) parameters.params = data;
            if (parameters.method === 'post' && data) parameters.data = data;

            return {
                ...parameters,
                headers: {...Params.API.REQUEST_HEADERS, 'Accept-Language': UserPreferences.getLanguage()},
            }
        }

        /**
         * @descrition - Execute multiple requests to get an announcement per patient then merge the data together.
         * @param {string} typeOfRequest - Type of request send to the listener
         * @param {object} parameters - Extra parameters to identify data to be query
         * @param {string} categoryRequested - The data category requested
         * @returns Response with merge data
         */
        async function handleMultiplePatientsRequests(typeOfRequest, parameters, categoryRequested) {
            const ProfileSelectorService = $injector.get('ProfileSelector');
            const patientList = ProfileSelectorService.getConfirmedProfiles();
            let combinedArrays = [];
            let results = await Promise.all(patientList.map(patient => {
                if (!patient.patient_legacy_id) return Promise.resolve();
                return sendRequestWithResponse(typeOfRequest, parameters, null, null, null, patient.patient_legacy_id);
            }));

            results.forEach(result => {
                if (result && result.Data !== 'empty') combinedArrays = [...combinedArrays, ...result.Data.Announcements]
            });

            return {
                ...results[0],
                Data: {[categoryRequested]: combinedArrays}
            }
        }


        function sendRequestWithResponse(typeOfRequest, parameters, encryptionKey, referenceField, responseField, patientID) {
            return new Promise((resolve, reject) => {
                //Sends request and gets random key for request
                let key = sendRequest(typeOfRequest, parameters, encryptionKey, referenceField, patientID);
                //Sets the reference to fetch data for that request
                let refRequestResponse = (!referenceField) ? response_url.child(UserAuthorizationInfo.getUsername() + '/' + key) : firebase_url.child(responseField).child(key);
                //Waits to obtain the request data.
                refRequestResponse.on('value', snapshot => {
                    if (snapshot.exists()) {
                        let data = snapshot.val();
                        refRequestResponse.set(null);
                        refRequestResponse.off();
                        data = ResponseValidator.validate(data, encryptionKey, timeOut);
                        data.success ? resolve(data.success) : reject(data.error)
                    }
                }, error => {
                    refRequestResponse.set(null);
                    refRequestResponse.off();
                    reject(error);
                });

                // If request takes longer than 1.5 minutes to come back with timeout request, delete the listener
                const timeOut = setTimeout(function() {
                    refRequestResponse.off();
                    reject({Response:'timeout'});
                }, Params.requestTimeout);

            });
        };

        /**
         * @description Set the correct referentce field to cue request in the good listener's part.
         *              If reference field is provided user it, if requesType is `api` send the request
         *              to the new listener part, else use the default `request` legacy path.
         * @param {string} typeOfRequest Type of request to be process by the listener
         * @param {string} referenceField Specifies a type of request other than `api` or `request`
         * @returns The required reference field
         */
        function getReferenceField(typeOfRequest, referenceField) {
            if (referenceField) return referenceField;
            return typeOfRequest === 'api' ? 'api' : 'requests';
        }
        

        /**
         * @description Fill up request params to be send to the listener
         * @param {string} requestType Type of request, mainly use for the legacu listener section
         * @param {object} requestParameters Params for the request
         * @returns {object} Formated request parameters
         */
        function getRequestObject(requestType, requestParameters, typeOfRequest, patientID) {
            let params = {
                Request : requestType,
                DeviceId: UUID.getUUID(),
                Token: UserAuthorizationInfo.getToken(),
                UserID: UserAuthorizationInfo.getUsername(),
                Parameters: requestParameters,
                UserEmail: UserAuthorizationInfo.getEmail(),
                AppVersion: Constants.version(),
                Timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            // Add a target patient if the request type is for patient data
            if (Params.REQUEST.PATIENT_TARGETED_REQUESTS.includes(typeOfRequest)) params.TargetPatientID = patientID || getPatientId();
            return params;
        }

        /**
         * @description Get the patientSerNum from the currently selected profile, curently selected profile for multiple patient data loading
         *  or fallback to the old patient/user service patientSernum
         * @returns {number} The patientSerNum id required to make the request
         */
        function getPatientId() {
            const ProfileSelectorService = $injector.get('ProfileSelector');
            const selectedProfile = ProfileSelectorService.getActiveProfile();
            return selectedProfile?.patient_legacy_id || Patient.getPatientSerNum();
        }
}]);
