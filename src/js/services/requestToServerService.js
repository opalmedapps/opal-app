//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//


// TODO: I REALLY THINK SOMEONE SHOULD REFACTOR THIS FILE! IT WORKS FINE BUT I FIND IT'S RATHER DIFFICULT TO UNDERSTAND

var myApp = angular.module('MUHCApp');


myApp.service('RequestToServer',['UserAuthorizationInfo', 'EncryptionService',
    'FirebaseService', 'Constants', 'UUID', 'ResponseValidator',
    function( UserAuthorizationInfo, EncryptionService, FirebaseService,
              Constants, UUID, ResponseValidator){

        let firebase_url = FirebaseService.getDBRef();
        let response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));

        function sendRequest(typeOfRequest,parameters, encryptionKey, referenceField) {
            // update the firebase_url in case that the firebase url got changed
            firebase_url = FirebaseService.getDBRef();
            response_url = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('users'));

            let requestType;
            let requestParameters;

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

                    //If request takes longer than 1.5 minutes to come back with timeout request, delete reference
                    const timeOut = setTimeout(function() {
                        response_url.set(null);
                        response_url.off();
                        reject({Response:'timeout'});
                    }, 90000);

                });
            },
            sendRequest:function(typeOfRequest,content,key){
                return sendRequest(typeOfRequest,content,key);
            }
        };
}]);
