(function() {
    'use strict';

    /**
     * This is a angular constant to store all the constants related to settings API back end
     * (e.g., hospital settings)
     *
     * This file is injected into the Params (src/js/app.values.js) and the constants are accessed from there
     *
     */
    angular
        .module('MUHCApp')
        .constant('SettingsAPIConstants', {
            HOSPITAL_SETTINGS: {
               'PARKING_INFO' : 'ParkingInfo'
            },
        });
})();
