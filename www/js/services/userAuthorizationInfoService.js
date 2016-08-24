//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the authorization parameters for the user serssion
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:UserAuthorizationInfo
*@description Contains all the authorization data for the user
**/
myApp.service('UserAuthorizationInfo', function () {
    /**
     *@ngdoc property
    *@name  MUHCApp.service.#username
    *@propertyOf MUHCApp.service:UserAuthorizationInfo
    *@description Firebase Username property 
    **/
    var username = '';
    /**
     *@ngdoc property
    *@name  MUHCApp.service.#expires
    *@propertyOf MUHCApp.service:UserAuthorizationInfo
    *@description Firebase Username property 
    **/
    var expires = '';
    /**
     *@ngdoc property
    *@name  MUHCApp.service.#password
    *@propertyOf MUHCApp.service:UserAuthorizationInfo
    *@description Firebase session time expiration in milliseconds since epoch 
    **/
    var password='';
    /**
     *@ngdoc property
    *@name  MUHCApp.service.#token
    *@propertyOf MUHCApp.service:UserAuthorizationInfo
    *@description Hashed of password property
    **/
    var token='';
    /**
     *@ngdoc property
    *@name  MUHCApp.service.#identifier
    *@propertyOf MUHCApp.service:UserAuthorizationInfo
    *@description Device identifier property
    */
    var identifier = '';
    return {
        /**
        *@ngdoc method
        *@name setUserAuthData
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@param {String} user Username
        *@param {String} pass Hashed of password
        *@param {String} exp  Expires
        *@param {String} tok  Authentication token
        *@description Sets all the user authorization.
        */
        setUserAuthData: function (user, pass, exp, tok) {
            username= user;
            expires = exp;
            password=pass;
            token=tok;
            console.log(username, expires, password, token);
        },
        /**
        *@ngdoc method
        *@name setPassword
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@param {String} pass Hashed of password
        *@description Sets the user hashed password representation.
        */
        setPassword:function(pass){
            //Encode password
            pass=CryptoJS.SHA256(pass).toString();
            password=pass;
            //Retrieve UserAuthorizationInfo
            var passString=window.localStorage.getItem('UserAuthorizationInfo');
            var passObject = {};
            if(passString)
            {
                 //Parse to convert to object
                passObject=JSON.parse(passString);
                passObject.Password=password;
                //Save in storage
                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(passObject));
            }
           
        },
        /**
        *@ngdoc method
        *@name getUserAuthData
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {Object} Returns all the properties of the service as a single object.
        */
        getUserAuthData: function () {
            return {
                UserName: username,
                Expires: expires,
                Password:password,
                Token:token
            };
        },
        /**
        *@ngdoc method
        *@name getUserName
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {string} Returns Firebase username.
        */
        getUsername:function(){
            return username;
        },
        /**
        *@ngdoc method
        *@name getUserName
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {string} Returns device identifier.
        */
        getDeviceIdentifier:function()
        {
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                identifier=device.uuid;
            }else{
                identifier='browser';
            }
            return identifier;
        },
        /**
        *@ngdoc method
        *@name getPassword
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {string} Returns hashed of user password for encryption
        */
        getPassword:function(){
            return password;
        },
        /**
        *@ngdoc method
        *@name getExpires
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {number} Returns date in milliseconds
        */
        getExpires:function(){
            return expires;
        },
        /**
        *@ngdoc method
        *@name getToken
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@returns {string} Returns authentication token
        */
        getToken:function()
        {
          return token;
        },
        /**
        *@ngdoc method
        *@name clearUserAuthorizationInfo
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@description Clears service
        */
        clearUserAuthorizationInfo:function()
        {
             username = '';
             expires = '';
             password='';
             token='';
             identifier = '';
        }


};

});
