//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//


// TODO: I REALLY THINK SOMEONE SHOULD REFACTOR THIS FILE! IT WORKS FINE BUT I FIND IT'S RATHER DIFFICULT TO UNDERSTAND

var myApp=angular.module('MUHCApp');

/**
 *@ngdoc service
 *@name MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:NewsBanner
 *@requires MUHCApp.service:UserAuthorizationInfo
 *@requires MUHCApp.service:EncryptionService
 *@requires MUHCApp.service:FirebaseService
 *@requires $filter
 *@requires $state
 *@requires $q
 *@desc API service used to send requests to the server. Every request is encrypted and sent.
 **/
myApp.service('RequestToServer',['$filter','$state','NewsBanner','UserAuthorizationInfo', 'EncryptionService',
    'FirebaseService','$q', 'Constants', 'UUID', 'ResponseValidator',
    function($filter, $state, NewsBanner, UserAuthorizationInfo, EncryptionService, FirebaseService,
             $q, Constants, UUID, ResponseValidator){

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#firebase_url
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference
         */

        const firebase_url = firebase.database().ref(FirebaseService.getFirebaseUrl(null));

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#response_url
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference user response
         */
        const response_url = firebase_url.child(FirebaseService.getFirebaseChild('users'));

        function sendRequest(typeOfRequest,parameters, encryptionKey, referenceField) {
            return new Promise(resolve => {
                let requestType;
                let requestParameters;

                if (encryptionKey) {
                    requestType = typeOfRequest;
                    requestParameters = EncryptionService.encryptWithKey(parameters, encryptionKey);
                }
                else{
                    requestType = EncryptionService.encryptData(typeOfRequest);
                    requestParameters = EncryptionService.encryptData(parameters);
                }

                //Push the request to firebase
                Constants.version()
                    .then(version => {

                        console.log("version" + version);

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
            })

        }

        return {
            /**
             *@ngdoc method
             *@name sendRequestWithResponse
             *@methodOf MUHCApp.service:RequestToServer
             *@param {String} typeOfRequest Type of request
             *@param {Object} parameters Object to be sent to backend as request parameter
             *@param {String} encryptionKey If defined, its used as a encryption key for data, if not defined, the password hashed is used instead.
             *@param {String} referenceField The reference to the request firebase field
             *@param {String} responseField The reference to the response firebase field
             *@returns {Promise} If data returns and the data was processed with a code 1 then it resolves to the data, otherwise it rejects with the
             *error given by the request response
             *@description Sends request to server, awaits for response, and returns with the results from server.
             */
            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey, referenceField, responseField) {
                return new Promise((resolve, reject)=> {
                    //Sends request and gets random key for request
                    sendRequest(typeOfRequest,parameters,encryptionKey, referenceField)
                        .then(key=> {

                            console.log("key: " + key);

                            //Sets the reference to fetch data for that request
                            let refRequestResponse = (!referenceField) ?
                                response_url.child(UserAuthorizationInfo.getUsername()+'/'+key) :
                                firebase_url.child(responseField).child(key);


                            console.log("path: ", refRequestResponse);

                            //Waits to obtain the request data.
                            refRequestResponse.on('value', snapshot => {
                                if(snapshot.exists()) {

                                    console.log("data (snap): ", snapshot.val());

                                    let data = snapshot.val();

                                    refRequestResponse.set(null);
                                    refRequestResponse.off();

                                    console.log(data);

                                    data = ResponseValidator.validate(data, encryptionKey, timeOut);

                                    console.log(data);

                                    if (data.success){
                                        resolve(data.success)
                                    } else {
                                        reject(data.error)
                                    }
                                } else {
                                    console.log("data (non-snap): ", snapshot)
                                }
                            }, error => {
                                console.log(error);
                                refRequestResponse.set(null);
                                refRequestResponse.off();
                                reject(error);
                            });

                            //If request takes longer than 30000 to come back with timeout request, delete reference
                            const timeOut = setTimeout(function() {
                                refRequestResponse.set(null);
                                refRequestResponse.off();
                                reject({Response:'timeout'});
                            }, 30000);

                        }).catch(err=> console.log(err));
                });
            },

            /**
             *@ngdoc method
             *@name sendRequest
             *@methodOf MUHCApp.service:RequestToServer
             *@param {String} typeOfRequest Type of request
             *@param {Object} content Object to be sent to backend as request parameter
             * @param {String} key Encryption key
             *@description Sends request to server
             */
            sendRequest:function(typeOfRequest,content,key){
                sendRequest(typeOfRequest,content,key);
            }
        };
    }]);
