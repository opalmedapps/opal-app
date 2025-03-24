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
describe('SecurityQuestionController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;

    var $window;
    var $timeout;
    var ResetPassword;
    var RequestToServer;
    var EncryptionService;
    var UUID;
    var UserAuthorizationInfo;
    var $state;
    var Constants;
    var DeviceIdentifiers;
    var NavigatorParameters;
    var $scope;

    //State
    var passwordRest = false;

    beforeEach(inject(function(_$controller_,  _UserAuthorizationInfo_, _$timeout_, _ResetPassword_, _EncryptionService_, _UUID_, _Constants_, _NavigatorParameters_){
        // Mocks
        $window = Mocks.$window;
        $timeout = _$timeout_;
        ResetPassword = _ResetPassword_;
        RequestToServer = Mocks.RequestToServer;
        EncryptionService = _EncryptionService_;
        UUID = _UUID_;
        UserAuthorizationInfo = _UserAuthorizationInfo_;
        $state = Mocks.$state;
        Constants = _Constants_;
        DeviceIdentifiers = Mocks.DeviceIdentifiers;
        NavigatorParameters = _NavigatorParameters_;
        $scope = {
            initNavigator: {
                pushPage: function(stuff) {
                    return stuff
                },
                once: function(stuff, func) {
                    return stuff
                }
            }
        };

        //Spies
        if(!passwordRest){
            spyOn( NavigatorParameters, 'getNavigator').and.returnValue({getCurrentPage: function(){ return {options: {trusted: false, securityQuestion: 'this is a question'}}}});
        } else {
            spyOn( NavigatorParameters, 'getNavigator').and.returnValue({getCurrentPage: function(){ return {options: {trusted: false, securityQuestion: 'this is a question', passwordReset: true}}}});
            spyOn( ResetPassword, 'verifyLinkCode').and.returnValue(Promise.resolve('email'));
            spyOn( UserAuthorizationInfo, 'setEmail').and.returnValue(true);
            spyOn( DeviceIdentifiers, 'sendDevicePasswordRequest')
        }

        spyOn( UUID, 'getUUID').and.returnValue('UUID');

        $controller = _$controller_;

        if(!passwordRest){
            controller = $controller('SecurityQuestionController', {$window: $window, $timeout: $timeout, ResetPassword: ResetPassword,
                RequestToServer: RequestToServer, EncryptionService: EncryptionService, UUID: UUID, UserAuthorizationInfo: UserAuthorizationInfo,
                $state: $state, Constants:Constants, DeviceIdentifiers: DeviceIdentifiers, NavigatorParameters: NavigatorParameters, $scope: $scope});
        }

    }));

    describe('sanity test', function() {
        it('should activate properly for login use case',  function() {

            expect(controller.attempts).toBe(0);
            expect(UUID.getUUID).toHaveBeenCalled();
            expect(controller.Question).toBe('this is a question');
            passwordRest = true;
        });
        it('should activate properly for password reset',  function(done) {
            controller = $controller('SecurityQuestionController', {$window: $window, $timeout: $timeout, ResetPassword: ResetPassword,
                RequestToServer: RequestToServer, EncryptionService: EncryptionService, UUID: UUID, UserAuthorizationInfo: UserAuthorizationInfo,
                $state: $state, Constants:Constants, DeviceIdentifiers: DeviceIdentifiers, NavigatorParameters: NavigatorParameters, $scope: $scope});

            expect(controller.attempts).toBe(0);
            expect(UUID.getUUID).toHaveBeenCalled();
            expect(controller.passwordReset).toBeTruthy();
            expect(ResetPassword.verifyLinkCode).toHaveBeenCalled();

            $timeout.flush();

            expect(UserAuthorizationInfo.setEmail).toHaveBeenCalled();
            expect(DeviceIdentifiers.sendDevicePasswordRequest).toHaveBeenCalled();
            expect(controller.Question).toBe('english question / french question');

            done();
        });
    });

});