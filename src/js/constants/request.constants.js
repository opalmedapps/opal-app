(function () {
    'use strict';

    /**
     * @description Constants used to make requests to the listener.
     * @author Stacey Beard
     * @date 2021-12-08
     */
    angular
        .module("MUHCApp")
        .constant("RequestConstants", {
            /** Response codes **/
            ENCRYPTION_ERROR: 1,
            SERVER_ERROR: 2,
            SUCCESS: 3,
            TOO_MANY_ATTEMPTS: 4,
            INVALID_VERSION: 5,
            CLIENT_ERROR: 400,
        });
})();
