/*
 * Filename     :   appointmentController.spec.js
 * Description  :   Tests the appointmentController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

"use strict";
describe('AppointmentController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;
    var NavigatorParameters;
    var UserPreferences;
    var $scope;
    var $timeout;
    var $window;

    var isCorrupted = false;

    beforeEach(inject(function(_$controller_, _NavigatorParameters_, _UserPreferences_, _$timeout_){

        NavigatorParameters= _NavigatorParameters_;
        UserPreferences = _UserPreferences_;
        $timeout = _$timeout_;
        $window = {
            navigator: {
                pushPage: function() {
                    return true;
                }
            }
        };

        // Spies
        spyOn( UserPreferences, 'getLanguage' ).and.callFake( function() {
            return 'EN';
        } );


        spyOn( NavigatorParameters, 'setParameters').and.returnValue(true);

        if(!isCorrupted){
            spyOn( NavigatorParameters, 'getParameters').and.returnValue({Navigator: 'navigator', Post: MockData.test_appointments[0]});

        } else {
            spyOn( NavigatorParameters, 'getParameters').and.returnValue({Navigator: 'navigator', Post: {}});
        }

        $controller = _$controller_;
        controller = $controller('AppointmentController', { NavigatorParameters: NavigatorParameters, $scope: $scope, UserPreferences: _UserPreferences_, $window: $window});

    }));

    describe('sanity test', function() {
        it('activates appointment properly', function() {
            $timeout.flush();
            expect(controller.app).toBe(MockData.test_appointments[0]);
            expect(controller.corrupted_appointment).toBeFalsy();
            expect(controller.language).toBe('EN');

            isCorrupted = true;

        });
        it('detects corrupted appointment', function() {
            $timeout.flush();
            expect(controller.app).toEqual({});
            expect(controller.corrupted_appointment).toBeTruthy();
            expect(controller.language).toBe('EN');

            isCorrupted = false;
        });
    });

    it('goes to map', function() {
        var spy = spyOn($window.navigator, 'pushPage');
        controller.goToMap();
        expect(NavigatorParameters.setParameters).toHaveBeenCalled();
        expect(NavigatorParameters.setParameters).toHaveBeenCalledWith(controller.app);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('./views/general/maps/individual-map.html')

    });

    it('goes to about appointment', function() {
        var spy = spyOn($window.navigator, 'pushPage');
        $timeout.flush();
        controller.aboutAppointment();
        expect(spy).toHaveBeenCalled();
    });
});