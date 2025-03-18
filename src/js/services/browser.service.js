// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Service that handles opening browser links (in-app or externally) with the right parameters.
 * @author Stacey Beard
 * @date 2021-06-23
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Browser', Browser);

    Browser.$inject = ['$filter', 'Constants', 'Toast'];

    function Browser($filter, Constants, Toast) {

        return {
            openInternal: openInternal,
            openExternal: openExternal,
        };

        ////////////////

        /**
         * @description Opens a link internally, using the in-app browser. If the device type is not a mobile app,
         *              opens the link in a new tab instead.
         *              Shows an error message if the url parameter is missing.
         * @author Stacey Beard
         * @date 2021-06-23
         * @param {string} url - The link to open.
         * @param {boolean} [hideURL] - Whether to hide the location bar that shows the URL in the in-app browser.
         *                              Set this to true to show content where the link isn't relevant (e.g. an image on the external server).
         * @param {string} [additionalOptions] - More in-app browser options to use in addition to the default options
         *                                       selected by this service. The string format to use is specified by the plugin
         *                                       documentation: https://github.com/apache/cordova-plugin-inappbrowser#readme.
         *                                       To be used only for exceptional cases; otherwise, edit this service to
         *                                       provide the necessary behavior.
         * @returns {null|InAppBrowser} The in-app browser object returned by cordova.InAppBrowser.open(), or null if
         *                              the device type is not a mobile app.
         */
        function openInternal(url, hideURL = false, additionalOptions = "")
        {
            let browser = null;
            if (!validateURL(url)) return null;
            if (Constants.app)
            {
                // '_blank' opens the in-app browser (internal)
                browser = cordova.InAppBrowser.open(url, '_blank', additionalOptions + getOptions(hideURL));
                linkToBrowserModal(browser);
            }
            else openTab(url);
            return browser;
        }

        /**
         * @description Opens a link externally, using the device's external browser(s). If the device type is not a
         *              mobile app, opens the link in a new tab instead.
         *              Shows an error message if the url parameter is missing.
         * @author Stacey Beard
         * @date 2021-06-23
         * @param {string} url - The link to open.
         */
        function openExternal(url)
        {
            if (!validateURL(url)) return null;
            if (Constants.app)
            {
                // '_system' opens the system's web browser (external)
                cordova.InAppBrowser.open(url, '_system');
            }
            else openTab(url);
        }

        /**
         * @description Returns the options to pass to cordova.InAppBrowser.open().
         * @author Stacey Beard
         * @date 2021-06-23
         * @param {boolean} hideURL - Whether to hide the location bar that shows the URL in the in-app browser.
         * @returns {string} The options string.
         */
        function getOptions(hideURL)
        {
            let location = hideURL ? "no" : "yes"; // If hideURL is true, the location bar is not shown
            let buttonString = $filter("translate")("CLOSE");
            return `closeButtonCaption=${buttonString},enableViewportScale=yes,location=${location}`;
        }

        /**
         * @description Opens a link in a new browser tab. To be used when the device type is not mobile (i.e. in the web version).
         * @author Stacey Beard
         * @date 2021-06-23
         * @param {string} url - The link to open.
         */
        function openTab(url)
        {
            window.open(url, '_blank');
        }

        /**
         * @description Registers event listeners to show a blank modal behind the in-app browser while it's open on iOS.
         *              This fixes an issue in iOS where the in-app browser has a gap through which the app is visible.
         *              Remove if this issue is fixed in the cordova plugin.
         *                  https://github.com/apache/cordova-plugin-inappbrowser/issues/870
         *                  https://github.com/apache/cordova-plugin-inappbrowser/issues/801
         * @param {InAppBrowser} browser - The in-app browser object returned by cordova.InAppBrowser.open().
         */
        function linkToBrowserModal(browser)
        {
            if (Constants.app && ons.platform.isIOS() && browser)
            {
                // Display a white modal behind the in-app browser on iOS
                browser.addEventListener('loadstart', () => { browserModal.show(); });
                browser.addEventListener('exit', () => { browserModal.hide(); });
            }
        }

        /**
         * @description Checks whether the provided URL is valid (is a non-empty string).
         *              If it's invalid, shows a news banner message to tell the user that the browser can't be opened.
         * @author Stacey Beard
         * @date 2021-07-21
         * @param url The URL to check.
         * @returns {boolean} True if the url is valid (is a non-empty string); false otherwise.
         */
        function validateURL(url) {
            const valid = (typeof url === "string" && url !== "");

            if (!valid) Toast.showToast({
                message: $filter('translate')("BROWSER_OPEN_FAILED"),
            });
            return valid;
        }
    }
})();
