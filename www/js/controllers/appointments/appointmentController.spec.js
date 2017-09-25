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
    var Announcements;
    var UserPreferences;
    var $scope;

    var no_announcements = false;

    beforeEach(inject(function(_$controller_, _NavigatorParameters_, _UserPreferences_){

        NavigatorParameters= _NavigatorParameters_;
        UserPreferences = _UserPreferences_;
        var $window = {
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
        spyOn( NavigatorParameters, 'getParameters').and.returnValue(true);

        $controller = _$controller_;
        controller = $controller('AnnouncementsController', {Announcements: Announcements, NavigatorParameters: NavigatorParameters, $scope: $scope});

    }));

    describe('sanity test', function() {
        it('activates announcements properly', function() {
            expect(Announcements.getAnnouncements).toHaveBeenCalled();
            expect(Announcements.setLanguage).toHaveBeenCalled();
            expect(controller.noAnnouncements).toBe(false);
            expect(controller.announcements).toEqual(MockData.english_test_annoucements);
        });
    });

});