/*
 * Filename     :   logoutController.spec.js
 * Description  :   Tests the logoutController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
"use strict";
describe('LogoutController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;

    var FirebaseService;
    var $state;
    var RequestToServer;
    var CleanUp;
    var UserAuthorizationInfo;
    var $window;

    beforeEach(inject(function(_$controller_,  _UserAuthorizationInfo_){


        // Mocks
        $state = {
            go: function(stuff) {
                return true
            }
        };

        UserAuthorizationInfo = _UserAuthorizationInfo_;

        CleanUp = {
            clear: function(){
                return true;
            }
        };

        FirebaseService = {
            getDBRef: function(stuff){
                // console.log('called');
                return { remove: function() {return true;}}
            },
            signOut: function(){
                return true
            }
        };

        RequestToServer = {
            sendRequest: function(stuff) {
                return stuff;
            }
        };

        $window = {
            sessionStorage: {
                removeItem: function(){
                    return true;
                }
            }
        };

        //Spies
        spyOn(FirebaseService, 'getDBRef').and.returnValue({ remove: function() {return true;}});
        spyOn(FirebaseService, 'signOut');

        spyOn($window.sessionStorage, 'removeItem');
        spyOn(RequestToServer, 'sendRequest');
        spyOn(CleanUp, 'clear');
        spyOn($state, 'go');

        $controller = _$controller_;
        controller = $controller('logOutController', { $state: $state,
            UserAuthorizationInfo: UserAuthorizationInfo, CleanUp: CleanUp, FirebaseService: FirebaseService, RequestToServer: RequestToServer, $window: $window});

    }));

    describe('sanity test', function() {
        it('should logout properly',  inject(function($timeout) {
            $timeout.flush();
            expect(FirebaseService.getDBRef).toHaveBeenCalled();
            expect($window.sessionStorage.removeItem).toHaveBeenCalled();
            expect(RequestToServer.sendRequest).toHaveBeenCalled();
            expect(CleanUp.clear).toHaveBeenCalled();
            expect(FirebaseService.signOut).toHaveBeenCalled();
            expect($state.go).toHaveBeenCalled();


        }));
    });

});