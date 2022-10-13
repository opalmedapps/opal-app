/**
 * @description Service to store and handle information about the currently logged in user.
 * @author David Gagne
 * @date 2022-10-13
 */
 (function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('User', User);

    function User() {

        let loggedinUserPatientProfile;

        return {
            getLoggedinUserProfile: () => loggedinUserPatientProfile,
            getLoggedinUserId: () => loggedinUserPatientProfile.patient_legacy_id,
            setUserProfile: setUserProfile,
        };

        function setUserProfile(profileList, userLegacyId) {
            loggedinUserPatientProfile = profileList.find((profile => {
                return profile.patient_legacy_id === userLegacyId;
            }));
        }
    }
})();
