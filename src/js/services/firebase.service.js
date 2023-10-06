/**
 * @description Service providing access to the Firebase Realtime Database.
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Refactored by Stacey Beard in October 2023.
 */
import { getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { child, getDatabase, off, onValue, push, ref, serverTimestamp, set } from "firebase/database";

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
            getAuthentication: () => getAuth(app),
            getAuthenticationCredentials: () => getAuth(app).currentUser,
            getFirebaseChild: getFirebaseChild,
            getDBRef: getDBRef,
            onValue: onValue,
            off: off,
            push: push,
            serverTimestamp: serverTimestamp,
            set: set,
            signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
            signOut: () => signOut(auth).then(logSignOut),
            updateFirebaseUrl: updateFirebaseUrl,
        }

        ////////////////

        function getFirebaseChild(child) {
            switch (child) {
                case 'users':
                    return 'users/';
                case 'requests':
                    return 'requests/';
                case 'logged_in_users':
                    return 'logged_in_users/';
                default:
                    return '';
            }
        }

        function getDBRef(ref) {
            if (ref) {
                return child(firebaseDBRef, ref);
            } else {
                return firebaseDBRef;
            }
        }

        function logSignOut() {
            console.log('Signed out of Firebase');
        }

        function updateFirebaseUrl(extension) {
            firebaseUrl = Params.firebaseBaseUrl + extension;
            firebaseDBRef = ref(database, firebaseUrl);
        }
    }
})();
