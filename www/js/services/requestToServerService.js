//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
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
 *@description API service used to send requests to the server. Every request is encrypted and sent.
 **/
myApp.service('RequestToServer',['$filter','$state','NewsBanner','UserAuthorizationInfo',
    'EncryptionService','FirebaseService','$q', 'Constants', 'UUID',
    function($filter,$state,NewsBanner,UserAuthorizationInfo, EncryptionService, FirebaseService, $q, Constants, UUID){

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#Ref
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference
         **/
        var Ref= firebase.database().ref(FirebaseService.getFirebaseUrl(null));

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#refUsers
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference user response
         **/
        var refUsers = Ref.child(FirebaseService.getFirebaseChild('users'));

        function sendRequest(typeOfRequest,parameters, encryptionKey, referenceField) {
            var requestType = '';
            var requestParameters;
            if (typeof encryptionKey !== 'undefined' && encryptionKey) {

                requestType = typeOfRequest;
                requestParameters = EncryptionService.encryptWithKey(parameters, encryptionKey);
            }
            else{
                requestType = EncryptionService.encryptData(typeOfRequest);
                requestParameters = EncryptionService.encryptData(parameters);
            }
            //Push the request to firebase

            var toSend = {
                'Request' : requestType,
                'DeviceId': UUID.getUUID(),
                'Token':UserAuthorizationInfo.getToken(),
                'UserID': UserAuthorizationInfo.getUsername(),
                'Parameters':requestParameters,
                'Timestamp':firebase.database.ServerValue.TIMESTAMP,
                'UserEmail': UserAuthorizationInfo.getEmail()
            };

            var reference = referenceField || 'requests';

            var pushID =  Ref.child(reference).push(toSend);
            return pushID.key;
        }

        return{
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
             **/
            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey, referenceField, responseField)
            {
                var r = $q.defer();

                //Sends request and gets random key for request
                var key = sendRequest(typeOfRequest,parameters,encryptionKey, referenceField);

                //Sets the reference to fetch data for that request
                var refRequestResponse;
                if(!referenceField){
                    refRequestResponse = refUsers.child(UserAuthorizationInfo.getUsername()+'/'+key);
                } else {
                    refRequestResponse = Ref.child(responseField).child(key);
                }


                //Waits to obtain the request data.
                //
                refRequestResponse.on('value',function(snapshot){
                    if(snapshot.exists())
                    {
                        var data = snapshot.val();

                        console.log(JSON.stringify(data));

                        var timestamp = data.Timestamp;
                        if(data.Code == '1')
                        {
                            r.reject({Response:'ENCRYPTION_ERROR'});
                        }else{

                            if(!encryptionKey||typeof encryptionKey == 'undefined') data = EncryptionService.decryptData(data);
                            data.Timestamp = timestamp;

                            clearTimeout(timeOut);
                            refRequestResponse.set(null);
                            refRequestResponse.off();
                            if(data.Code == '3')
                            {
                                r.resolve(data);
                            }else if(data.Code == '2'){
                                r.reject(data);
                            }
                        }
                    }
                },function(error)
                {

                    r.reject(error);
                });
                //If request takes longer than 30000 to come back with timedout request, delete reference
                var timeOut = setTimeout(function()
                {

                    refRequestResponse.set(null);
                    refRequestResponse.off();
                    r.reject({Response:'timeout'});
                },30000);
                return r.promise;
            },
            /**
             *@ngdoc method
             *@name sendRequest
             *@methodOf MUHCApp.service:RequestToServer
             *@param {String} typeOfRequest Type of request
             *@param {Object} content Object to be sent to backend as request parameter
             * @param {String} key Encryption key
             *@description Sends request to server
             **/
            sendRequest:function(typeOfRequest,content,key){
                sendRequest(typeOfRequest,content,key);
            }
        };
    }]);
