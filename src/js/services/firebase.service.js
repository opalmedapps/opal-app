/**
 * @description Service providing access to the Firebase Realtime Database.
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Refactored by Stacey Beard in October 2023.
 */
import { getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { child, getDatabase, off, onValue, push, ref, remove, serverTimestamp, set } from "firebase/database";

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Firebase', Firebase);

    Firebase.$inject = ['Params'];

    function Firebase(Params) {
        let firebaseUrl = Params.firebaseBaseUrl;
        let app = getApp();
        let auth = getAuth();
        let database = getDatabase(app);
        let firebaseDBRef = ref(database, firebaseUrl);

        return {
            // Custom functions
            getCurrentUser: getCurrentUser,
            getDBRef: getDBRef,
            signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
            signOut: signOutOfFirebase,
            updateFirebaseUrl: updateFirebaseUrl,

            // Direct access to built-in Firebase functions
            off: off,
            onValue: onValue,
            push: push,
            remove: remove,
            serverTimestamp: serverTimestamp,
            set: set,
        }

        ////////////////

        /**
         * @description Gets a reference to the currently signed in user. Can be used to check whether a user is signed in.
         * @returns {User|null} The current user, or null if none is signed in.
         */
        function getCurrentUser() {
            return getAuth(app).currentUser;
        }

        /**
         * @description If a user is currently logged in, signs them out; otherwise does nothing.
         * @returns {Promise<void>}
         */
        async function signOutOfFirebase() {
            if (getCurrentUser()) {
                await signOut(auth)
                console.log('Signed out of Firebase');
            }
        }

        /**
         * @description Returns a DatabaseReference pointing to the required path.
         *              If no specific child reference is provided, the currently saved base reference is provided.
         * @param childRef The child reference to be returned (in relation to the base reference currently saved).
         * @returns {DatabaseReference} A reference from the base database reference to the provided child reference.
         */
        function getDBRef(childRef) {
            return childRef ? child(firebaseDBRef, childRef) : firebaseDBRef;
        }

        /**
         * @description Updates the currently saved base reference by combining the value of Params.firebaseBaseUrl
         *              with the provided extension.
         * @param extension The extension to append after Params.firebaseBaseUrl.
         */
        function updateFirebaseUrl(extension) {
            firebaseUrl = Params.firebaseBaseUrl + extension;
            firebaseDBRef = ref(database, firebaseUrl);
        }
    }
})();
