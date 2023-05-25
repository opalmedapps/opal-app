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

    User.$inject = ['$injector'];

    function User($injector) {

        let loggedinUserPatientProfile;

        return {
            getLoggedinUserProfile: () => loggedinUserPatientProfile,
            setUserProfile: setUserProfile,
            getSelfPatientSerNum: getSelfPatientSerNum,
        };

        function setUserProfile(profileList, userLegacyId) {
            // TODO: rewrite this function to call Django API to get user info.
            //  Also make sure to assign a color: either same as self, or a new one.
            loggedinUserPatientProfile = profileList.find(profile => {
                console.log(profile);
                return profile.patient_legacy_id === userLegacyId;
            });
        }

        /**
         * @desc Finds and returns the user's own PatientSerNum, if they have a "self" relationship.
         * @returns {*} The user's "self" PatientSerNum, or undefined if they don't have one.
         */
        function getSelfPatientSerNum() {
            const ProfileSelector = $injector.get('ProfileSelector');
            let selfProfile = ProfileSelector.getPatientList().find(profile => profile?.relationship_type?.role_type === "SELF");
            return selfProfile?.patient_legacy_id;
        }
    }
})();
