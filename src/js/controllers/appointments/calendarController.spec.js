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
describe('CalendarController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('OpalApp'));

    var $controller;
    var controller;
    var Navigator;
    var UserPreferences;
    var $scope;
    var $timeout;
    var Appointments;
    var $location;
    var $anchorScroll;


    var empty_appointments;
    var varied_date = false;

    beforeEach(inject(function(_$controller_, _Navigator_, _UserPreferences_, _$timeout_){

        Navigator = _Navigator_;
        UserPreferences = _UserPreferences_;
        $timeout = _$timeout_;

        $location = {
            hash: function(stuff) {
                return true;
            }
        };

        $anchorScroll = jasmine.createSpy('anchorScroll');

        if(!empty_appointments){
            if(!varied_date){
                Appointments = {
                    getAppointments: function() {
                        return MockData.test_appointments;
                    },
                    readAppointmentBySerNum: function(stuff){
                        return true;
                    }
                };
            } else {
                Appointments = {
                    getAppointments: function() {
                        return MockData.test_appointments_varied_date;
                    },
                    readAppointmentBySerNum: function(stuff){
                        return true;
                    }
                };
            }
        } else {
            Appointments = {
                getAppointments: function() {
                    return [];
                }
            };
        }

        // Spies
        $controller = _$controller_;
        controller = $controller('CalendarController', { Navigator: Navigator, $scope: $scope,
            UserPreferences: _UserPreferences_, Appointments: Appointments, $location: $location, $anchorScroll: $anchorScroll});

    }));

    describe('sanity test', function() {
        it('activates calendar and list properly', function() {
            expect(controller.loading).toBeTruthy();
            $timeout.flush();
            expect(controller.appointments).toBe(MockData.test_appointments);
            expect(controller.noAppointments).toBeFalsy();

            var date_today = new Date();
            date_today.setHours(0,0,0,0);
            expect(controller.dt).toEqual(date_today);
            expect(controller.loading).toBeFalsy();

            empty_appointments = true;
        });

        it('activates calendar and list properly (no appointments', function() {
            expect(controller.loading).toBeTruthy();
            $timeout.flush();
            expect(controller.appointments).toEqual([]);
            expect(controller.noAppointments).toBeTruthy();

            var date_today = new Date();
            date_today.setHours(0,0,0,0);
            expect(controller.dt).toEqual(date_today);
            expect(controller.loading).toBeFalsy();

            empty_appointments = false;
            varied_date = true;
        });
    });

    it('should return proper calendar colors based on date', function(){
        $timeout.flush();
        expect(controller.showColor(new Date('October 13, 2014 11:13:00'))).toBe('#5CE68A');
        expect(controller.showColor(new Date())).toBe('#3399ff');
        expect(controller.showColor(new Date('October 15, 2018 11:15:00'))).toBe('#cf5c4c');
        expect(controller.showColor(new Date('October 13, 2015 11:13:00'))).toBe('rgba(255,255,255,0.0)');
    });

    it('should return proper colors based on list item ', function(){
        $timeout.flush();

        expect(controller.getStyle(0)).toBe('#5CE68A');
        expect(controller.getStyle(1)).toBe('#3399ff');
        expect(controller.getStyle(2)).toBe('#cf5c4c');
    });

    //TODO: WRITE TEST FOR SHOWING HEADERS... HARD TO TEST SINCE IT RELIES ON THE INTERACTION WITH THE CALENDAR.

    it('should go to appointment', function(){
        var spy = spyOn(Appointments, 'readAppointmentBySerNum');
        $timeout.flush();

        controller.goToAppointment(controller.appointments[0]);
        expect(spy).toHaveBeenCalledTimes(0);

        controller.goToAppointment(controller.appointments[1]);
        expect(spy).toHaveBeenCalled();
    });
});
