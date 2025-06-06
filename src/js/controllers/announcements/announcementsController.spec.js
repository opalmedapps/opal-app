// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   announcementsController.spec.js
 * Description  :   Tests the announcementsController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 */

"use strict";
describe('AnnouncementsController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('OpalApp'));

    var $controller;
    var controller;
    var Navigator;
    var Announcements;
    var UserPreferences;
    var $scope;

    var no_announcements = false;

    beforeEach(inject(function(_$controller_, _Navigator_, _UserPreferences_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        Announcements = {
            getAnnouncements: function(){
                return true;
            },
            setLanguage: function(stuff){
                return true;
            },
           readAnnouncementBySerNum: function(SerNum){
                return true;
            }
        };

        Navigator = _Navigator_;
        UserPreferences = _UserPreferences_;

        $scope = {
            generalNavigator: {
                pushPage: function(stuff) { return true }
            }
        };

        // Spies
        spyOn( UserPreferences, 'getLanguage' ).and.callFake( function() {
            return 'EN';
        } );

        if(no_announcements) {
            spyOn( Announcements, 'getAnnouncements' ).and.returnValue([]);
            spyOn( Announcements, 'setLanguage' ).and.returnValue([]);
        } else {
            spyOn( Announcements, 'getAnnouncements' ).and.returnValue(MockData.test_announcements);
            spyOn( Announcements, 'setLanguage' ).and.returnValue(MockData.english_test_announcements);
            spyOn( Announcements, 'readAnnouncementBySerNum' ).and.returnValue(true);
        }

        $controller = _$controller_;
        controller = $controller('AnnouncementsController', {Announcements: Announcements, Navigator: Navigator, $scope: $scope});

    }));

    describe('sanity test', function() {
        it('activates announcements properly', function() {
            expect(Announcements.getAnnouncements).toHaveBeenCalled();
            expect(Announcements.setLanguage).toHaveBeenCalled();
            expect(controller.noAnnouncements).toBe(false);
            expect(controller.announcements).toEqual(MockData.english_test_announcements);
        });
    });

    it('should go to individual announcement and read it if readStatus is 0', function() {
        expect(controller.announcements[1].ReadStatus).toBe('0');
        controller.goToAnnouncement(controller.announcements[1]);
        expect(Announcements.readAnnouncementBySerNum).toHaveBeenCalled();
        expect(controller.announcements[1].ReadStatus).toBe('1');

        no_announcements = true;
    });

    it('should display no announcements message', function() {
        expect(controller.announcements).toEqual([]);
        expect(controller.noAnnouncements).toBeTruthy();

        no_announcements = false
    });
});
