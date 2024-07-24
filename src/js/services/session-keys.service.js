/**
 * @description Proof of concept of session key encryption.
 * @author Stacey Beard
 */

import _sodium from 'libsodium-wrappers';

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .service('SessionKeys', SessionKeys);

    SessionKeys.$inject = ['UserHospitalPreferences'];

    function SessionKeys(UserHospitalPreferences) {
        // Sodium library in its ready state
        let sodium;

        // { keyType, privateKey, publicKey }
        let userPublicKeyPair;

        let hospitalPublicKey;

        // { sharedRx, sharedTx }
        let userSessionKeys;

        let getIncomingKey = () => userSessionKeys.sharedRx;
        let getOutgoingKey = () => userSessionKeys.sharedTx;

        return {
            init: init,
            getIncomingKey: getIncomingKey,
            getOutgoingKey: getOutgoingKey,
            getUserPublicKey: () => sodium.to_hex(userPublicKeyPair.publicKey),
        }

        async function init() {
            await _sodium.ready;
            sodium = _sodium;

            generatePublicKeyPair();
            hospitalPublicKey = getHospitalPublicKey('A0');
            console.log('Hospital public key is', sodium.to_hex(hospitalPublicKey));
            generateSessionKeys();
        }

        function getHospitalPublicKey(code) {
            // TODO implement getting keys externally
            return sodium.from_hex(UserHospitalPreferences.getHospitalByCode(code).publicKey);
        }

        function generatePublicKeyPair() {
            userPublicKeyPair = sodium.crypto_box_keypair();
            console.log('Generated app user keypair', userPublicKeyPair.keyType, sodium.to_hex(userPublicKeyPair.publicKey));
        }

        function generateSessionKeys() {
            let userSessionKeys = sodium.crypto_kx_client_session_keys(userPublicKeyPair.publicKey, userPublicKeyPair.privateKey, hospitalPublicKey);
            console.log('Generated session keys', userSessionKeys);
        }

        async function generateSessionId() {
            // Generate a session ID with a length of 32 bytes
            // Session ID length: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-id-length
            return sodium.randombytes_buf(32);
        }
    }
})();
