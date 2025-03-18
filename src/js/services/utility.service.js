// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Service that contains general-purpose utility functions.
 * @author Stacey Beard
 * @date 2022-04-07
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Utility', Utility);

    Utility.$inject = ["$timeout"];

    function Utility($timeout) {

        return {
            promiseMinDelay: promiseMinDelay,
        };

        ////////////////

        /**
         * @description Wrapper for a promise that ensures that a minimum delay elapses before the promise resolves
         *              or rejects. For example, if a promise would normally complete in 3 seconds, but a minDelay of
         *              5 seconds is provided, then the promise will complete in 5 seconds.
         *              Note: this function can be used to ensure that an animation has enough time to be visible to
         *                    the user even if its related function completes very quickly.
         * @author Stacey Beard
         * @date 2022-04-07
         * @param {Promise<*>} promise - The promise to wrap.
         * @param {number} minDelay - The minimum amount of time that must pass (in milliseconds) before the promise is
         *                            resolved or rejected.
         * @returns {Promise<*>} The wrapped promise.
         */
        async function promiseMinDelay(promise, minDelay) {
            let result, error;
            let startTime = new Date().getTime();

            // Execute the main promise
            try {
                result = await promise;
            }
            catch (thrownError) {
                error = thrownError;
            }

            let endTime = new Date().getTime();
            let promiseDuration = endTime - startTime;

            // If the minimum delay has not yet elapsed, wait for the remaining time
            if (promiseDuration < minDelay) {
                let remainingWait = minDelay - promiseDuration;
                await $timeout(() => {}, remainingWait);
            }

            if (error) throw error;
            else return result;
        }
    }
})();
