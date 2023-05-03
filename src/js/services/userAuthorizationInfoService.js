//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the authorization parameters for the user serssion

/**
*@ngdoc service
*@name MUHCApp.service:UserAuthorizationInfo
*@description Contains all the authorization data for the user
**/
angular
    .module('MUHCApp')
    .service('UserAuthorizationInfo', UserAuthorizationInfo);

UserAuthorizationInfo.$inject = ['Constants'];

function UserAuthorizationInfo(Constants) {
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
        *@param {String} userEmail The user's email address, used to log in
        *@param {boolean} trustedDevice whether the device is trusted or not
        *@description Sets all the user authorization.
        */
        setUserAuthData: function (user, pass, exp, userEmail, trustedDevice) {
            username = user;
            password = pass;
            expires = exp;
            email = userEmail;
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
            identifier = Constants.app ? device.uuid : 'browser';
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
             password = '';
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
    }
}
