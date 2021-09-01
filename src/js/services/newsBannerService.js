//
// Based on NewsBannerService by David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
// Rewritten by Stacey Beard in August 2021 to add custom toasts
//
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('NewsBanner', NewsBanner);

    NewsBanner.$inject = ['$filter', '$timeout', '$translatePartialLoader', 'Constants', 'Params', 'UserPreferences'];

    /**
     *@ngdoc service
     *@name MUHCApp.service:NewsBanner
     *@requires $filter
     *@requires $translatePartialLoader
     *@description Provides an API though which to display toast messages on the screen.
     *             For more information on the plugin, {@link https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin Cordova Toast Plugin}
     **/
    function NewsBanner($filter, $timeout, $translatePartialLoader, Constants, Params, UserPreferences) {

        // Adds the top-view translation tables in order to always display the alert banners correctly.
        $translatePartialLoader.addPart('top-view');

        const defaultOptions = {
            duration: "automatic",
            message: "", // Should be provided by the caller
            position: 'top',
            callback: null,
            backgroundColor: '#333333', // make sure you use #RRGGBB
            textColor: '#FFFFFF', // make sure you use #RRGGBB
            fontSize: "automatic"
        };

        // Font sizes used for toasts (in pixels); doesn't necessarily match the numeric values in app.css
        const automaticFontSizes = {
            loggedOut: 14,
            medium: 12,
            large: 14,
            xlarge: 18,
        };

        // The queue of messages to be shown
        const toastQueue = [];

        let service = {
            showCustomBanner: showCustomBanner,
            showToast: showToast,
        };

        return service;

        /********************************/
        /******* PUBLIC FUNCTIONS *******/
        /********************************/

        /**
         * @description Shows a toast message using the platform's supported option (either via a cordova plugin or
         *              a custom HTML/CSS object).
         *              Messages are added to a queue to prevent overlap and to be shown in order.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} options - An object containing configuration options for the toast message.
         * @param {string} options.message - (required) The message to be shown. Should already be translated.
         * @param {number|string} [options.duration] - (optional; default = "automatic") Either a number representing
         *                        the number of milliseconds to display the toast message (including 0.5 seconds each of
         *                        fade-in and fade-out time), or the string "automatic", indicating that the duration
         *                        should be calculated automatically based on the message length.
         *                        Using "automatic" is recommended.
         * @param {string} [options.textColor] - (optional; default = "#FFFFFF", i.e. white) A color in #RRGGBB format
         *                 representing the color of the toast text.
         * @param {number|string} [options.fontSize] - (optional; default = "automatic") Either a number representing
         *                        the toast's font size in pixels, or the string "automatic", indicating that the value
         *                        should scale according to the user's preferred font size.
         *                        Using "automatic" is recommended.
         * @param {function} [options.callback] - (optional; default = null) A function to call after the toast has
         *                   finished displaying.
         * @param {string} [options.backgroundColor] - (optional; default = "#333333", i.e. dark grey) A color in
         *                 #RRGGBB format representing the color of the toast background.
         * @param {string} [options.position] - (optional; default = "top") The location at which to display the toast.
         *                 Options are: 'top', 'bottom'.
         */
        function showToast(options) {
            // TODO validate input options

            if (!options.message) {
                console.warning("Tried to display an empty toast message");
                return;
            }

            // Add the toast to the queue to be shown after any others that are already displaying
            toastQueue.push(options);

            // If the toast is the only one in the queue, display it (if not, it will display after the others)
            if (toastQueue.length === 1) {
                console.log("Start queue");
                showNextToast();
            }
        }

        /**
         *@ngdoc method
         *@name showCustomBanner
         *@methodOf MUHCApp.service:NewsBanner
         *@param {String} message Message for the alert
         *@param {String}  Background Color for the alert
         *@param {String}  Text Color for the alert
         *@param {String}  Position for the alert
         *@param {Function} callback Callback function for the alert
         *@param {Number} duration Duration in milliseconds
         *@description Displays alert based on the parameters
         **/
        function showCustomBanner(messageValue,backgroundColorValue, textColorValue, textSizeValue, positionValue, callbackValue, durationValue){
            if(Constants.app)
            {
                showCustomBannerPrivate(messageValue,backgroundColorValue, textColorValue, textSizeValue, positionValue, callbackValue, durationValue);
            }
            else console.log("Toast message:\n" + messageValue);
            //else showCustomToast(messageValue, durationValue);
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/

        /**
         * @author Stacey Beard
         * @date 2021-08-12
         * @desc Determines whether the current platform is able to display toast messages.
         * @returns {boolean} True if toasts can be used; false otherwise.
         */
        function platformSupportsToast() {
            // TODO this function will be removed in a later commit; for now, block all native toasts.
            return false;
        }

        // Adapted from source: https://www.w3schools.com/howto/howto_js_snackbar.asp
        async function showCustomToast(toast) {
            return new Promise(resolve => {
                console.log(`TIME [${toast.duration}] for [${toast.message}]`);

                // Get the toast divs
                let toastContainer = document.getElementById("custom-toast-container");
                let toastElement = document.getElementById("custom-toast");

                // TODO add param to shift this by y pixels
                // Move the toast container to the correct position
                if (toast.position === "top") {
                    toastContainer.style.top = "30px";
                    toastContainer.style.removeProperty('bottom');
                }
                else if (toast.position === "bottom") {
                    toastContainer.style.bottom = "30px";
                    toastContainer.style.removeProperty('top');
                }

                // Set the toast's colours and text, then show it
                toastElement.style.color = toast.textColor;
                toastElement.style["background-color"] = toast.backgroundColor;
                toastElement.style["font-size"] = toast.fontSize + "px";
                toastElement.innerHTML = toast.message;
                toastElement.style.visibility = "visible";

                // Start fading in the toast. Wait for the duration in seconds (minus the fade-out time) before starting to fade out.
                let fadeInstructions = `fadein 0.5s, fadeout 0.5s ${toast.duration / 1000 - 0.5}s`;
                toastElement.style.webkitAnimation = fadeInstructions;
                toastElement.style.animation = fadeInstructions;

                // After the duration (once the toast is done fading out), hide it (or else it will re-appear)
                setTimeout(() => {
                    toastElement.style.visibility = "";
                    toastElement.style.webkitAnimation = "";
                    toastElement.style.animation = "";
                    toastElement.innerHTML = "";

                    // If a callback was provided, call it now
                    if (toast.callback) toast.callback();

                    resolve();

                }, toast.duration);
            });
        }

        //Helper method to show banner
        function showCustomBannerPrivate(messageValue,backgroundColorValue, textColorValue, textSizeValue,
                                  positionValue, callbackValue, durationValue)
        {
            // TODO add support for Android 11+; display toasts in a different way
            if(platformSupportsToast())
            {
                window.plugins.toast.showWithOptions(
                    {
                        message: messageValue,
                        duration:durationValue,
                        position: positionValue,
                        addPixelsY: 100,
                        styling: {
                            opacity:0.8,
                            backgroundColor: backgroundColorValue, // make sure you use #RRGGBB. Default #333333
                            textColor: textColorValue, // Ditto. Default #FFFFFF
                            textSize: textSizeValue, // Default 13
                        }
                    },
                    callbackValue,
                    function(error){});
            }
            else console.log("Toast message:\n" + messageValue);
        }

        // Replaces all missing options in the provided object with the defaults, and fills in "automatic" options
        function addDefaultOptions(options) {
            // Options in the right-most object take precedence over defaults on the left
            let newOptions = {...defaultOptions, ...options};
            if (newOptions.duration === "automatic") newOptions.duration = calculateDuration(newOptions.message);
            if (newOptions.fontSize === "automatic") newOptions.fontSize = getFontSize();
            return newOptions;
        }

        function showNextToast() {
            // If there are no toasts to show, return
            if (toastQueue.length === 0) return;

            // Get the next toast in the queue to show (but don't remove it from the queue until it's done displaying)
            let toast = toastQueue[0];

            // Fill in any missing options for the toast message
            toast = addDefaultOptions(toast);

            // Show the toast
            showCustomToast(toast).then(() => {
                // Force a delay between toasts to ensure correct display, then show the next one
                $timeout(() => {
                    toastQueue.splice(0, 1); // Remove the finished toast from the queue
                    showNextToast(); // Recurse to show toasts until the queue is empty
                }, 500);
            }).catch(error => {
                console.error("An error occurred while showing a toast message: ", error, toast);

                // If an error occurred, still clear the current toast and continue showing the next ones
                $timeout(() => {
                    toastQueue.splice(0, 1);
                    showNextToast();
                }, 500);
            });
        }

        // Computes a duration for which to show a toast message based on its length
        function calculateDuration(message) {
            // TODO - accessibility: add a setting (in UserPreferences) to slow down all time-based messages shown to the user
            const wordsPerMin = 100; // Average reading speed (lowered because toasts are typically short)
            const wordsPerSec = wordsPerMin / 60;
            const minDuration = 5000; // Show messages at least 5 seconds
            const wordCount = message.split(" ").length;

            // Duration is a number of milliseconds based on message length and speed, or a minimum value if the message is short
            return Math.max(minDuration, Math.ceil(wordCount / wordsPerSec * 1000));
        }

        // Gets the user's default font size
        function getFontSize() {
            let sizeName = UserPreferences.getFontSize();
            if (sizeName === "") sizeName = "loggedOut";
            return automaticFontSizes[sizeName];
        }
    }
})();
