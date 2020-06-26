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
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#email
     *@propertyOf MUHCApp.service:UserAuthorizationInfo
     *@description Email property
     */
    var email = '';
    /**
     * @ngdoc property
     * @name  MUHCApp.service.#trusted
     * @propertyOf MUHCApp.service:UserAuthorizationInfo
     * @description whether the device is trusted or not
     * @type {boolean}
     */
    var trusted = false;

    return {
        /**
        *@ngdoc method
        *@name setUserAuthData
        *@methodOf MUHCApp.service:UserAuthorizationInfo
        *@param {String} user Username
        *@param {String} pass Hashed of password
        *@param {String} exp  Expires
        *@param {String} tok  Authentication token
        *@param {boolean} trustedDevice whether the device is trusted or not
        *@description Sets all the user authorization.
        */
        setUserAuthData: function (user, pass, exp, tok, Email, trustedDevice) {
            username= user;
            password=pass;
            expires = exp;
            token=tok;
            email = Email;
            trusted = trustedDevice;
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
            pass=CryptoJS.SHA512(pass).toString();
            password=pass;
           
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
         *@name getEmail
         *@methodOf MUHCApp.service:UserAuthorizationInfo
         *@returns {string} Returns user email
         */
        getEmail:function()
        {
            return email;
        },
        /**
         *@ngdoc method
         *@name setEmail
         *@methodOf MUHCApp.service:UserAuthorizationInfo
         *@description  Sets user email
         */
        setEmail:function(Email)
        {
            email =  Email;
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
        },
        /**
         *@ngdoc method
         *@name getTrusted
         *@methodOf MUHCApp.service:UserAuthorizationInfo
         *@returns {boolean} Returns trusted flag
         */
        getTrusted: function () {
            return trusted;
        }
};

});
