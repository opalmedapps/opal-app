// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   appointmentController.spec.js
 * Description  :   Tests the appointmentController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 */

"use strict";
describe('AppointmentController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('OpalApp'));

    var $controller;
    var controller;
    var Navigator;
    var UserPreferences;
    var $scope;
    var $timeout;
    var $window;

    var isCorrupted = false;

    beforeEach(inject(function(_$controller_, _Navigator_, _UserPreferences_, _$timeout_){

        Navigator= _Navigator_;
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
        if(!isCorrupted){
            spyOn( Navigator, 'getParameters').and.returnValue({Post: MockData.test_appointments[0]});

        } else {
            spyOn( Navigator, 'getParameters').and.returnValue({Post: {}});
        }

        $controller = _$controller_;
        controller = $controller('AppointmentController', { Navigator: Navigator, $scope: $scope, UserPreferences: _UserPreferences_, $window: $window});

    }));

    describe('sanity test', function() {
        it('activates appointment properly', function() {
            $timeout.flush();
            expect(controller.app).toBe(MockData.test_appointments[0]);
            expect(controller.corrupted_appointment).toBeFalsy();

            isCorrupted = true;

        });
        it('detects corrupted appointment', function() {
            $timeout.flush();
            expect(controller.app).toEqual({});
            expect(controller.corrupted_appointment).toBeTruthy();

            isCorrupted = false;
        });
    });

    it('goes to about appointment', function() {
        var spy = spyOn($window.navigator, 'pushPage');
        $timeout.flush();
        controller.aboutAppointment();
        expect(spy).toHaveBeenCalled();
    });
});
