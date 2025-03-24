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
myApp.service('NavigatorParameters', ['ProfileSelector', 'UpdateUI', function(ProfileSelector, UpdateUI){
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
         * @desc Updates some values of the saved parameters. Parameters that are not given a new value are left as-is.
         * @param {Object} newParams Object containing the parameters to update (keys and new values).
         */
        updateParameters: newParams => {
            parameters = {
                ...parameters,
                ...newParams,
            }
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
         *@name getNavigator
         *@methodOf MUHCApp.service:NavigatorParameters
         *@return {Object} Returns navigator object.
         **/
        getNavigator:function()
        {
            return navigator;
        },
        /**
         *@ngdoc method
         *@name getNavigatorName
         *@methodOf MUHCApp.service:NavigatorParameters
         *@return {Object} Returns the name of the navigator.
         **/
        getNavigatorName:function()
        {
            return navigator._attrs.var;
        },
        /**
         *@ngdoc method
         *@name prepopHandler
         *@methodOf MUHCApp.service:NavigatorParameters
         *@param {string| Array<string>} categories - The category or categories to update.
         *@return {Object} Returns a handler function for the prepop event.
         **/
         prepopHandler:function(categories)
         {
            // Patient profile that was active/set on the previous page
            let prevPageProfileID = this.getParameters()?.currentProfile;
            let previousProfile = ProfileSelector.getPatientList().find(
                (item) => item.patient_legacy_id == prevPageProfileID
            )
             // Reload profile that was active/set on the previous page
             if (
                this.getParameters()?.isCareReceiver
                && previousProfile
            ) {
                ProfileSelector.loadPatientProfile(prevPageProfileID);

                // Reload given categories for the current user
                UpdateUI.updateTimestamps(categories, 0);
            }
         },
    };


}]);
