//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the authorization parameters for the user serssion

/**
*@ngdoc service
*@description Contains all the authorization data for the user
**/
angular
    .module('OpalApp')
    .service('UserAuthorizationInfo', UserAuthorizationInfo);

UserAuthorizationInfo.$inject = ['Constants'];

function UserAuthorizationInfo(Constants) {
    /**
     *@ngdoc property
    *@description Firebase Username property 
    **/
    var username = '';
    /**
     *@ngdoc property
    *@description Firebase Username property 
    **/
    var expires = '';
    /**
     *@ngdoc property
    *@description Hash of the user's password
    **/
    var password='';
    /**
     *@ngdoc property
     *@description Email property
     */
    var email = '';
    /**
     * @ngdoc property
     * @description whether the device is trusted or not
     * @type {boolean}
     */
    var trusted = false;

    return {
        getUsername: () => username,
        getEmail: () => email,
        getPassword: () => password,
        getTrusted: () => trusted,

        /**
        *@ngdoc method
        *@name setUserAuthData
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
         *@name setEmail
         *@description  Sets user email
         */
        setEmail:function(Email)
        {
            email =  Email;
        },
        /**
        *@ngdoc method
        *@name clearUserAuthorizationInfo
        *@description Clears service
        */
        clearUserAuthorizationInfo:function()
        {
             username = '';
             expires = '';
             password = '';
        },
    }
}
