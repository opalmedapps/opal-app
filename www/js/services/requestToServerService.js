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
    'EncryptionService','FirebaseService','$q', 'Constants',
    function($filter,$state,NewsBanner,UserAuthorizationInfo, EncryptionService, FirebaseService,$q, Constants){

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#Ref
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference
         **/
        var Ref= firebase.database().ref('dev2/');
        console.log("Ref is " + Ref);
        /**
         *@ngdoc property
         *@name  MUHCApp.service.#refRequests
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference requests
         **/
        var refRequests = Ref.child('requests');
        /**
         *@ngdoc property
         *@name  MUHCApp.service.#refUsers
         *@propertyOf MUHCApp.service:RequestToServer
         *@description Firebase reference user response
         **/
        var refUsers = Ref.child('users');
        var app = Constants.app;
        function sendRequest(typeOfRequest,parameters, encryptionKey)
        {

            var defer = $q.defer()

            var requestType = '';
            var requestParameters;
            console.log(typeOfRequest);
            if(typeof encryptionKey!=='undefined'&&encryptionKey)
            {
                console.log(encryptionKey);
                requestType = typeOfRequest;
                requestParameters = EncryptionService.encryptWithKey(parameters,encryptionKey);
            }else{
                requestType = EncryptionService.encryptData(typeOfRequest);
                requestParameters = EncryptionService.encryptData(parameters);
            }
            //Push the request to firebase

            new Fingerprint2().get(function(result, components){
                console.log("Fingerprint ", result); //a hash, representing your device fingerprint
                //console.log(components); // an array of FP components

                //console.log({ 'Request' : requestType,'DeviceId':(app)?device.uuid:'browser','Token':UserAuthorizationInfo.getToken(),  'UserID': UserAuthorizationInfo.getUsername(), 'Parameters':requestParameters,'Timestamp':firebase.database.ServerValue.TIMESTAMP});
                var pushID =  refRequests.push({ 'Request' : requestType,'DeviceId':(app)?device.uuid:result,'Token':UserAuthorizationInfo.getToken(),  'UserID': UserAuthorizationInfo.getUsername(), 'Parameters':requestParameters,'Timestamp':firebase.database.ServerValue.TIMESTAMP});
                defer.resolve(pushID.key);

            });

            return defer.promise;

        }

        return{
            /**
             *@ngdoc method
             *@name sendRequestWithResponse
             *@methodOf MUHCApp.service:RequestToServer
             *@param {String} typeOfRequest Type of request
             *@param {Object} parameters Object to be sent to backend as request parameter
             *@param {String} encryptionKey If defined, its used as a encryption key for data, if not defined, the password hashed is used instead.
             *@returns {Promise} If data returns and the data was processed with a code 1 then it resolves to the data, otherwise it rejects with the
             *error given by the request response
             *@description Sends request to server, awaits for response, and returns with the results from server.
             **/
            sendRequestWithResponse:function(typeOfRequest, parameters, encryptionKey)
            {
                var r = $q.defer();
                console.log(encryptionKey);
                console.log(typeOfRequest);
                //Sends request and gets random key for request
                sendRequest(typeOfRequest,parameters,encryptionKey)
                    .then(function (key) {
                        //Sets the reference to fetch data for that request
                        var refRequestResponse = refUsers.child(UserAuthorizationInfo.getUsername()+'/'+key);
                        console.log(refRequestResponse.toString());
                        //Waits to obtain the request data.
                        console.log('users/'+UserAuthorizationInfo.getUsername()+'/'+key);
                        refRequestResponse.on('value',function(snapshot){
                            if(snapshot.exists())
                            {
                                console.log(' I am inside response');
                                var data = snapshot.val();
                                var timestamp = data.Timestamp;
                                if(data.Code =='1')
                                {
                                    NewsBanner.showCustomBanner($filter('translate')("AUTHENTICATIONERROR"),'#333333',null,20000);
                                    $state.go('logOut');
                                    r.reject({Response:'AUTH_ERROR'});
                                }else{
                                    if(!encryptionKey||typeof encryptionKey == 'undefined') data = EncryptionService.decryptData(data);
                                    data.Timestamp = timestamp;
                                    console.log(data);
                                    clearTimeout(timeOut);
                                    refRequestResponse.set(null);
                                    refRequestResponse.off();
                                    if(data.Code =='3')
                                    {
                                        r.resolve(data);
                                    }else if(data.Code == '2'){
                                        r.reject(data);
                                    }
                                }
                            }
                        },function(error)
                        {
                            console.log('Firebase reading error', error);
                            r.reject(error);
                        });
                        //If request takes longer than 20000 to come back with timedout request, delete reference
                        var timeOut = setTimeout(function()
                        {
                            console.log('Inside timeout function');
                            refRequestResponse.set(null);
                            refRequestResponse.off();
                            r.reject({Response:'timeout'});
                        },20000);
                    });
                return r.promise;
            },
            /**
             *@ngdoc method
             *@name sendRequest
             *@methodOf MUHCApp.service:RequestToServer
             *@param {String} typeOfRequest Type of request
             *@param {Object} parameters Object to be sent to backend as request parameter
             *@description Sends request to server
             **/
            sendRequest:function(typeOfRequest,content){
                sendRequest(typeOfRequest,content);
            }
        };



    }]);
