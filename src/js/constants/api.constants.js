(function () {
    'use strict';

    /**
     * @description Constants used to make requests to the listener going through the new backend.
     * @author David Gagne
     * @date 2022-06-10
     */
    angular
        .module("MUHCApp")
        .constant("ApiConstants", {
            /** Response codes **/
            SUCCESS: '200',
            SERVER_ERROR: '500',
            NOT_FOUND: '404',
            /** Headers for new api request */
            REQUEST_HEADERS: {
                'Content-Type': 'application/json',
                'Accept-Language': 'fr',
            }
        });
})();