/**
 * @description Service that handles behavior related to the state of the app running on a device (active, inactive, reloaded).
 * @author Stacey Beard
 * @date 2021-09-09
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('AppState', AppState);

    AppState.$inject = ['Constants'];

    function AppState(Constants) {
        /*
         * Notes on events used (for more details, see "iOS Quirks" from https://cordova.apache.org/docs/en/latest/cordova/events/events):
         * For iOS the right events to use are active, resign; these are iOS-only events.
         * On Android we can use pause and resume but since these fire for iOS as well we have to make sure to only
         * run on Android. The pause and resume events may not work as well on iOS (e.g. if the Lock button is used).
         */

        /**
         * @description Keeps track of whether the app has been initialized, and is used to detect when the app
         *              has been reloaded to redirect it to the init screen (see RoutesConfiguration for details).
         * @type {boolean}
         */
        let appInitialized = false;

        let service = {
            addActiveEvent: addActiveEvent,
            addInactiveEvent: addInactiveEvent,
            isInitialized: () => appInitialized,
            setInitialized: value => appInitialized = value,
        };

        return service;

        /********************************/
        /******* PUBLIC FUNCTIONS *******/
        /********************************/

        /**
         * @description Adds an event listener that is called when the app becomes active (i.e. is brought back from the
         *              background). If called on a browser, this function does nothing.
         * @param {function} functionToRun The function to run when the event is triggered.
         */
        function addActiveEvent(functionToRun) {
            if (!Constants.app) return;

            // Event only affects iOS
            document.addEventListener('active', () => {
                setTimeout(functionToRun, 0);
            });

            // Only run on Android
            document.addEventListener('resume', () => {
                setTimeout(() => {
                    if(ons.platform.isAndroid()) functionToRun();
                }, 0);
            });

        }

        /**
         * @description Adds an event listener that is called when the app becomes inactive (i.e. is put in the
         *              background). If called on a browser, this function does nothing.
         * @param {function} functionToRun The function to run when the event is triggered.
         */
        function addInactiveEvent(functionToRun) {
            if (!Constants.app) return;

            // Event only affects iOS
            document.addEventListener('resign', () => {
                setTimeout(functionToRun, 0);
            });

            // Only run on Android
            document.addEventListener('pause', () => {
                setTimeout(() => {
                    if(ons.platform.isAndroid()) functionToRun();
                }, 0);
            });
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/
    }
})();
