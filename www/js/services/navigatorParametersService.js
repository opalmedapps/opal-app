//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:NavigatorParameters
 *@description Used to pass parameters between Navigators, the Onsen navigator options are not good enough because the controller you navigate to has to know the navigator that's currently in, this is possible but the code becomes
 very messy with a bunch of if and else clauses, this service makes things rather simple, its simply cleaner. For more info on navigator see: {@link https://onsen.io/v1/reference/ons-navigator.html Onsen Navigation}.
 **/
myApp.service('NavigatorParameters',function(){
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#parameters
     *@propertyOf MUHCApp.service:NavigatorParameters
     *@description Object that represents the parameters
     **/
    var navigator = null;
    var parameters = null;
    return{
        /**
         *@ngdoc method
         *@name setParameters
         *@methodOf MUHCApp.service:NavigatorParameters
         *@param {Object} param Parameters object, it always specifies as a property the current navigator.
         *@description Simply sets the parameters object
         **/
        setParameters:function(param)
        {
            parameters=param;
        },
        /**
         *@ngdoc method
         *@name setParameters
         *@methodOf MUHCApp.service:NavigatorParameters
         *@param {Object} nav The current navigator
         *@description Simply sets the navigator
         **/
        setNavigator:function(nav)
        {
            navigator=nav;
        },
        /**
         *@ngdoc method
         *@name getParameters
         *@methodOf MUHCApp.service:NavigatorParameters
         *@return {Object} Returns parameter object.
         **/
        getParameters:function()
        {
            return parameters;
            /*parameters={};
             return object;*/
        },
        /**
         *@ngdoc method
         *@name getParameters
         *@methodOf MUHCApp.service:NavigatorParameters
         *@return {Object} Returns navigator object.
         **/
        getNavigator:function()
        {
            return navigator;
        }
    };


});
