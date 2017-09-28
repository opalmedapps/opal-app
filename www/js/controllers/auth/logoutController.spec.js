/*
 * Filename     :   logoutController.spec.js
 * Description  :   Tests the logoutController
 * Created by   :   James Brace
 * Date         :   25 Sept 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

describe('LoginController', function() {
    beforeEach(function() {spyOn(ons, 'isWebView').and.returnValue(true)});
    beforeEach(module('MUHCApp'));

    var $controller;
    var controller;
    var $timeout;
    var $state;
    var UserAuthorizationInfo;
    var $filter;
    var DeviceIdentifiers;
    var UserPreferences;
    var Patient;
    var NewsBanner;
    var UUID;
    var Constants;
    var EncryptionService;
    var CleanUp;
    var $window;
    var $scope;
    var $rootScope;

    //States
    var DeviceIDError = false;
    var patientActive = false;
    var activationState = 'firstTime';

    beforeEach(inject(function(_$controller_, _UserPreferences_, _$timeout_, _UserAuthorizationInfo_, _$filter_, _UUID_, _Constants_, _EncryptionService_, _$rootScope_){

        $rootScope = _$rootScope_;
        // Mocks
        UserPreferences = _UserPreferences_;
        $timeout = _$timeout_;

        if(activationState === 'firstTime') {
            $window = {
                navigator: {
                    pushPage: function () {
                        return true;
                    }
                },
                localStorage: {
                    getItem: function (stuff) {
                        return null;
                    },
                    setItem: function (stuff, moreStuff) {
                        return stuff;
                    },
                    removeItem: function (stuff) {
                        return stuff
                    }
                },
                sessionStorage: {
                    getItem: function (stuff) {
                        return null;
                    },
                    setItem: function (stuff, moreStuff) {
                        return stuff;
                    },
                    removeItem: function (stuff) {
                        return stuff
                    }
                }

            }
        } else if (activationState === 'savedUser') {
            $window = {
                navigator: {
                    pushPage: function () {
                        return true;
                    }
                },
                localStorage: {
                    getItem: function (stuff) {
                        return stuff;
                    },
                    setItem: function (stuff, moreStuff) {
                        return stuff;
                    },
                    removeItem: function (stuff) {
                        return stuff
                    }
                },
                sessionStorage: {
                    getItem: function (stuff) {
                        return stuff;
                    },
                    setItem: function (stuff, moreStuff) {
                        return stuff;
                    },
                    removeItem: function (stuff) {
                        return stuff
                    }
                }

            }
        }


        $state = {
            go: function(stuff) {
                return true
            }
        };

        UserAuthorizationInfo = _UserAuthorizationInfo_;
        $filter = _$filter_;

        if(!DeviceIDError){
            DeviceIdentifiers = {
                sendIdentifiersToServer: function() {
                    return Promise.resolve(true)
                },
                sendFirstTimeIdentifierToServer: function() {
                    return Promise.resolve({securityQuestion_EN: 'this is a security question'})
                }
            };
        } else {
            DeviceIdentifiers = {
                sendIdentifiersToServer: function() {
                    return Promise.reject(true)
                },
                sendFirstTimeIdentifierToServer: function() {
                    return Promise.reject({securityQuestion_EN: 'this is a security question'})
                }
            };
        }

        if(patientActive) {
            Patient = {
                getUserSerNum: function(){
                    return true
                }
            }
        } else {
            Patient = {
                getUserSerNum: function(){
                    return false
                }
            }
        }

        NewsBanner = {
            showCustomBanner: function(stuff){
                return true;
            }
        };

        UUID = _UUID_;
        Constants = _Constants_;
        EncryptionService = _EncryptionService_;
        CleanUp = {
            clear: function(){
                return true;
            }
        };

        $scope = {
            securityModal: {
                show: function(){
                    return true;
                }
            }
        };


        // Spies
        spyOn( UserPreferences, 'getLanguage').and.callFake( function() {
            return 'EN';
        } );


        spyOn(Patient, 'getUserSerNum');

        $controller = _$controller_;
        controller = $controller('LoginController', {$timeout: $timeout, $state: $state,
            UserAuthorizationInfo: UserAuthorizationInfo, $filter: $filter, DeviceIdentifiers: DeviceIdentifiers,
            UserPreferences: UserPreferences, Patient: Patient, NewsBanner: NewsBanner, UUID: UUID, Constants: Constants,
            EncryptionService: EncryptionService, CleanUp: CleanUp, $window: $window, $scope: $scope});

    }));

    describe('sanity test', function() {
        it('activates login controller properly (first time/untrusted)', function() {
            $timeout.flush();
            expect(controller.alert.type).toBeFalsy();
            expect(controller.alert.message).toBeFalsy();
            expect(controller.trusted).toBeFalsy();
            expect(controller.email).toBe('');
            expect(Patient.getUserSerNum).toHaveBeenCalled();

            activationState = 'savedUser'
        });

        it('activates login controller properly (first time/untrusted)', function() {
            $timeout.flush();
            expect(controller.alert.type).toBeFalsy();
            expect(controller.alert.message).toBeFalsy();
            expect(controller.trusted).toBeTruthy();
            expect(controller.email).toBe('Email');
            expect(Patient.getUserSerNum).toHaveBeenCalled();

            activationState = 'firstTime';

        });
    });

    /********************************
     * TEST CASES:
     * 1) First time untrusted (success)
     * 2) First time trusted (success)
     * 3) Saved user untrusted (success)
     * 4) Saved user trusted (success)
     * 5) Locked out user (success)
     * 6 - 10) Same as above but unsuccessful
     */

    it('should login successfully (first time untrusted)', function(done) {
        var cleanupSpy = spyOn(CleanUp, 'clear');


        $timeout.flush();

        controller.email = 'muhca.pp.mobile@gmail.com';
        controller.password = '12345opal';

        controller.submit();
        done();
        $timeout.flush();
        // expect(cleanupSpy).toHaveBeenCalled();




    });
});