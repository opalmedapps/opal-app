(function() {
    'use strict'
    var app = angular.module('MUHCApp');

    app.value('Params', {
        maxIdleTimeAllowed: 300000,
        tenMinutesMilliSeconds: 600000,
        timeoutInterval: 60000,

        /** About Controller URL's **/
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
            cedarsCancerFoundationUrlEn: 'https://www.cedars.ca/cedars/en/home',
            cedarsCancerFoundationUrlFr: 'https://www.cedars.ca/cedars/fr/home'
        },
        cedarsCancerSupportCase: 'cedarscansupport',
        cedarsCanSupportUrl: {
            cedarsCanSupportUrlEn: 'http://www.cansupport.ca/',
            cedarsCanSupportUrlFr: 'http://www.cansupport.ca/fr'
        },
        donationCase: 'donation',
        donationUrl: {
            donationUrlEn: 'https://www.cedars.ca/cedars/en/donate/donate_online?designation=radiation-oncology-opal-fund',
            donationUrlFr: 'https://www.cedars.ca/cedars/fr/donate/donate_online?designation=radiation-oncology-opal-fund'
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

        alertTypeDanger: 'danger',
        alertTypeSuccess: 'success',
        alertTypeWarning: 'warning',
        alertTypeInfo: 'info',
        notAllowedResponse: 'NOT_ALLOWED',
        successResponse: 'SUCCESS',
        alertClassUpdateMessageError: 'bg-danger updateMessage-error',
        alertClassUpdateMessageSuccess: "bg-success updateMessage-success",


        /** Error Constants **/
        invalidEmail: 'auth/invalid-email',
        invalidPassword: 'auth/wrong-password',
        invalidUser: 'auth/user-not-found',
        largeNumberOfRequests: 'auth/too-many-requests',
        userDisabled: 'auth/user-disabled',
        userMismatch: 'auth/user-mismatch',
        networkRequestFailure: 'auth/network-request-failed',
        expiredActionCode: 'auth/expired-action-Code',
        invalidActionCode: 'auth/invalid-action-code',
        invalidCredentials: 'auth/invalid-credential',
        emailInUse: 'auth/email-already-in-use',
        weakPassword: 'auth/weak-password',
        passwordDisrespectCase: 'password-disrespects-criteria',

        forgotPasswordAlertSuccess: 'success',
        forgotPasswordAlertSuccessMessage: 'RESET_PASSWORD_SENT',
        invalidPasswordMessage: 'INVALID_PASSWORD',
        loginEmailFailureMessage: 'INVALID_EMAIL_OR_PWD',
        loginDisabledUserMessage: 'USER_DISABLED',
        invalidUserAssociation: 'INVALID_ASSOCIATION',
        invalidCredentialsMessage: 'INVALID_CREDENTIAL',
        loginNetworkErrorMessage: 'ERROR_NETWORK',
        loginLimitExceededMessage: 'LIMITS_EXCEEDED',
        loginEncryptionErrorMessage: 'ENCRYPTION_ERROR',
        loginGenericErrormessage: 'ERROR_GENERIC',
        loginWrongHashMessage: 'WRONG_SAVED_HASH',
        corruptedDataCase: 'corrupted-data',
        wrongAnswerCase: 'wrong-answer',
        invalidUserMessage: 'INVALID_USER',
        invalidEmailMessage: 'INVALID_EMAIL',
        outOfTriesMessage: 'OUTOFTRIES',
        corruptedDataMessage: 'CONTACTHOSPITAL',
        wrongAnswerMessage: 'ERRORANSWERNOTMATCH',
        networkErrorMessage: 'INTERNETERROR2',
        secondNetworkErrorMessage: 'INTERNETERROR',
        enterSecurityQuestionAnswerMessage: 'ENTERANANSWER',
        emailInUseMessage: 'EMAIL_TAKEN',
        passwordDisrespectMessage: 'PASSWORD_CRITERIA',


        /** SetNewPassword Controller Constants **/
        weakPasswordCase: 'auth/weak-password',
        setNewPasswordMessage: 'ENTERVALIDPASSWORD',
        passwordMismatchMessage: 'Passwords do no match!',
        passwordUpdateMessage: 'PASSWORDUPDATED',
        invalidActionCodeMessage: 'CODE_INVALID',
        expiredActionCodeMessage: 'CODE_EXPIRED',
        weakPasswordMessage: 'WEAK_PASSWORD',
        passwordServerErrorMessage: 'PASSWORDRESETSERVERERROR',

        /** CheckIn Controller **/
        checkinHospitalMessage: 'CHECKIN_IN_HOSPITAL_ONLY',
        checkedInMessage: 'CHECKED_IN',
        checkinErrorMessage: 'CHECKIN_ERROR',
        checkinNoneMessage: 'CHECKIN_NONE',
        checkInAfterMessage: 'CHECKIN_MESSAGE_AFTER',
        checkInBeforeMessage: 'CHECKIN_MESSAGE_BEFORE',
        checkInBeforePluralMessage: 'CHECKIN_MESSAGE_BEFORE_PLURAL',
        checkInAfterPluralMessage: 'CHECKIN_MESSAGE_AFTER_PLURAL',

        /** Content Controller **/
        radiothereapyString: 'Daily Radiotherapy Treatment',
        noContentMessage: 'NO_CONTENT',
        noPageResponseCase: 'NO_PAGE',

        monthsArray: {
            monthsArrayEn: [ "January" , "February" , "March" , "April" , "May" ,
                "June" , "July" , "August" , "September" , "October" , "November" , "December"],
            monthsShortEn: [ "Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" ,
                "Jul" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"],
            monthsArrayFr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            monthsShortFr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.',
                'août', 'sept.', 'oct.', 'nov.', 'déc.'],
        },
        daysArray: {
            daysArrayFr: ['dimanche', 'lundi', 'lardi', 'mercredi',
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
        general:{
            generalParkingTitleEn: 'Parking',
            generalParkingTitleFr: 'Stationnement',
            generalParkingUrl: 'https://www.depdocs.com/opal/parking/parking.php',
            generalParkingGlenUrlEn: 'https://muhc.ca/patient-and-visitor-parking#glen',
            generalParkingGlenUrlFr:  'https://cusm.ca/stationnement'
        },
        oncology: {
            oncologyParkingTitleEn: 'Oncology Parking',
            oncologyParkingTitleFr: 'Stationnement Radiothérapie',
            oncologyParkingUrl: 'https://www.depdocs.com/opal/parking/oncology_parking.php'
        },
        gettingHospitalUrl: {
            gettingHospitalUrlEn: 'https://muhc.ca/glen',
            gettingHospitalUrlFr: 'https://cusm.ca/glen'
        },

        /** Questionnaire Controller conttants **/
        colorsArray: ['lime', 'lime', 'orange', 'orange', 'orange', 'red', 'red', 'red', 'darkred', 'darkred'],

        /** ChangeSettingsController Constants **/
        setAliasParam: 'ALIAS',
        setAliasLowerCaseParam: 'Alias',
        setAliasInstruction: 'ENTERYOURALIAS',
        setPhoneNumbersParam: 'PHONENUMBER',
        setPhoneNumberInstruction: 'ENTERNEWTELEPHONE',
        setEmailParam: 'EMAIL',
        setEmailType: 'email',
        setEmailField: 'Email',
        setPasswordType: 'password',
        setPasswordField: 'Password',
        setEmailInstruction: 'ENTEREMAILADDRESS',
        setPasswordInstruction: 'ENTERPASSWORD',
        setEmailInputInstruction: 'REENTER_EMAIL',
        setPasswordParam: 'PASSWORD',
        setUpdatePasswordParam: 'UPDATEPASSWORDTITLE',
        setEmailUpdateParam: 'UPDATED_EMAIL',
        setUpdatePasswordMessage: 'PASSWORDUPDATED',
        setInstructionNewPassword: 'ENTERNEWPASSWORD',
        setInstructionOldPassword: 'ENTEROLDPASSWORD',
        setLanguageParam: 'LANGUAGE',
        setLanguageParamLowerCase: 'language',
        setLanguageInstruction: 'SELECTLANGUAGE',
        setFirstLanguageInstruction: 'EN',
        setSecondLanguageInstruction: 'FR',
        setUpdateTitle: 'UPDATE',
        setFontSizeParam: 'FONTSIZE',
        setFontOptionMedium: 'medium',
        setFontOptionSmall: 'small',
        setFontOptionLarge: 'large',
        setFontOptionExtraLarge: 'xlarge',
        setFontSizeTitle: 'SELECTFONTSIZE',
        setNicknameAlias: 'NICKNAME',
        setTelephoneNumberParam: 'TelNum',
        setUpdateMessageField: 'FIELD_UPDATED',
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
            findDoctorUrlEn: 'http://www.gamf.gouv.qc.ca/index_en.html',
            findDoctorUrlFr: 'http://www.gamf.gouv.qc.ca/index.html'
        },
        medicalSchedulerCase: 'medicalscheduler',
        medicalSchedulerUrl: {
            medicalSchedulerUrlEn: 'https://www.rvsq.gouv.qc.ca/en/public/Pages/home.aspx',
            medicalSchedulerUrlFr: 'https://www.rvsq.gouv.qc.ca/fr/public/Pages/accueil.aspx'
        },
        carnetSanteCase: 'carnetsante',
        carnetSanteUrl: 'https://carnetsante.gouv.qc.ca/portail',

        /** CheckIn Service Constants **/
        hospitalSite: {
            hospitalCoordinates : [45.474127399999996, -73.6011402] //Glen Coordinates
        },

        /** EducationalMaterial Service Constants **/
        educationalMaterial: {
            'Video':{
                icon:'fa fa-film',
                color:'#ef5350'
            },
            'Factsheet':{
                icon:'fa fa-list',
                color:'#1E88E5'
            },
            'Booklet':{
                icon:'fa fa-leanpub',
                color:'#66BB6A'
            },
            'Treatment Guidelines':{
                icon:'fa fa-list-ol',
                color:'#7E57C2'
            },
            'Package':{
                icon:'fa fa-cube',
                color:'#8A5B45'
            },
            'Other':{
                icon:'fa fa-book',
                color:'#FF7043'
            },
        },

        /** Delay Service constants **/
        delayServiceEn: {
            daysSingular: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            daysPlural: ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            daySuffixes: ['th', 'st', 'nd', 'rd'],
            dayInterval: ['evening', 'afternoon', 'morning'],
            timeInterval: ['AM', 'PM'],
            unknownAppointment: 'There are no visualizations for this appointment yet',
            unknownAppointmentType: 'There are no visualizations for this kind of appointment yet.',
            notEnoughData: "There isn't enough data for a visualization for this kind of appointment at this time. " +
                "Please stay tuned",
            setsName: {
                set1: '0-15 minutes',
                set2: '15-30 minutes',
                set3: '30-45 minutes',
                set4: '45+ minutes'
            },
            setsDescription: {
                set1: 'from 0 to 15 minutes',
                set2: 'from 15 to 30 minutes',
                set3: 'from 30 to 45 minutes',
                set4: 'more than 45 minutes',
                point: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b> of the patients waited this amount of time.<br/>',
                unknown: 'an unknown amount of time'
            },
            yAxisTitle: 'Frequency (%)'
        },
        delayServiceFr: {
            daysSingular: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
            daysPlural: ['lundis', 'mardis', 'mercredis', 'jeudis', 'vendredis', 'samedis', 'dimanches'],
            months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
            dayInterval: ['soir', 'après-midi', 'matin'],
            unknownAppointment: 'Inconnu',
            unknownAppointment2: 'Il n\'y a pas encore de visualization pour ce rendez-vous',
            unknownAppointmentType: 'Il n\'y a pas encore de visualization pour ce genre de rendez-vous.',
            notEnoughData: 'Il n\'y a pas encore de visualization pour ce rendez-vous',
            setsName: {
                set1: '0-15 minutes',
                set2: '15-30 minutes',
                set3: '30-45 minutes',
                set4: '45+ minutes'
            },
            setsDescription: {
                set1: 'de 0 à 15 minutes',
                set2: 'de 15 à 30 minutes',
                set3: 'de 30 à 45 minutes',
                set4: 'plus de 45 minutes',
                point: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b> des patients ont attendu cette période de temps.<br/>',
                unknown: 'une durée de temps inconnue'
            },
            yAxisTitle: 'Fréquence (%)'
        },

        /** Documents, doctors and patient service constants **/
        cdvDoctorsFilePathAndroid: 'cdvfile://localhost/files/Doctors/',
        cdvDoctorsFilePathIos: 'cdvfile://localhost/persistent/Doctors/',
        cdvDocumentFilePathAndroid: 'cdvfile://localhost/sdcard/Documents/',
        cdvDocumentFilePathIos:  'cdvfile://localhost/persistent/Documents/',
        cdvPatientFilePathAndroid: 'cdvfile://localhost/files/Patient/',
        cdvPatientFilePathIos: 'cdvfile://localhost/persistent/Patient/',

        /** LabResults Service constants **/
        categoryOne: 'Complete Blood Count', // WBC, RBC, HGB, HCT, Platelet, Neutrophils, Eosinophils,
        categoryTwo: 'Electrolytes', // Sodium, potassium, glucose, creatinine, calcium, corrected calcium, magnesium,
        categoryThree: 'Other', // LDH, T4, TSH, albumin, protein, AST, ALT, alkaline phosophatase
        categoryFour: 'Tumor markers', //CEA, CA 15-3, CA-125
        categoryOneTests: ['WBC', 'RBC', 'HGB', 'HCT', 'Platelet Count', 'Neutrophils', 'Eosinophils'],
        categoryTwoTests: ['Sodium', 'Potassium', 'Glucose, Random', 'Creatinine', 'Calcium', 'Corrected Calcium', 'Magnesium'],
        categoryThreeTests: ['LDH', 'T4', 'T4, Free', 'TSH', 'Albumin', 'Protein, Total', 'AST (SGOT)', 'ALT (SGPT)', 'Alkaline Phosphatase', 'Rapamune (Sirolimus)'],
        categoryFourTests: ['CEA', 'CA 15-3', 'CA-125'],

        /** myWaitingTime Service Constants **/
        waitingTimeEn: {
            waitingTitle: 'Appointments',
            waitingUnit: 'Waiting times (minutes)',
            waitingDueHospitalDelay: 'Minutes waiting due to hospital\'s delay',
            waitingDueEarlyArrival: 'Minutes waiting due to early arrival',
            usuallyOnTime: 'On time',
            usuallyTooEarly: 'Too early',
            usuallyLate: 'Late'
        },
        waitingTimeFr: {
            waitingTitle: 'Rendez-vous',
            waitingUnit: 'Temps d\'attente (minutes)',
            waitingDueHospitalDelay: 'Temps d\'attente causé par les délais de l\'hôpital',
            waitingDueEarlyArrival: 'Temps d\'attente causé par l\'arrivée d\'avance',
            usuallyOnTime: 'À l\'heure',
            usuallyTooEarly: 'Trop tôt',
            usuallyLate: 'En retard'
        },

        /** newsBanner Service constants **/
        newsAlertTypes: {
            'notifications': {
                Type: 'notifications',
                Color: '#5bc0de',
                Message: "NEWNOTIFICATIONS",
                Duration: 'short'},
            'nointernet': {
                Type: 'nointernet',
                Message: "NOINTERNETCONNECTION",
                Duration: 10000},
            'connected': {
                Type: 'connected',
                Color: '#5cb85c',
                Message: "CONNECTED",
                Duration: 'short'
            }
        },

        /** UpdateUi Service constants **/
        lastUpdateTimestamp: {
            'All':0,
            'Appointments':0,
            'Messages':0,
            'Documents':0,
            'Tasks':0,
            'Doctors':0,
            'LabTests':0,
            'Patient':0,
            'Notifications':0,
            'EducationalMaterial':0,
            'Questionnaires':0
        }


    });
}) ();


