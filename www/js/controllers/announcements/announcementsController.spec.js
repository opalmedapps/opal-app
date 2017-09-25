/*
 * Filename     :   announcementsController.spec.js
 * Description  :   Tests the announcementsController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

"use strict";
describe('AnnouncementsController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;
    var NavigatorParameters;
    var Announcements;
    var Logger;
    var UserPreferences;

    beforeEach(inject(function(_$controller_, _NavigatorParameters_, _UserPreferences_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        Announcements = {
            getAnnouncements: function(){
                return true;
            },
            setLanguage: function(stuff){
                return true;
            }
        };
        NavigatorParameters= _NavigatorParameters_;
        Logger =  {
            sendLog: function(stuff, moreStuff){
                return true
            }
        };
        UserPreferences = _UserPreferences_;

        // Spies
        spyOn( UserPreferences, 'getLanguage' ).and.callFake( function() {
            return 'EN';
        } );
        spyOn( Announcements, 'getAnnouncements' ).and.returnValue(MockData.test_announcements);
        spyOn( Announcements, 'setLanguage' ).and.returnValue(MockData.english_test_annoucements);

        spyOn( NavigatorParameters, 'setParameters').and.returnValue(true);

        $controller = _$controller_;
        controller = $controller('AnnouncementsController', {NavigatorParameters: NavigatorParameters, Announcements: Announcements});

    }));

    describe('sanity test', function() {
        it('activates announcements properly', inject(function() {
            expect(controller.noAnnouncements).toBe(false);
            expect(controller.announcements).toEqual(MockData.english_test_annoucements);
        }));
    });
});