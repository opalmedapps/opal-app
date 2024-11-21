/**
 * @author Based on NewsBannerService by David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Rewritten by Stacey Beard in August 2021 to add custom toasts.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('Toast', Toast);

    Toast.$inject = ['$timeout', 'AppState', 'Constants', 'UserPreferences'];

    /**
     * @description Provides an API through which to display toast messages on the screen.
     * @author Stacey Beard
     * @date 2021-09-01
     */
    function Toast($timeout, AppState, Constants, UserPreferences) {

        /**
         * @description Functions used to validate the toast parameters
         */
        const validate = {
            isNonEmptyString: (e) => { return typeof e === "string" && e !== "" },
            isFunction: (e) => { return typeof e === "function" },
            isNumber: (e) => { return typeof e === "number" },
            isPositiveNumber: (e) => { return validate.isNumber(e) && e >= 0 },
            isAutomatic: (e) => { return e === "automatic" },
            isAutomaticOrPositiveNumber: (e) => { return validate.isAutomatic(e) || validate.isPositiveNumber(e) },
            isValidPosition: (e) => { return e === "top" || e === "bottom" },
        };

        /**
         * @description Default options and validation functions for the parameters used to show a toast message.
         *              See showToast() and validateToastOptions() for details.
         */
        const toastParams = {
            backgroundColor: {
                default: '#555555',
                required: false,
                validation: [validate.isNonEmptyString],
            },
            callback: {
                default: null,
                required: false,
                validation: [validate.isFunction],
            },
            duration: {
                default: "automatic",
                required: false,
                validation: [validate.isAutomaticOrPositiveNumber],
            },
            durationWordsPerMinute: {
                default: 100, // Average reading speed (lowered to give users time to read the message twice)
                required: false,
                validation: [validate.isPositiveNumber],
            },
            fontSize: {
                default: "automatic",
                /*
                 * Font sizes used for toasts (in pixels) when using the "automatic" option.
                 * The values don't necessarily need to match those in app.css.
                 * Keys (except for "loggedOut") should match the strings returned by UserPreferences.getFontSize().
                 */
                automaticFontSizes: {
                    loggedOut: 16,
                    medium: 14,
                    large: 16,
                    xlarge: 20,
                },
                required: false,
                validation: [validate.isAutomaticOrPositiveNumber],
            },
            message: {
                default: "", // Default used internally only
                required: true,
                validation: [validate.isNonEmptyString],
            },
            position: {
                default: "top",
                required: false,
                validation: [validate.isNonEmptyString, validate.isValidPosition],
            },
            positionOffset: {
                default: 50,
                required: false,
                validation: [validate.isPositiveNumber],
            },
            textColor: {
                default: '#FFFFFF',
                required: false,
                validation: [validate.isNonEmptyString],
            },
        };

        /**
         * @description A queue to which toast messages are added before being displayed on the screen.
         *              It ensures that toasts don't conflict and are shown in the right order.
         * @type {Object[]} An array of toast option objects.
         */
        const toastQueue = [];

        /**
         * @description Flag that keeps track of whether the app is minimized or not.
         *              When the app is minimized, this service will delay showing new toast messages until the app is
         *              active again.
         * @type {boolean}
         */
        let isMinimized = false;

        /**
         * @description The amount of time (in milliseconds) to allow for each of a toast's fade-in and fade-out animations.
         * @type {number}
         */
        const fadeTime = 500;


        bindEvents();

        let service = {
            showToast: showToast,
        };

        return service;

        /********************************/
        /******* PUBLIC FUNCTIONS *******/
        /********************************/

        /**
         * @description Shows a toast message on the screen to display a short piece of information to the user.
         *              Messages are first added to a queue to prevent overlap and to be shown in order.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} options - An object containing configuration parameters for the toast message.
         *                           If a required parameter is not correctly provided, a warning will be emitted and
         *                           the toast will not display. If an optional parameter is not provided or doesn't
         *                           meet the required format, the default value will be used.
         * @param {string} options.message - (required) The message to be shown. Should already be translated.
         * @param {string} [options.backgroundColor] - (optional; default = "#555555", i.e. dark grey) The color to use
         *                 for the toast background. Can be in any format accepted by HTML (e.g. "black", or a hex value).
         * @param {function} [options.callback] - (optional; default = null) A function to call after the toast has
         *                   finished displaying.
         * @param {number|string} [options.duration] - (optional; default = "automatic") Either a number
         *                        representing the number of milliseconds to display the toast message
         *                        (excluding a short fade-in and fade-out time), or the string "automatic",
         *                        indicating that the duration should be calculated automatically based on the message
         *                        length. Using "automatic" is recommended. Note: "automatic" enforces a minimum
         *                        duration to make sure that users have enough time to read even the shortest messages.
         * @param {number} [options.durationWordsPerMinute] - (optional; default = 100) Only used if duration =
         *                 "automatic". Number of words per minute (reading speed) used to calculate the automatic
         *                 message duration. A lower value slows down the message. This is useful to slow down a message
         *                 that has variable length without picking an arbitrary fixed duration in number of seconds.
         * @param {number|string} [options.fontSize] - (optional; default = "automatic") Either a number representing
         *                        the toast's font size in pixels, or the string "automatic", indicating that the value
         *                        should scale according to the user's preferred font size.
         *                        Using "automatic" is recommended.
         * @param {string} [options.position] - (optional; default = "top") The location at which to display the toast.
         *                 Options are: "top", "bottom".
         * @param {number} [options.positionOffset] - (optional; default = 50) Value must be positive.
         *                 The number of pixels away from the edge of the screen at which to display the toast.
         *                 For example, a value of 15 with position="bottom" will display the toast 15 pixels from the
         *                 bottom edge of the screen.
         * @param {string} [options.textColor] - (optional; default = "#FFFFFF", i.e. white) The color to use
         *                 for the toast text. Can be in any format accepted by HTML (e.g. "black", or a hex value).
         */
        function showToast(options) {
            // Validate input options
            if (!validateToastOptions(options)) return;

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

        /**
         * @description Binds events used by this service.
         *              Sets a watch to check when the app is being minimized or maximized. This is used to delay toasts
         *              from showing while the app is minimized.
         * @author Stacey Beard
         * @date 2021-09-01
         */
        function bindEvents() {
            // Sets a watch to avoid showing toasts while the app is minimized, and resume when it becomes active again
            AppState.addInactiveEvent(() => {
                isMinimized = true;
            });
            AppState.addActiveEvent(() => {
                isMinimized = false;
                showNextToastIfPossible();
            });
        }

        /**
         * @description Validates toast options to make sure they are correctly formatted.
         *              If any required parameters are missing or wrongly formatted, returns false
         *              (and the toast should not be shown). If any optional parameters are wrongly formatted,
         *              they are deleted (and the defaults will be used instead).
         *              In either of the above cases, a warning is also printed to the console.
         *              Note: modifies the input object.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} toast - A toast options object that may be missing some optional attributes.
         * @returns {boolean} True if the toast can be shown (i.e. if all required parameters have been
         *                    correctly provided); false otherwise.
         */
        function validateToastOptions(toast) {
            let warn = (attributeName, failedValidations) => {
                console.warn(`Toast parameter "${attributeName}" is invalid:`, `[${toast[attributeName]}] (${typeof toast[attributeName]})`, "failed the following tests:", failedValidations);
            };

            // Make sure the toast exists
            if (!toast || typeof toast !== "object") { console.warn(`Toast options object is invalid`, toast); return false; }

            // Check all the toast parameters
            for (const [key, option] of Object.entries(toastParams)) {
                // If the parameter was required but not provided, return false
                if (option.required && !toast.hasOwnProperty(key)) {
                    warn(key, "required property must be provided");
                    return false;
                }
                // If provided, make sure the parameter is valid (if not valid, delete it to use the default later)
                else if (toast.hasOwnProperty(key))
                {
                    let valid = true;
                    let failedValidations = [];
                    option.validation.forEach(isValid => {
                        if (!isValid(toast[key])) {
                            valid = false;
                            failedValidations.push(isValid);
                        }
                    });
                    if (!valid) {
                        warn(key, failedValidations);
                        if (option.required) return false; // If the parameter is invalid and required, return false
                        delete toast[key];
                    }
                }
            }
            return true; // As long as no required parameters had issues, return true
        }

        /**
         * @description Tests whether the next toast message in the queue should be shown, and if so, shows it.
         *              The next toast is shown if there is at least one in the queue, if no other toast is currently
         *              being shown, and if the app is not currently minimized.
         * @author Stacey Beard
         * @date 2021-09-01
         */
        function showNextToastIfPossible() {
            if (toastQueue.length > 0 && toastQueue[0].showing === false && isMinimized === false) showNextToast();
        }

        /**
         * @description Shows the next toast in the queue. Missing options are filled in with defaults before displaying.
         *              After the toast is done displaying, automatically shows the next one in the queue, if there is
         *              one. If an error occurs while showing the toast, it is caught, printed to the console, and the
         *              next toast is still shown.
         * @author Stacey Beard
         * @date 2021-09-01
         */
        function showNextToast() {
            // If there are no toasts to show, return
            if (toastQueue.length === 0) return;

            // Get the next toast in the queue to show (but don't remove it from the queue until it's done displaying)
            let toast = toastQueue[0];
            toast.showing = true;

            // Fill in any missing options for the toast message
            toast = addDefaultOptions(toast);

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

        /**
         * @description Takes a toast options object and returns a new object which fills in all missing options with
         *              their default values. After adding the defaults, also converts all "automatic" values to a
         *              concrete value.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} options - A toast options object that may be missing some optional attributes.
         * @returns {Object} A new options object containing all possible options (with missing options filled with
         *          defaults), and all "automatic" options translated to a concrete value.
         */
        function addDefaultOptions(options) {
            // Extract the default values from the parameter definitions
            let defaultOptions = {};
            Object.entries(toastParams).forEach(entry => { const [key, val] = entry; defaultOptions[key] = val.default; });

            // Options in the right-most object take precedence over defaults on the left
            let newOptions = {...defaultOptions, ...options};

            if (newOptions.duration === "automatic") newOptions.duration = calculateDuration(newOptions.message, newOptions.durationWordsPerMinute);
            if (newOptions.fontSize === "automatic") newOptions.fontSize = getFontSize();
            return newOptions;
        }

        /**
         * @description Shows a toast message on the screen using a custom HTML/CSS component.
         *              Adapted from source: https://www.w3schools.com/howto/howto_js_snackbar.asp
         *              Animations were replaced with jQuery calls.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} toast - An object containing toast options. Assumes that all options have a value
         *                 (i.e. that all missing options have been filled in with defaults).
         * @returns {Promise<unknown>} Resolves when the toast is done displaying (after executing its callback).
         */
        async function showCustomToast(toast) {
            return new Promise(resolve => {
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

                // Display the toast by fading in, waiting for the duration, then fading out
                $("#custom-toast").fadeIn(fadeTime, undefined, () => {
                    $timeout(() => {
                        $("#custom-toast").fadeOut(fadeTime, undefined, () => {
                            // Reset values to prevent a faulty display in case of a broken parameter on the next toast
                            toastElement.style.color = toastParams.textColor.default;
                            toastElement.style["background-color"] = toastParams.backgroundColor.default;
                            toastElement.style["font-size"] = toastParams.fontSize.automaticFontSizes.loggedOut + "px";
                            toastElement.innerHTML = toastParams.message.default;

                            // If a callback was provided, call it now
                            if (toast.callback) toast.callback();
                            resolve();
                        });
                    }, toast.duration);
                });
            });
        }

        /**
         * @description Computes a duration for which to show a toast message based on its length and words per minute
         *              parameter. The returned value will always be at least 4 seconds to give users the time to read
         *              even the shortest messages.
         *              Used when duration = "automatic".
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {string} message - The message for which to calculate a display duration. The duration is affected by
         *                 the message length in number of words.
         * @param {number} wordsPerMin - The reading speed to use to calculate the message duration.
         * @returns {number} A number of milliseconds during which to show the given message.
         */
        function calculateDuration(message, wordsPerMin) {
            // TODO - accessibility: add a setting (in UserPreferences) to slow down all time-based messages shown to the user
            // TODO - accessibility: or, add a setting to convert all time-based messages to popups with a dismiss button
            const wordsPerSec = wordsPerMin / 60;
            const minDuration = 4000; // Show messages at least 4 seconds
            const wordCount = message.split(" ").length;

            // Duration is a number of milliseconds based on message length and speed, or a minimum value if the message is short
            return Math.max(minDuration, Math.ceil(wordCount / wordsPerSec * 1000));
        }

        /**
         * @description Gets a font size value to use in a toast message, based on the user's preferred font size.
         *              Used when fontSize = "automatic".
         * @author Stacey Beard
         * @date 2021-09-01
         * @returns {number} The font size to use in a toast message (in number of pixels).
         */
        function getFontSize() {
            let sizeName = UserPreferences.getFontSize();
            if (sizeName === "") sizeName = "loggedOut";
            return toastParams.fontSize.automaticFontSizes[sizeName];
        }

        /**
         * @description Formats a message to be shown as innerHTML in a toast.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {string} message - The message to format.
         * @returns {string} A formatted message that can be displayed in a toast.
         */
        function formatMessage(message) {
            return message.split("\n").join("<br>"); // Replace all line breaks with HTML breaks
        }
    }
})();
