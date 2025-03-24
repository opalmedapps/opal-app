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

    User.$inject = ['$injector','Params','RequestToServer'];

    function User($injector, Params, RequestToServer) {

        let userInfo;

        return {
            getUserInfo: () => userInfo,
            initUser: initUser,
            getSelfPatientSerNum: getSelfPatientSerNum,
        };

        async function initUser() {
            const requestParams = Params.API.ROUTES.USER;
            const result = await RequestToServer.apiRequest(requestParams);
            userInfo = result?.data;
            assignColor();
        }

        /**
         * @desc Finds and returns the user's own "self" profile, if they have one and if its status is confirmed.
         * @returns {object} The user's "self" profile, or undefined if they don't have one or if it isn't confirmed.
         */
        function getSelfProfile() {
            const ProfileSelector = $injector.get('ProfileSelector');
            return ProfileSelector.getPatientList().find(profile => {
                return profile?.relationship_type?.role_type === "SELF"
                    && profile?.status === Params.relationshipStatus.confirmed;
            });
        }

        /**
         * @desc Finds and returns the user's own PatientSerNum, if they have a "self" relationship.
         * @returns {*} The user's "self" PatientSerNum, or undefined if they don't have one.
         */
        function getSelfPatientSerNum() {
            let selfProfile = getSelfProfile();
            return selfProfile?.patient_legacy_id;
        }

        // Assigns a color to the current user, to be able to use their info similarly to other profiles (i.e. for profile icons with the initials)
        function assignColor() {
            let selfProfile = getSelfProfile();
            if (selfProfile) userInfo.color = selfProfile.color;
            else userInfo.color = '#41A4AF';
        }
    }
})();
