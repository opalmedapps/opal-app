//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//


// TODO: I REALLY THINK SOMEONE SHOULD REFACTOR THIS FILE! IT WORKS FINE BUT I FIND IT'S RATHER DIFFICULT TO UNDERSTAND

var myApp = angular.module('MUHCApp');


myApp.service('RequestToServer',['$filter','$state','NewsBanner','UserAuthorizationInfo', 'EncryptionService',
    'FirebaseService','$q', 'Constants', 'UUID', 'ResponseValidator',
    function($filter, $state, NewsBanner, UserAuthorizationInfo, EncryptionService, FirebaseService,
             $q, Constants, UUID, ResponseValidator){


        const firebase_url= firebase.database().ref(FirebaseService.getFirebaseUrl(null));
        const response_url = firebase_url.child(FirebaseService.getFirebaseChild('users'));

        function sendRequest(typeOfRequest,parameters, encryptionKey, referenceField) {
            return new Promise((resolve) => {
                let requestType;
                let requestParameters;

                if (encryptionKey) {
                    requestType = typeOfRequest;
                    requestParameters = EncryptionService.encryptWithKey(parameters, encryptionKey);
                } else {
                    requestType = EncryptionService.encryptData(typeOfRequest);
                    requestParameters = EncryptionService.encryptData(parameters);
                }

                Constants.version()
                    .then(version=> {
                        let request_object = {
                            'Request' : requestType,
                            'DeviceId': UUID.getUUID(),
                            'Token':UserAuthorizationInfo.getToken(),
                            'UserID': UserAuthorizationInfo.getUsername(),
                            'Parameters':requestParameters,
                            'Timestamp':firebase.database.ServerValue.TIMESTAMP,
                            'UserEmail': UserAuthorizationInfo.getEmail(),
                            'AppVersion': version
                        };

                        let reference = referenceField || 'requests';
                        let pushID =  firebase_url.child(reference).push(request_object);
                        resolve(pushID.key);
                    });
            });
        }

        return {

            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey, referenceField, responseField) {
                return new Promise((resolve, reject) => {

                    //Sends request and gets random key for request
                    sendRequest(typeOfRequest,parameters,encryptionKey, referenceField)
                        .then(key=> {

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
                                console.log(error);
                                refRequestResponse.set(null);
                                refRequestResponse.off();
                                reject(error);
                            });
                    });

                    //If request takes longer than 1.5 minutes to come back with timeout request, delete reference
                    const timeOut = setTimeout(function() {
                        response_url.set(null);
                        response_url.off();
                        reject({Response:'timeout'});
                    }, 90000);

                }).catch(err=> console.log(err));
            },

            sendRequest:function(typeOfRequest,content,key){
                sendRequest(typeOfRequest,content,key);
            }
        };
}]);
