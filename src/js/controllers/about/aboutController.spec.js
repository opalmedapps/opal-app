// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   aboutController.spec.js
 * Description  :   Tests the aboutController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 */

"use strict";
describe('AboutController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('OpalApp'));

    var $controller;
    var controller;
    var UserPreferences;
    var $window;

    beforeEach(inject(function(_$controller_, _UserPreferences_, _$window_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        UserPreferences = _UserPreferences_;
        $window = _$window_;

        // Spies
        spyOn( $window, 'open' ).and.callFake( function(url) {
                return url;
            } );

        spyOn( UserPreferences, 'getLanguage' ).and.callFake( function() {
                return 'en';
            } );

        $controller = _$controller_;
        controller = $controller('AboutController', {$window: $window, UserPreferences: UserPreferences});

    }));

    describe('sanity test', function() {
        it('activates the proper language', inject(function(UserPreferences) {
            expect(UserPreferences.getLanguage).toHaveBeenCalled();
            expect(controller.language).toEqual('en');
        }));
    });

    it('opens the donation window properly', function(){
        controller.openDonation();
        expect($window.open).toHaveBeenCalled();
        expect($window.open).toHaveBeenCalledWith( 'https://www.cedars.ca/cedars/en/donate/donate_online?designation=radiation-oncology-opal-fund', '_system' );
    })
});
