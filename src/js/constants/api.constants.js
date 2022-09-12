(function () {
    'use strict';

    /**
     * @description Constants used to make requests to the listener going through the new backend and define available routes.
     * @author David Gagne
     * @date 2022-06-10
     */
    angular
        .module("MUHCApp")
        .constant("ApiConstants", {
            /** Response codes **/
            SUCCESS: '200',
            /** Headers for new api request */
            REQUEST_HEADERS: {
                'Content-Type': 'application/json',
                'Accept-Language': 'fr',
            },
            /** Django backend available routes. Note: Trailing slashes are required */
            ROUTES: {
                HOME: {
                    method: 'get',
                    url: '/api/app/home/',
                },
                CHART: {
                    method: 'get',
                    url: '/api/app/chart/',
                },
                GENERAL: {
                    method: 'get',
                    url: '/api/app/general/'
                },
                HOSPITAL_SETTINGS: {
                    SITES: {
                        method: 'get',
                        url: '/api/sites/'
                    },
                    INSTITUTIONS: {
                        method: 'get',
                        url: '/api/institutions/',
                    }
                },
                PATIENTS: {
                    method: 'get',
                    url: '/api/caregivers/patients/'
                }
            }
        });
})();