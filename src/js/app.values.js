(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Params', Params);

    /*
    This factory keeps track of all constants across the app.
     */

    Params.$inject = ['QuestionnaireConstants'];

    /* @ngInject */
    function Params (QuestionnaireConstants) {

        let appConstants =
            {
                maxIdleTimeAllowed: 300000,
                tenMinutesMilliSeconds: 600000,

                /** About Controller URLs **/
                aboutMuhcCase: 'aboutmuhc',
                aboutMuhcUrl: {
                    aboutMuhcUrlEn: 'https://muhc.ca/homepage/page/about-muhc',
                    aboutMuhcUrlFr: 'https://cusm.ca/homepage/page/propos-du-cusm'
                },
                cedarsCancerCenterCase: 'cedarscancercenter',
                cedarsCancerCenterUrl: {
                    cedarsCancerCenterUrlEn: 'https://muhc.ca/glen/cedars-cancer-centre',
                    cedarsCancerCenterUrlFr: 'https://cusm.ca/glen/page/centre-du-cancer-c%C3%A8dres'
                },
                cedarsCancerFoundationCase: 'cedarscancerfoundation',
                cedarsCancerFoundationUrl: {
                    cedarsCancerFoundationUrlEn: 'https://www.cedars.ca',
                    cedarsCancerFoundationUrlFr: 'https://www.cedars.ca'
                },
                cedarsCancerSupportCase: 'cedarscansupport',
                cedarsCanSupportUrl: {
                    cedarsCanSupportUrlEn: 'https://www.cansupport.ca/',
                    cedarsCanSupportUrlFr: 'https://www.cansupport.ca/fr/'
                },
                donationCase: 'donation',
                donationUrl: {
                    donationUrlEn: 'https://www.cedars.ca/en/how-to-help/donations',
                    donationUrlFr: 'https://www.cedars.ca/aidez-nous/donations'
                },
                opalWebsiteCase: 'opalwebsite',
                opalWebsiteUrl: {
                    opalWebsiteUrlEn: 'https://www.opalmedapps.com',
                    opalWebsiteUrlFr: 'https://www.opalmedapps.com/fr-selected'
                },
                appointmentType: {
                    appointmentTypeEn: 'appointment',
                    appointmentTypeFr: 'rendez-vous'
                },

                /** Alert Types and Classes **/
                alertTypeDanger: 'danger',
                alertTypeSuccess: 'success',
                alertTypeWarning: 'warning',
                alertTypeInfo: 'info',
                alertClassUpdateMessageError: 'bg-danger updateMessage-error',
                alertClassUpdateMessageSuccess: "bg-success updateMessage-success",

                /** Registration Link **/
                registrationPage: 'https://registration.opalmedapps.ca/#!/welcomePage',

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

                monthsArray: {
                    monthsArrayEn: ["January", "February", "March", "April", "May",
                        "June", "July", "August", "September", "October", "November", "December"],
                    monthsShortEn: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    monthsArrayFr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
                    monthsShortFr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.',
                        'août', 'sept.', 'oct.', 'nov.', 'déc.'],
                },
                daysArray: {
                    daysArrayFr: ['dimanche', 'lundi', 'mardi', 'mercredi',
                        'jeudi', 'vendredi', 'samedi'],
                    daysArrayEn: ["Sunday", "Monday", "Tuesday", "Wednesday",
                        "Thursday", "Friday", "Saturday"]
                },
                download: {
                    imageDownloadPngFr: 'Télécharger en image PNG',
                    imageDownloadPngEn: 'Download PNG image',
                    imageDownloadJpegFr: 'Télécharger en image JPEG',
                    imageDownloadJpegEn: 'Download JPEG image',
                    downloadPdfFr: 'Télécharger en document PDF',
                    downloadPdfEn: 'Download PDF document',
                    downloadSvgFr: 'Télécharger en document Vectoriel',
                    downloadSvgEn: 'Download SVG vector image'
                },
                exportButtonTitle: {
                    exportButtonTitleFr: 'Export du graphique',
                    exportButtonTitleEn: 'Graphics export'
                },
                loadingMessage: {
                    loadingMessageFr: 'Chargement en cours...',
                    loadingMessageEn: 'Loading...'
                },
                noPlotGeneric: {
                    noPlotGenericEn: "No plot available",
                    noPlotGenericFr: "Aucun graphique disponible",
                },
                noPlotNonNumeric: {
                    noPlotNonNumericEn: "These results can't be charted because at least one of them isn't a number",
                    noPlotNonNumericFr: "Ces résultats ne peuvent pas être représentés car au moins l'un d'entre eux n'est pas un nombre",
                },
                printChart: {
                    printChartFr: 'Imprimer le graphique',
                    printChartEn: 'Print chart'
                },
                resetZoom: {
                    resetZoomMessageFr: 'Réinitialiser le zoom',
                    resetZoomMessageTitleFr: 'Réinitialiser le zoom au niveau 1:1',
                    resetZoomMessageEn: 'Reset zoom',
                    resetZoomMessageTitleEn: 'Reset zoom level 1:1'
                },
                rangeSelector: {
                    rangeSelectorFromFr: 'Du',
                    rangeSelectorToFr: 'au',
                    rangeSelectorFromEn: 'From',
                    rangeSelectorToEr: 'to'
                },

                /** Parking Controller **/
                general: {
                    generalParkingTitleEn: 'Parking',
                    generalParkingTitleFr: 'Stationnement',
                    generalParkingUrl: 'https://www.depdocs.com/opal/parking/parking.php',
                    generalParkingGlenUrlEn: 'https://muhc.ca/patient-and-visitor-parking#glen',
                    generalParkingGlenUrlFr: 'https://cusm.ca/stationnement'
                },
                oncology: {
                    oncologyParkingTitleEn: 'Oncology Parking',
                    oncologyParkingTitleFr: 'Stationnement Radiothérapie',
                    oncologyParkingUrlEn: 'https://www.depdocs.com/opal/parking/oncology_parking.php',
                    oncologyParkingUrlFr: 'https://www.depdocs.com/opal/parking/radiotherapie_stationnement.php'
                },
                gettingHospitalUrl: {
                    gettingHospitalUrlEn: 'https://muhc.ca/glen',
                    gettingHospitalUrlFr: 'https://cusm.ca/glen'
                },

                /** ChangeSettingsController Constants **/
                setAliasParam: 'ALIAS',
                setAliasLowerCaseParam: 'Alias',
                setPhoneNumbersParam: 'PHONENUMBER',
                setEmailParam: 'EMAIL',
                setEmailType: 'email',
                setEmailField: 'Email',
                setPasswordType: 'password',
                setPasswordField: 'Password',
                setPasswordParam: 'PASSWORD',
                setLanguageParam: 'LANGUAGE',
                setLanguageParamProperCase: 'Language',
                setFirstLanguageInstruction: 'EN',
                setSecondLanguageInstruction: 'FR',
                setFontSizeParam: 'FONTSIZE',
                setFontOptionMedium: 'medium',
                setFontOptionLarge: 'large',
                setFontOptionExtraLarge: 'xlarge',
                setNicknameAlias: 'NICKNAME',
                setTelephoneNumberParam: 'TelNum',

                /** Status Controller **/
                setMap: {
                    'CT for Radiotherapy Planning': 1,
                    'Physician Plan Preparation': 2,
                    'Calculation of Dose': 3,
                    'Physics Quality Control': 4,
                    'Scheduling Treatments': 5
                },

                /** PlanningStep Service **/
                setSequence: {
                    'CT for Radiotherapy Planning': [],
                    'Physician Plan Preparation': [],
                    'Calculation of Dose': [],
                    'Physics Quality Control': [],
                    'Scheduling Treatments': []
                },

                /** GeneralTab Controller **/
                findDoctorCase: 'finddoctor',
                findDoctorUrl: {
                    findDoctorUrlEn: 'https://www.quebec.ca/en/health/finding-a-resource/registering-with-a-family-doctor/',
                    findDoctorUrlFr: 'https://www.quebec.ca/sante/trouver-une-ressource/inscription-aupres-dun-medecin-de-famille'
                },
                medicalSchedulerCase: 'medicalscheduler',
                medicalSchedulerUrl: {
                    medicalSchedulerUrlEn: 'https://www.rvsq.gouv.qc.ca/en/home',
                    medicalSchedulerUrlFr: 'https://www.rvsq.gouv.qc.ca/fr/accueil'
                },
                carnetSanteCase: 'carnetsante',
                carnetSanteUrl: 'https://carnetsante.gouv.qc.ca/portail',

                /** CheckIn Service Constants **/
                hospitalSite: {
                    hospitalCoordinates: [45.474127399999996, -73.6011402] //Glen Coordinates
                },

                /** EducationalMaterial Service Constants **/
                educationalMaterial: {
                    'Video': {
                        icon: 'fa fa-film',
                        color: '#ef5350'
                    },
                    'Factsheet': {
                        icon: 'fa fa-list',
                        color: '#1E88E5'
                    },
                    'Booklet': {
                        icon: 'fa fa-leanpub',
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
                        icon: 'fa fa-book',
                        color: '#FF7043'
                    },
                },

                /** Documents, doctors and patient service constants **/
                cdvDoctorsFilePathAndroid: 'cdvfile://localhost/files/Doctors/',
                cdvDoctorsFilePathIos: 'cdvfile://localhost/persistent/Doctors/',
                cdvDocumentFilePathAndroid: 'cdvfile://localhost/sdcard/Documents/',
                cdvDocumentFilePathIos: 'cdvfile://localhost/persistent/Documents/',
                cdvPatientFilePathAndroid: 'cdvfile://localhost/files/Patient/',
                cdvPatientFilePathIos: 'cdvfile://localhost/persistent/Patient/',

                /** newsBanner Service constants **/
                newsAlertTypes: {
                    'notifications': {
                        Type: 'notifications',
                        Color: '#5bc0de',
                        Message: "NEWNOTIFICATIONS",
                        Duration: 'short'
                    },
                    'nointernet': {
                        Type: 'nointernet',
                        Message: "NOINTERNETCONNECTION",
                        Duration: 10000
                    },
                    'connected': {
                        Type: 'connected',
                        Color: '#5cb85c',
                        Message: "CONNECTED",
                        Duration: 'short'
                    }
                },

                /** UpdateUi Service constants **/
                lastUpdateTimestamp: {
                    'All': 0,
                    'Appointments': 0,
                    'Messages': 0,
                    'Documents': 0,
                    'Tasks': 0,
                    'Doctors': 0,
                    'LabTests': 0,
                    'Patient': 0,
                    'Notifications': 0,
                    'EducationalMaterial': 0,
                    'Questionnaires': 0
                },

                /** Multi-institutional hospital modules and codes **/
                allowedModulesBeforeLogin: {
                    "DIA": 0,
                    "TRP": 0,
                    "APT": 0,
                    "LAB": 0,
                    "DOC": 0,
                    "TRT": 0,
                    "TTM": 0,
                    "QUE": 0,
                    "CSQ": 0,
                    "CHK": 0,
                    "LAO": 1,
                    "NTF": 0,
                    "ANN": 0,
                    "PAT": 0,
                    "PFP": 0,
                    "FEE": 0,
                    "FFD": 0,
                    "MAS": 0,
                    "EDU": 0,
                    "SUP": 0,
                    "CED": 0,
                    "HOS": 0,
                },
                localStorageHospitalKey: 'hospital',
                hospitalList: {
                    'MUHC': {
                        acronym: 'MUHC',
                        fullName: 'MUHC_FULL',
                        uniqueHospitalCode: 'A0',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 1,
                            "APT": 1,
                            "LAB": 1,
                            "DOC": 1,
                            "TRT": 1,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 1,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 1,
                            "PFP": 1,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 1,
                            "HOS": 1,
                        },
                    },
                    'CHUM': {
                        acronym: 'CHUM_ACRONYM',
                        fullName: 'CHUM_FULL',
                        uniqueHospitalCode: 'A2',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    },
                    'HMR': {
                        acronym: 'HMR_ACRONYM',
                        fullName: 'HMR_FULL',
                        uniqueHospitalCode: 'A3',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    },
                    'SMHC': {
                        acronym: 'SMHC_ACRONYM',
                        fullName: 'SMHC_FULL',
                        uniqueHospitalCode: 'A1',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    },
                    'CHU_SJ': {
                        acronym: 'CHU_SJ_ACRONYM',
                        fullName: 'CHU_SJ_FULL',
                        uniqueHospitalCode: 'A4',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    },
                    'Cite-de-la-sante': {
                        acronym: 'CITE_ACRONYM',
                        fullName: 'CITE_FULL',
                        uniqueHospitalCode: 'A5',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    },
                    'RI-MUHC': {
                        acronym: 'RI_MUHC_ACRONYM',
                        fullName: 'RI_MUHC_FULL',
                        uniqueHospitalCode: 'A6',
                        modules: {
                            "_comment": "LIST OF MODULES ENABLED IN THIS HOSPITAL. MODULE_CODE: 0 = DISABLED; 1 = ENABLED; NO QUOTATION MARKS; SEE EXAMPLES BELOW",
                            "DIA": 1,
                            "TRP": 0,
                            "APT": 1,
                            "LAB": 0,
                            "DOC": 0,
                            "TRT": 0,
                            "TTM": 1,
                            "QUE": 1,
                            "CSQ": 1,
                            "CHK": 0,
                            "LAO": 1,
                            "NTF": 1,
                            "ANN": 1,
                            "PAT": 0,
                            "PFP": 0,
                            "FEE": 1,
                            "FFD": 1,
                            "MAS": 1,
                            "EDU": 1,
                            "SUP": 1,
                            "CED": 0,
                            "HOS": 0,
                        },
                    }
                }
            };

        let allConstants = Object.assign(appConstants, QuestionnaireConstants);

        return allConstants;
    }
}) ();


