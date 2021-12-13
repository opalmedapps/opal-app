/**
 * @description API to display notification popups using OnsenUI.
 *              Reference: https://onsen.io/v1/reference/ons.notification.html
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('NativeNotification', NativeNotification);

    NativeNotification.$inject = ['$filter'];

    function NativeNotification($filter) {

        let currentAlert = null;

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#mod
         *@propertyOf MUHCApp.service:NativeNotification
         *@description string representing the style for the alert, 'material' for Android and undefined for IOS
         **/
        const mod = (ons.platform.isAndroid()) ? 'material' : undefined;

        return {
            showNotificationAlert: showNotificationAlert,
        };

        /**
         *@ngdoc method
         *@name showNotificationAlert
         *@methodOf MUHCApp.service:NativeNotification
         *@param {String} message Alert message to be displayed
         *@param {function} [callback] - Optional. Called when the OK button is pressed.
         *@description Displays message as a native looking alert
         **/
        function showNotificationAlert(message, callback) {
            if(currentAlert && message === currentAlert) return;
            currentAlert = message;
            ons.notification.confirm({
                message: message,
                modifier: mod,
                title: $filter('translate')("ALERT"),
                buttonLabels: [$filter('translate')("OK_BUTTON")],
                callback: (idx) => {
                    currentAlert = null;
                    if (callback) callback();
                }
            });
        }
    }
})();
