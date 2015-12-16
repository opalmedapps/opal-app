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

    return {
        /**
        *@ngdoc method
        *@name setUserAuthData
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@description Sets all the user authorization.Called by the {@link MUHCApp.controller:LoginController LoginController} right after user enters credentials.
        */
        setUserAuthData: function (username, password, expires) {
            this.UserName = username;
            this.Expires = expires;
            this.Password=password;
        },
        setPassword:function(password){
            this.Password=password;
            window.localStorage.setItem('pass',password);
            var passString=window.localStorage.getItem('MUHCApp');
            passObject=JSON.parse(passString);
            passObject.UserAuthorizationInfo.Password=password;
            window.localStorage.setItem('MUHCApp', JSON.stringify(passObject));
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
                UserName: this.UserName,
                Expires: this.Expires,
                Password:this.Password
            };
        },
        getHashPassword:function()
        {
          return this.HashPassword;
        },
        /**
        *@ngdoc method
        *@name getUserName
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {string} User Id in Firebase.
        */
        getUserName:function(){
            return this.UserName;
        },
        /**
        *@ngdoc method
        *@name getPassword
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {string} Password User Password in Firebase for Encryption.
        */
        getPassword:function(){
            return this.Password;
        },
        /**
        *@ngdoc method
        *@name getExpires
        *@methodOf MUHCApp.services:UserAuthorizationInfo
        *@returns {number} Date Milliseconds from 1970 of the expiration time for authorization.
        */
        getExpires:function(){
            return this.Expires;
        }


}

});
