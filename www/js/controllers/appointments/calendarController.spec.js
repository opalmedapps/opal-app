/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-09-25
 * Time: 4:07 PM
 */

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
describe('CalendarController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;
    var NavigatorParameters;
    var UserPreferences;
    var $scope;
    var $timeout;
    var $window;
    var Appointments;
    var $location;
    var $anchorScroll;


    var empty_appointments;
    var varied_date = false;

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

        $location = {
            hash: function(stuff) {
                return true;
            }
        };

        $anchorScroll = jasmine.createSpy('anchorScroll');

        if(!empty_appointments){
            if(!varied_date){
                Appointments = {
                    getUserAppointments: function(){
                        return MockData.test_appointments;
                    }
                };
            } else {
                Appointments = {
                    getUserAppointments: function(){
                        return MockData.test_appointments_varied_date;
                    }
                };
            }
        } else {
            Appointments = {
                getUserAppointments: function(){
                    return [];
                }
            };
        }


        // Spies
        spyOn( UserPreferences, 'getLanguage' ).and.callFake( function() {
            return 'EN';
        } );


        spyOn( NavigatorParameters, 'setParameters').and.returnValue(true);
        spyOn( NavigatorParameters, 'getParameters').and.returnValue({Navigator: 'navigator'});


        $controller = _$controller_;
        controller = $controller('CalendarController', { NavigatorParameters: NavigatorParameters, $scope: $scope,
            UserPreferences: _UserPreferences_, $window: $window, Appointments: Appointments, $location: $location, $anchorScroll: $anchorScroll});

    }));

    describe('sanity test', function() {
        it('activates calendar and list properly', function() {
            var spy = spyOn($location, 'hash');
            expect(controller.loading).toBeTruthy();
            $timeout.flush();
            expect(controller.appointments).toBe(MockData.test_appointments);
            expect(controller.noAppointments).toBeFalsy();
            expect(controller.language).toBe('EN');

            var date_today = new Date();
            date_today.setHours(0,0,0,0);
            expect(controller.dt).toEqual(date_today);
            expect(controller.loading).toBeFalsy();

            empty_appointments = true;
        });

        it('activates calendar and list properly (no appointments', function() {
            var spy = spyOn($location, 'hash');
            expect(controller.loading).toBeTruthy();
            $timeout.flush();
            expect(controller.appointments).toEqual([]);
            expect(controller.noAppointments).toBeTruthy();
            expect(controller.language).toBe('EN');

            var date_today = new Date();
            date_today.setHours(0,0,0,0);
            expect(controller.dt).toEqual(date_today);
            expect(controller.loading).toBeFalsy();

            empty_appointments = false;
            varied_date = true;
        });
    });

    it('should return proper colors based on date', function(){
        $timeout.flush();
        expect(controller.showColor(new Date('October 13, 2014 11:13:00'))).toBe('#5CE68A');
        expect(controller.showColor(new Date())).toBe('#3399ff');
        expect(controller.showColor(new Date('October 15, 2018 11:15:00'))).toBe('#cf5c4c');
        expect(controller.showColor(new Date('October 13, 2015 11:13:00'))).toBe('rgba(255,255,255,0.0)');
    })

});