// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @author Based on NewsBannerService by David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Rewritten by Stacey Beard in August 2021 to add custom toasts.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('Toast', Toast);

    Toast.$inject = ['$interval', '$timeout', 'AppState', 'UserPreferences'];

    /**
     * @description Provides an API through which to display toast messages on the screen.
     * @author Stacey Beard
     * @date 2021-09-01
     */
    function Toast($interval, $timeout, AppState, UserPreferences) {

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
         *
         *              Each toast's lifecycle follows these states, in order:
         *                - PENDING
         *                - VISIBLE
         *                - DISMISS_REQUESTED (optional, if the user clicks to dismiss the toast; not used if a toast expires by time)
         *                - DISMISS_IN_PROGRESS
         *                - DONE
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

            // Mark down that the toast isn't being shown yet, and give it a unique ID
            options.state = 'PENDING';
            options.id = Math.random().toString(16).slice(2);

            // Spam prevention: don't add the toast to the queue if an identical message has already been queued
            if (toastQueue.some(toast => toast.message === options.message)) {
                console.warn('Toast spam prevention: message blocked, already queued to display. Message:', options.message);
                return;
            }

            // Add the toast to the queue to be shown after any others that are already displaying
            toastQueue.push(options);

            // If the toast is the first to be added to the queue, display it (if not, it will display after the others)
            // Also register a listener that will dismiss the current toast if the user clicks away
            if (toastQueue.length === 1) {
                $timeout(() => window.addEventListener("click", dismissOnClick));
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
            // Set a cron to dismiss toasts when they've run out of time, or when the user clicks to dismiss them
            $interval(dismissToasts, 500);
        }

        /**
         * @description Function to be used on an interval to dismisses toasts that are done displaying.
         */
        async function dismissToasts() {
            if (toastQueue.length === 0) return;

            let currentToast = toastQueue[0];

            // If the current toast has already been dismissed or is in the process of being dismissed, there's nothing to do
            if (['DISMISS_IN_PROGRESS', 'DONE'].includes(currentToast.state)) return;

            // Otherwise, check whether the current toast should be dismissed
            if (currentToast.state === 'DISMISS_REQUESTED' || timeIsUp(currentToast)) {
                currentToast.state = 'DISMISS_IN_PROGRESS';
                await hideCustomToast(currentToast);
                await dequeueAndContinue();
            }
        }

        /**
         * @description Function to be used with the 'click' event listener to listen for clicks
         *              and order the currently visible toast to be dismissed if a click is registered.
         *              This allows users to dismiss toasts by clicking on them, clicking away or switching to another page.
         */
        function dismissOnClick() {
            if (toastQueue[0]?.state === 'VISIBLE') toastQueue[0].state = 'DISMISS_REQUESTED';
        }

        /**
         * @description Determines whether the current toast has displayed for long enough and therefore should be dismissed.
         * @param {Object} toast An object containing toast options; its startTime and duration will be checked.
         * @returns {boolean} True if the toast has reached or exceeded its display duration, based on its startTime.
         */
        function timeIsUp(toast) {
            const currentTime = Date.now();
            return toast.startTime && currentTime - toast.startTime >= toast.duration;
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
            if (toastQueue.length > 0 && toastQueue[0].state === 'PENDING' && isMinimized === false) showNextToast();
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

            // Fill in any missing options for the toast message
            let toast = toastQueue[0];
            addDefaultOptions(toast);

            // Get the next toast in the queue to show (but don't remove it from the queue until it's done displaying)
            toast.state = 'VISIBLE';
            showCustomToast(toast).catch(error => {
                console.error("An error occurred while showing a toast message: ", error, toast);
            });
        }

        /**
         * @description Takes a toast options object and fills in all missing options with their default values.
         *              Afterwards, also converts all "automatic" values to concrete ones.
         *              The originally provided options object is edited in place.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} options - A toast options object that may be missing some optional attributes.
         */
        function addDefaultOptions(options) {
            // Extract and apply default values from the parameter definitions
            Object.entries(toastParams).forEach(entry => {
                const [key, val] = entry;
                if (!options[key]) options[key] = val.default;
            });

            if (options.duration === "automatic") options.duration = calculateDuration(options.message, options.durationWordsPerMinute);
            if (options.fontSize === "automatic") options.fontSize = getFontSize();
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

                // Display the toast by fading in
                $("#custom-toast").fadeIn(fadeTime, undefined, () => {
                    // Save the start time at which the toast was shown, to know when to dismiss it / fade it out
                    toast.startTime = Date.now();
                });
            });
        }

        /**
         * @description Hides a toast message from the screen, displayed using a custom HTML/CSS component.
         *              Adapted from source: https://www.w3schools.com/howto/howto_js_snackbar.asp
         *              Animations were replaced with jQuery calls.
         * @author Stacey Beard
         * @date 2021-09-01
         * @param {Object} toast - An object containing toast options. Assumes that all options have a value
         *                 (i.e. that all missing options have been filled in with defaults).
         * @returns {Promise<unknown>} Resolves when the toast is done being hidden (after executing its callback).
         */
        function hideCustomToast(toast) {
            return new Promise(resolve => {
                let toastElement = document.getElementById("custom-toast");

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
            });
        }

        /**
         * @description Removes the first toast from the queue, and continues execution by showing the next toast if possible.
         */
        function dequeueAndContinue() {
            if (toastQueue.length === 0) return;
            let toast = toastQueue[0];

            // Mark the current toast as done and remove it from the queue
            toast.state = 'DONE';
            toastQueue.splice(0, 1);

            // If all toasts have been cleared, turn off the listener for clicks
            if (toastQueue.length === 0) window.removeEventListener('click', dismissOnClick);

            showNextToastIfPossible();
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
