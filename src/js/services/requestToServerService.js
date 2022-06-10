//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

const { val } = require("angular-ui-router");


// TODO: I REALLY THINK SOMEONE SHOULD REFACTOR THIS FILE! IT WORKS FINE BUT I FIND IT'S RATHER DIFFICULT TO UNDERSTAND

var myApp = angular.module('MUHCApp');


myApp.service('RequestToServer',['UserAuthorizationInfo', 'EncryptionService',
    'FirebaseService', 'Constants', 'UUID', 'ResponseValidator', 'Params',
    function( UserAuthorizationInfo, EncryptionService, FirebaseService,
              Constants, UUID, ResponseValidator, Params){

        let firebase_url;
        let response_url;
        
        function sendRequest(typeOfRequest, parameters, encryptionKey, referenceField) {
            // update the firebase_url in case that the firebase url got changed
            firebase_url = FirebaseService.getDBRef();
            response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));
            // TODO: this makes a copy of the parameters to avoid encrypting the originals. Do this in the encryption function instead.
            if (parameters) parameters = JSON.parse(JSON.stringify(parameters));
            let requestType = encryptionKey ? typeOfRequest : EncryptionService.encryptData(typeOfRequest);
            let requestParameters = encryptionKey ? EncryptionService.encryptWithKey(parameters, encryptionKey) : EncryptionService.encryptData(parameters);
            let request_object = getRequestObject(requestType, requestParameters);
            let reference = getReferenceField(typeOfRequest, referenceField)
            let pushID =  firebase_url.child(reference).push(request_object);
            return pushID.key;
        }

        function sendRequestWithResponse(typeOfRequest, parameters, encryptionKey, referenceField, responseField) {
            return new Promise((resolve, reject) => {
                //Sends request and gets random key for request
                let key = sendRequest(typeOfRequest, parameters, encryptionKey, referenceField);
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
        

        function getRequestObject(requestType, requestParameters) {
            return {
                Request : requestType,
                DeviceId: UUID.getUUID(),
                Token: UserAuthorizationInfo.getToken(),
                UserID: UserAuthorizationInfo.getUsername(),
                Parameters: requestParameters,
                UserEmail: UserAuthorizationInfo.getEmail(),
                AppVersion: Constants.version(),
                Timestamp: firebase.database.ServerValue.TIMESTAMP
            };
        }

        return {
            sendRequestWithResponse: sendRequestWithResponse,
            sendRequest: sendRequest
        };
}]);
