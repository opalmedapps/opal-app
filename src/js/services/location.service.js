// SPDX-FileCopyrightText: Copyright (C) 2023 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @author Stacey Beard, based on code from checkinService.js
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .service('Location', Location);

    /**
     * @description Provides functionality related to the GPS position of the user's device.
     * @author Stacey Beard
     * @date 2022-12-08
     */
    function Location() {
        /**
         * @desc The options to use with cordova-plugin-geolocation (numbers are in milliseconds).
         * @type {{enableHighAccuracy: boolean, maximumAge: number, timeout: number}}
         */
        const geolocationOptions = {
            maximumAge: 10000,
            timeout: 15000,
            enableHighAccuracy: true
        };

        return {
            isInRange: isInRange,
        };

        /**
         * @desc Calculates whether or not the device's current position is within an acceptable distance of a target position.
         * @author Stacey Beard, based on code from checkinService.js
         * @param {number} targetLatitude The latitude of the target position.
         * @param {number} targetLongitude The longitude of the target position.
         * @param {number} maxDistanceMeters The maximum allowed distance to the target position (in meters).
         *                                   Also represents a radius around the target position in which the current device can be.
         * @returns {Promise<boolean>} Resolves to true if the distance between the current position and the target is
         *                             less than or equal to the maximum allowed distance.
         */
        async function isInRange(targetLatitude, targetLongitude, maxDistanceMeters) {
            let current = (await getCurrentPosition(geolocationOptions)).coords;
            let distanceMeters = 1000 * getDistanceFromLatLonInKm(current.latitude, current.longitude, targetLatitude, targetLongitude);
            return distanceMeters <= maxDistanceMeters;
        }

        /**
         * @desc Promise wrapper for the location function from `cordova-plugin-geolocation`.
         * @param {Object} [options] Optional options passed to the plugin function.
         * @returns {Promise<*>} Resolves or rejects to the results of the plugin function.
         */
        function getCurrentPosition(options) {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });
        }

        /**
         * @desc Calculates the distance between two locations on the Earth in kilometers.
         * @author Originally from checkinService.js
         * @param {number} lat1 The latitude of the first location.
         * @param {number} lon1 The longitude of the first location.
         * @param {number} lat2 The latitude of the second location.
         * @param {number} lon2 The longitude of the second location.
         * @returns {number} The distance between the two locations (km).
         */
        function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
            // Converts an angle from degrees to radians
            let deg2rad = deg => deg * (Math.PI / 180);

            let earthRadiusKm = 6371;
            let dLat = deg2rad(lat2 - lat1);
            let dLon = deg2rad(lon2 - lon1);
            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let distanceKm = earthRadiusKm * c;
            return distanceKm;
        }
    }
})();
