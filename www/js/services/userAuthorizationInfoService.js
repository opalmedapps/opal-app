//Defines the authorization parameters for the user serssion
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:UserAuthorizationInfo
*@description Contains all the authorization data for the user. Used in the {@link MUHCApp.services:UpdateUI UpdateUI}, {@link MUHCApp.controller:LogOutController LogOutController}, and {@link MUHCApp.services:UserMessages UserMessages}.
*initially set up in the {@link MUHCApp.controller:LoginController LoginController} after user enters credentials.
**/
myApp.service('UserAuthorizationInfo', function () {
    /**
    *@ngdoc property
    *@name UserName
    *@propertyOf MUHCApp.services:UserAuthorizationInfo
    *@description Contains Firebase user id.
    */
     /**
    *@ngdoc property
    *@name Password
    *@propertyOf MUHCApp.services:UserAuthorizationInfo
    *@description Contains user password for encryption
    */
     /**
    *@ngdoc property
    *@name Expires
    *@propertyOf MUHCApp.services:UserAuthorizationInfo
    *@description Contains when the user authorization expires based on Firebase settings
    */
    var username = '';
    var expires = '';
    var password='';
    var token='';
    var identifier = '';
    return {
        /**
        *@ngdoc method
        *@name setUserAuthData
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@description Sets all the user authorization.Called by the {@link MUHCApp.controller:LoginController LoginController} right after user enters credentials.
        */
        setUserAuthData: function (user, pass, exp, tok) {
            username= user;
            expires = exp;
            password=pass;
            token=tok;
            console.log(username, expires, password, token);
        },
        setPassword:function(pass){
            pass=CryptoJS.SHA256(pass).toString();
            password=pass;
            console.log(password);
            window.localStorage.setItem('pass',password);
            var passString=window.localStorage.getItem('UserAuthorizationInfo');
            var passObject=JSON.parse(passString);
            if(passObject)
            {
                passObject=JSON.parse(passString);
                passObject.Password=password;
                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(passObject));
            }
           
        },
          /**
        }
        *@ngdoc method
        *@name getUserAuthData
        *@methodOf MUHCApp.services:UserAuthorizationInfo
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
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {string} User Id in Firebase.
        */
        getUsername:function(){
            return username;
        },
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
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {string} Password User Password in Firebase for Encryption.
        */
        getPassword:function(){
            return password;
        },
        /**
        *@ngdoc method
        *@name getExpires
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {number} Date Milliseconds from 1970 of the expiration time for authorization.
        */
        getExpires:function(){
            return expires;
        },
        getToken:function()
        {
          return token;
        },
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
