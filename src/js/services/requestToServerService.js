//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//


// TODO: I REALLY THINK SOMEONE SHOULD REFACTOR THIS FILE! IT WORKS FINE BUT I FIND IT'S RATHER DIFFICULT TO UNDERSTAND

var myApp = angular.module('MUHCApp');


myApp.service('RequestToServer',['Patient', 'UserAuthorizationInfo', 'EncryptionService',
    'FirebaseService', 'Constants', 'UUID', 'ResponseValidator', 'Params',
    function(Patient, UserAuthorizationInfo, EncryptionService, FirebaseService,
              Constants, UUID, ResponseValidator, Params){

        let firebase_url = FirebaseService.getDBRef();
        let response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));

        function sendRequest(typeOfRequest,parameters, encryptionKey, referenceField) {
            // update the firebase_url in case that the firebase url got changed
            firebase_url = FirebaseService.getDBRef();
            response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));

            let requestType;
            let requestParameters;

            // TODO: this makes a copy of the parameters to avoid encrypting the originals. Do this in the encryption function instead.
            if (parameters) parameters = JSON.parse(JSON.stringify(parameters));

            if (encryptionKey) {
                requestType = typeOfRequest;
                requestParameters = EncryptionService.encryptWithKey(parameters, encryptionKey);
            } else {
                requestType = EncryptionService.encryptData(typeOfRequest);
                requestParameters = EncryptionService.encryptData(parameters);
            }
            let request_object = {
                'Request' : requestType,
                'DeviceId': UUID.getUUID(),
                'Token':UserAuthorizationInfo.getToken(),
                'UserID': UserAuthorizationInfo.getUsername(),
                'Parameters':requestParameters,
                'UserEmail': UserAuthorizationInfo.getEmail(),
                'AppVersion': Constants.version(),
                'Timestamp':firebase.database.ServerValue.TIMESTAMP
            };
            // Add a target patient if the request type is for patient data
            // TODO Fetch from a dedicated service once the profile selector is added
            if (Params.REQUEST.PATIENT_TARGETED_REQUESTS.includes(typeOfRequest)) request_object.TargetPatientID = Patient.getPatientSerNum();

            let reference = referenceField || 'requests';
            let pushID =  firebase_url.child(reference).push(request_object);
            return pushID.key;
        }
        
        return {
            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey, referenceField, responseField) {
                return new Promise((resolve, reject) => {
                    //Sends request and gets random key for request
                    let key = sendRequest(typeOfRequest,parameters,encryptionKey, referenceField);
                    //Sets the reference to fetch data for that request
                    let refRequestResponse = (!referenceField) ?
                        response_url.child(UserAuthorizationInfo.getUsername() + '/' + key) :
                        firebase_url.child(responseField).child(key);

                    //Waits to obtain the request data.
                    refRequestResponse.on('value', snapshot => {
                        if (snapshot.exists()) {

                            let data = snapshot.val();

                            refRequestResponse.set(null);
                            refRequestResponse.off();

                            data = ResponseValidator.validate(data, encryptionKey, timeOut);

                            if (data.success) {
                                resolve(data.success)
                            } else {
                                reject(data.error)
                            }
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
            },
            sendRequest:function(typeOfRequest,content,key){
                return sendRequest(typeOfRequest,content,key);
            }
        };
}]);
