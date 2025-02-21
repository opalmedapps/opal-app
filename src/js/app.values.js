(function() {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Params', Params);

    /*
    This factory keeps track of all constants across the app.
     */

    Params.$inject = ['QuestionnaireConstants', 'RequestConstants', 'ApiConstants', 'NotificationConstants'];

    /* @ngInject */
    function Params (QuestionnaireConstants, RequestConstants, ApiConstants, NotificationConstants) {

        let appConstants =
            {
                maxIdleTimeAllowed: 300000, // 300 000 ms = 5 min. If changed, also edit the "INACTIVE" string
                tenMinutesMilliSeconds: 600000,
                requestTimeout: 30000,

                firebaseBaseUrl: 'dev3/',

                /** Alert Types and Classes **/
                alertTypeDanger: 'danger',
                alertTypeSuccess: 'success',
                alertTypeWarning: 'warning',
                alertTypeInfo: 'info',

                /** Firebase Authentication Error Codes **/
                invalidEmail: 'auth/invalid-email',
                invalidPassword: 'auth/wrong-password',
                invalidUser: 'auth/user-not-found',
                largeNumberOfRequests: 'auth/too-many-requests',
                userDisabled: 'auth/user-disabled',
                userMismatch: 'auth/user-mismatch',
                networkRequestFailure: 'auth/network-request-failed',
                expiredActionCode: 'auth/expired-action-code',
                invalidActionCode: 'auth/invalid-action-code',
                invalidCredentials: 'auth/invalid-credential',
                emailInUse: 'auth/email-already-in-use',
                weakPassword: 'auth/weak-password',

                /** ChangeSettingsController Constants **/
                setPasswordField: 'Password',
                setPasswordParam: 'PASSWORD',
                setLanguageParam: 'LANGUAGE',
                setLanguageParamProperCase: 'Language',
                settingsLanguageOptions: ['EN', 'FR'],
                setFontSizeParam: 'FONTSIZE',
                settingFontOptions: [
                    {size: 'medium', style: 'fontDescMedium', text: 'SMALL'},
                    {size: 'large', style: 'fontDescLarge', text: 'MEDIUM'},
                    {size: 'xlarge', style: 'fontDescXlarge', text: 'LARGE'}
                ],

                /** Password settings **/
                minPasswordLength: 10,
                maxPasswordLength: 50,
                minPasswordStrengthLevel: 3,

                /** CheckIn Service Constants **/
                checkinRadiusMeters: 500,

                /** EducationalMaterial Service Constants **/
                educationalMaterial: {
                    'Video': {
                        icon: 'fa fa-film',
                        color: '#ef5350'
                    },
                    'Factsheet': {
                        icon: 'fa-solid fa-file-lines',
                        color: '#1E88E5'
                    },
                    'Booklet': {
                        icon: 'fa-solid fa-book-open',
                        color: '#66BB6A'
                    },
                    'Treatment Guidelines': {
                        icon: 'fa fa-list-ol',
                        color: '#7E57C2'
                    },
                    'Package': {
                        icon: 'fa fa-cube',
                        color: '#8A5B45'
                    },
                    'Other': {
                        icon: 'fa-solid fa-file',
                        color: '#FFDF80'
                    },
                },

                /** Multi-institutional hospital modules and codes **/
                allowedModulesBeforeLogin: {
                    "DIA": 0,
                    "APT": 0,
                    "LAB": 0,
                    "DOC": 0,
                    "TTM": 0,
                    "QUE": 0,
                    "CSQ": 0,
                    "RES": 0,
                    "STU": 0,
                    "REF": 0,
                    "RQU": 0,
                    "CON": 0,
                    "CHK": 0,
                    "ABT": 1,
                    "NTF": 0,
                    "ANN": 0,
                    "PAT": 0,
                    "FEE": 0,
                    "FFD": 0,
                    "MAS": 0,
                    "EDU": 0,
                    "SUP": 1,
                    "SMD": 0,
                    "CTB": 1,
                    "RFE": 0,
                },
                localStorageHospitalKey: 'hospital',
                hospitalList: [
                    {
                        uniqueHospitalCode: 'A6',
                        acronymReal: 'NEURO_ACRONYM',
                        fullNameReal: 'NEURO_FULL',
                        acronymGeneric: 'OMI',
                        fullNameGeneric: 'OMI_FULL',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "APT": 1,
                            "LAB": 1,
                            "DOC": 1,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "RES": 1,
                            "STU": 0,
                            "REF": 1,
                            "RQU": 1,
                            "CON": 1,
                            "CHK": 1,
                            "ABT": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 1,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                            "SMD": 1,
                            "CTB": 1,
                            "RFE": 1,
                        },
                    },
                    {
                        uniqueHospitalCode: 'A4',
                        acronymReal: '',
                        fullNameReal: '',
                        acronymGeneric: 'OHIGPH',
                        fullNameGeneric: 'OHIGPH_FULL',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "APT": 1,
                            "LAB": 1,
                            "DOC": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "RES": 0,
                            "STU": 0,
                            "REF": 1,
                            "RQU": 0,
                            "CON": 0,
                            "CHK": 0,
                            "ABT": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 1,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                            "SMD": 0,
                            "CTB": 1,
                            "RFE": 1,
                        },
                    },
                    {
                        uniqueHospitalCode: 'D1',
                        acronymReal: 'OPAL_DEMO_1',
                        fullNameReal: 'OPAL_DEMO_1_FULL',
                        acronymGeneric: 'OPAL_DEMO_1',
                        fullNameGeneric: 'OPAL_DEMO_1_FULL',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "APT": 1,
                            "LAB": 1,
                            "DOC": 1,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "RES": 1,
                            "STU": 0,
                            "REF": 1,
                            "RQU": 1,
                            "CON": 1,
                            "CHK": 1,
                            "ABT": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 1,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                            "SMD": 1,
                            "CTB": 1,
                            "RFE": 1,
                        },
                    },
                    {
                        uniqueHospitalCode: 'D2',
                        acronymReal: 'OPAL_DEMO_2',
                        fullNameReal: 'OPAL_DEMO_2_FULL',
                        acronymGeneric: 'OPAL_DEMO_2',
                        fullNameGeneric: 'OPAL_DEMO_2_FULL',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "APT": 1,
                            "LAB": 1,
                            "DOC": 1,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "RES": 1,
                            "STU": 0,
                            "REF": 1,
                            "RQU": 1,
                            "CON": 1,
                            "CHK": 1,
                            "ABT": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 1,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                            "SMD": 1,
                            "CTB": 1,
                            "RFE": 1,
                        },
                    },
                ],
                relationshipStatus: {
                    pending: 'PEN',
                    confirmed: 'CON',
                    denied: 'DEN',
                    expired: 'EXP',
                    revoked: 'REV',
                }
            };

        // Return an assembled object containing all constants
        return {
            ...appConstants,
            ...QuestionnaireConstants,
            ...NotificationConstants,
            REQUEST: {
                ...RequestConstants
            },
            API: {
                ...ApiConstants
            }
        };
    }
}) ();
