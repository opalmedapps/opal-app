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
     **/
    function NewsBanner($filter, $timeout, $translatePartialLoader, Constants, Params, UserPreferences) {

        // Adds the top-view translation tables in order to always display the alert banners correctly.
        $translatePartialLoader.addPart('top-view');

        const defaultOptions = {
            backgroundColor: '#555555', // Required format is #RRGGBB
            callback: null,
            duration: "automatic",
            durationWordsPerMinute: 100, // Average reading speed (lowered because toasts are typically short)
            fontSize: "automatic",
            message: "", // Required; should be provided by the caller
            position: "top",
            positionOffset: 50,
            textColor: '#FFFFFF', // Required format is #RRGGBB
        };

        // Font sizes used for toasts (in pixels); don't necessarily match the numeric values in app.css
        const automaticFontSizes = {
            loggedOut: 16,
            medium: 14,
            large: 16,
            xlarge: 20,
        };

        // The queue of messages to be shown
        const toastQueue = [];

        // Keeps track of whether the app is minimized to delay showing toasts until the app is brought back
        let isMinimized = false;

        bindEvents();

        let service = {
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
         * @param {string} [options.backgroundColor] - (optional; default = "#555555", i.e. dark grey) A color in
         *                 #RRGGBB format representing the color of the toast background.
         * @param {function} [options.callback] - (optional; default = null) A function to call after the toast has
         *                   finished displaying.
         * @param {number|string} [options.duration] - (optional; default = "automatic") Either a number (>= 1000)
         *                        representing the number of milliseconds to display the toast message
         *                        (includes 0.5 seconds each of fade-in and fade-out time), or the string "automatic",
         *                        indicating that the duration should be calculated automatically based on the message length.
         *                        Using "automatic" is recommended.
         * @param {number} [options.durationWordsPerMinute] - (optional; default = 100) Only used if duration =
         *                 "automatic". Number of words per minute (reading speed) used to calculate an automatic
         *                 message duration. A lower value slows down the message. Useful to slow down a message
         *                 that has variable length without picking an arbitrary fixed duration in number of seconds.
         * @param {number|string} [options.fontSize] - (optional; default = "automatic") Either a number representing
         *                        the toast's font size in pixels, or the string "automatic", indicating that the value
         *                        should scale according to the user's preferred font size.
         *                        Using "automatic" is recommended.
         * @param {string} [options.position] - (optional; default = "top") The location at which to display the toast.
         *                 Options are: 'top', 'bottom'.
         * @param {number} [options.positionOffset] - (optional; default = 50) Value must be positive.
         *                 The number of pixels away from the screen edge at which to display the toast.
         *                 For example, a value of 15 with position="bottom" will display the toast 15 pixels from the
         *                 bottom edge of the screen.
         * @param {string} [options.textColor] - (optional; default = "#FFFFFF", i.e. white) A color in #RRGGBB format
         *                 representing the color of the toast text.
         */
        function showToast(options) {
            // TODO validate input options

            if (!options.message) {
                console.warning("Tried to display an empty toast message");
                return;
            }

            // Mark down that the toast isn't being shown yet
            options.showing = false;

            // Add the toast to the queue to be shown after any others that are already displaying
            toastQueue.push(options);

            // If the toast is the only one in the queue, display it (if not, it will display after the others)
            if (toastQueue.length === 1) {
                showNextToastIfPossible();
            }
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/

        // Sets a watch to avoid showing toasts while the app is minimized, and resume when it becomes active again
        function bindEvents() {
            if (Constants.app) {
                // iOS
                document.addEventListener('active', () => {
                    isMinimized = false;
                    showNextToastIfPossible();
                });
                document.addEventListener('resign', () => {
                    isMinimized = true;
                });

                // Android
                document.addEventListener('resume', () => {
                    if (ons.platform.isAndroid()) {
                        isMinimized = false;
                        showNextToastIfPossible();
                    }
                });
                document.addEventListener('pause', () => {
                    if(ons.platform.isAndroid()) isMinimized = true;
                });
            }
        }

        // Adapted from source: https://www.w3schools.com/howto/howto_js_snackbar.asp
        async function showCustomToast(toast) {
            return new Promise(resolve => {
                const fadeTime = 500; // The amount of time to allow for each of the fade-in and fade-out animations

                // Get the toast divs
                let toastContainer = document.getElementById("custom-toast-container");
                let toastElement = document.getElementById("custom-toast");

                // Move the toast container to the correct position
                if (toast.position === "top") {
                    toastContainer.style.top = toast.positionOffset + "px";
                    toastContainer.style.removeProperty('bottom');
                }
                else if (toast.position === "bottom") {
                    toastContainer.style.bottom = toast.positionOffset + "px";
                    toastContainer.style.removeProperty('top');
                }

                // Set the toast's colours and text
                toastElement.style.color = toast.textColor;
                toastElement.style["background-color"] = toast.backgroundColor;
                toastElement.style["font-size"] = toast.fontSize + "px";
                toastElement.innerHTML = formatMessage(toast.message);

                // Display the toast by fading in, waiting, then fading out
                $("#custom-toast").fadeIn(fadeTime, undefined, () => {
                    $timeout(() => {
                        $("#custom-toast").fadeOut(fadeTime, undefined, () => {
                            // Clear the toast contents
                            toastElement.innerHTML = "";

                            // If a callback was provided, call it now
                            if (toast.callback) toast.callback();
                            resolve();
                        });
                    }, toast.duration - fadeTime * 2);
                });
            });
        }

        // Replaces all missing options in the provided object with the defaults, and fills in "automatic" options
        function addDefaultOptions(options) {
            // Options in the right-most object take precedence over defaults on the left
            let newOptions = {...defaultOptions, ...options};
            if (newOptions.duration === "automatic") newOptions.duration = calculateDuration(newOptions.message, newOptions.durationWordsPerMinute);
            if (newOptions.fontSize === "automatic") newOptions.fontSize = getFontSize();
            return newOptions;
        }

        // Test whether the next toast message should be shown, and if so, shows it
        function showNextToastIfPossible() {
            if (toastQueue.length > 0 && toastQueue[0].showing === false && isMinimized === false) showNextToast();
        }

        function showNextToast() {
            // If there are no toasts to show, return
            if (toastQueue.length === 0) return;

            // Get the next toast in the queue to show (but don't remove it from the queue until it's done displaying)
            let toast = toastQueue[0];
            toast.showing = true;

            // Fill in any missing options for the toast message
            toast = addDefaultOptions(toast);

            // Show the toast
            showCustomToast(toast).then(() => {
                // Force a delay between toasts to ensure correct display, then show the next one
                $timeout(() => {
                    toastQueue.splice(0, 1); // Remove the finished toast from the queue
                    showNextToastIfPossible(); // Recurse to show toasts until the queue is empty
                }, 500);
            }).catch(error => {
                console.error("An error occurred while showing a toast message: ", error, toast);

                // If an error occurred, still clear the current toast and continue showing the next ones
                $timeout(() => {
                    toastQueue.splice(0, 1);
                    showNextToastIfPossible();
                }, 500);
            });
        }

        // Computes a duration for which to show a toast message based on its length
        function calculateDuration(message, wordsPerMin) {
            // TODO - accessibility: add a setting (in UserPreferences) to slow down all time-based messages shown to the user
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

        // Formats a message to be shown as innerHTML in a toast
        function formatMessage(message) {
            return message.split("\n").join("<br>"); // Replace all line breaks with HTML breaks
        }
    }
})();
