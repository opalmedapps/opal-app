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

            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey, referenceField, responseField) { //, url, url_params) {
                return new Promise((resolve, reject) => {
                    // TODO: Delete these two if-statements and the last two parameters of the function when the database for questions is ready
                    // if (url != null) {
                    //     var settings = {
                    //         "async": true,
                    //         "crossDomain": true,
                    //         "url": url,
                    //         "method": "POST",
                    //         "headers": {
                    //             "content-type": "application/x-www-form-urlencoded",
                    //             "cache-control": "no-cache",
                    //             "postman-token": "1230e50a-37dc-5b3f-30a2-f60257a1d464"
                    //         }
                    //     }
                    //
                    //     if (url_params != null) {
                    //         settings["data"] = {};
                    //         for (var key in url_params) {
                    //             if(url_params.hasOwnProperty(key)) {
                    //                 //console.log("Key: " + key + ", Value: " + url_params[key]);
                    //                 settings.data[key] = url_params[key];
                    //             }
                    //         }
                    //         console.log(settings.data);
                    //     }
                    //
                    //     $.ajax(settings).done(function(response) {
                    //         resolve(response[0].data);
                    //     });
                    // }
                    // else {
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

                    //If request takes longer than 30000 to come back with timeout request, delete reference
                    const timeOut = setTimeout(function() {
                        response_url.set(null);
                        response_url.off();
                        reject({Response:'timeout'});
                    }, 30000);
                        //}
                }).catch(err=> console.log(err));
            },

            sendRequest:function(typeOfRequest,content,key){
                sendRequest(typeOfRequest,content,key);
            }
        };
}]);
