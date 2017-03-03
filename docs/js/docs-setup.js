NG_DOCS={
  "sections": {
    "api": "Opal Mobile App"
  },
  "pages": [
    {
      "section": "api",
      "id": "Globals",
      "shortName": "Globals",
      "type": "object",
      "moduleName": "Globals",
      "shortDescription": "Collection of all globally defined functions.",
      "keywords": "api app collection customurlscheme defined email flag function functions globally globals handleopenurl initnavigator link object occurs opened password passwordreset plugin push reset stack url"
    },
    {
      "section": "api",
      "id": "MUHCApp",
      "shortName": "MUHCApp",
      "type": "overview",
      "moduleName": "MUHCApp",
      "shortDescription": "",
      "keywords": "aid aims alt angularjs apache api app application built cordova dependecies documentation external framework frameworks glen guide hospital https hybrid img io main mobile module montreal muhcapp muhclogo multiplatform oncology onsenui opal org overview patients png project projectdependencies quebec radiation src version"
    },
    {
      "section": "api",
      "id": "MUHCApp.run",
      "shortName": "MUHCApp.run",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service is in charge of checking that the user is authorized at every state change by checking the parameters stored",
      "keywords": "$firebaseauth angular angularfire api authorized change charge check checking checks firebase localstorage login method muhcapp parameters perform promise redirecting redirectpage redirects refresh reloads returns service stored synch user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Announcements",
      "shortName": "Announcements",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that deals with the announcement information for the patient",
      "keywords": "$filter $q annoucement annoucements announcement announcements announcementsarray announcementsernum api appropiate appropriate array backend clearannouncements clears contained containts controller controllers deals faster function getannouncementbysernum getannouncementname getannouncements getannouncementurl getnumberunreadannouncements getter getunreadannouncements individual initializing iterates iteration language logoutcontroller looked matching method muhcapp names news notifications number object out-of-date parameter passed patient postname_en postname_fr preferred property read readannouncement readannouncementbysernum readstatus replace represents request required returns saved sends sernum service setannouncements setlanguageannouncements sets setter translated translates unread updateannouncements updates url userpreferences values"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Appointments",
      "shortName": "Appointments",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Sets the appointments and provides an API to access them",
      "keywords": "$cordovacalendar $filter $q access add adding api app appointment appointments appointmentsarray appointmentsernum appointmentslocalstorage appropiate array calendar called checkandaddappointmentstocalendar checkin checks chronologically cleans closed completed containts controller correspoding current data database day device error failure fields firebase function future getappointmentbysernum getappointmentname getappointmenturl getcheckinappointment getfutureappointments getlastappointmentcompleted getnumberunreadappointments getpastappointments gettodaysappointments gettreatmentappointments getupcomingappointment getuserappointments getusercalendar identify individual-appointments initializer ischeckinappointment isthereappointments istherenextappointment labels language list making matches method model muhcapp native notification notifications number object occurs organized parameter patient proceeds proper properties property range readappointmentbysernum readstatus reinstantiates replacing representation resolves returns schedulecontroller send sernum server service services session sessions setappointmentcheckin setappointmentslanguage setcheckinappointmentasclosed sets setuserappoinments step storage success sync synced three translated translations treatment treatmentsessionsobject unseen upcoming updates updateuserappoinments url user userappointmentsarray userpreferences valid"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:CheckinService",
      "shortName": "CheckinService",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that deals with the checkin functionality for the app",
      "keywords": "$q allow allowed api app appintments appointment appointments appointmentsernum array assumption based boolean check check-in checkcheckinserver checked checkedin checkin checkinable checkinapps checkinservice checkintoallappointments checks code deals determines error function functionality geographically getcheckinapps gps hospital isallowedtocheckin location method muhcapp object open patient position positioncheckinappointment promise property radius rejects resolves returns room service setcheckinapps sets success today todays true updates user users vecinity verifies verifyallcheckin waiting works"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:DeviceIdentifiers",
      "shortName": "DeviceIdentifiers",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that deals with the device identifiers, sends the identifiers to backend to be used by the push notifications system.",
      "keywords": "api backend check data deals destroy device deviceidentifiers devices devicetype deviceuuid field flag getdeviceidentifiers havebeensent identifiers identifiertype local login method muhcapp notifications object password properties property push registrationid request reset returns senddevicepasswordrequest sendfirsttimeidentifiertoserver sendidentifierstoserver sending sends server service set setdeviceidentifiers setidentifier sets setsendstatus storage system three update user wipes"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Diagnoses",
      "shortName": "Diagnoses",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service stores and manages patient diagnoses",
      "keywords": "$filter adds api array cleardiagnoses clears contained containts controller diag diagnoses diagnosestolocalstorage diagnosis diagoses finds function getdiagnoses getter local logoutcontroller main manages method muhcapp parameter patient property representation returns saved service setdiagnoses setter storage stores update updatediagnoses updates"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Doctors",
      "shortName": "Doctors",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Sets the doctors and contacts and provides an API to interact with them and the server",
      "keywords": "$filter $q adds api array cleardoctors contacts controller doctor doctors doctorsernum doctorssernum empties filters finds getcontacts getdoctorbysernum getdoctorindexbysernum getoncologists getotherdoctors getprimaryphysician images instatiates interact isempty iterates localstorage logout match matches matching method muhcapp object obtaining offline oncologists online otherdoctors parameter physicians primary primaryphysician promise properties property reinstantiates replaces returns saving server service sets setusercontactsoffline setusercontactsonline updates updateusercontacts usersernum"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Documents",
      "shortName": "Documents",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Sets the documents and provides an API to interact with them and the server",
      "keywords": "$filter $q aliasname_en aliasname_fr api appropiate array arrival backend cleardocuments clears contained controller controllers correct device document documents documentsarray documentsernum downloaddocumentfromserver downloads error function getdocumentbysernum getdocumentnames getdocuments getdocumenturl getnumberunreaddocuments getter individual initializing interact iterates language latest logoutcontroller looked matches matching method model muhcapp names notifications object parameter passed patient preferred promise property read readdocument readstatus rejected represents request returns saved sends sernum server service setdocuments setdocumentslanguage sets setter storage successful syncs timeout translated translates unread updatedocuments updates url userpreferences values"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:DynamicContentService",
      "shortName": "DynamicContentService",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that manages the dynamic html for Opal. It grabs data from depdocs.com",
      "keywords": "$http $q api content contentdata contents contenttype data depdocs displayed dynamic external file function getcontentdata getpagecontent grabs html initialize initializelinks key links list loaded manages method muhcapp opal php property request requested requests returned server service setcontentdata sets title url view"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:EducationalMaterial",
      "shortName": "EducationalMaterial",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Sets the educational material and provides an API to interact with it and the server",
      "keywords": "$filter add api app appropiate array backend betweem chronogically cleareducationalmaterial clears color controller controllers converts cordova dates descending device displayed educational educationalmaterialarray educationalmaterialsernum educationalmaterialtype edumaterial existing filters firebase function geteducationalmaterial geteducationalmaterialname geteducationalmaterialurl geteducationamaterialbysernum getter getunreadeducationalmaterials icon individual initializing interact isthereeducationalmaterial javascript language latest link logoutcontroller mapping matching material materials method muhcapp name_en name_fr names notifications object objects obtains open opened openeducationalmaterialdetails opening opens orders parameter passed patient plugin preferred property read readeducationalmaterial readstatus represents request return returns saved sends sernum server service set seteducationalmaterial setlanguageeduationalmaterial sets setter storage string syncs translated translates type unread update updateeducationalmaterial url userpreferences values"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:EncryptionService",
      "shortName": "EncryptionService",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Provides an API to encrypt and decrypt objects, arrays, or strings.",
      "keywords": "answer api arrays communication decrypt decryptdata decrypted decrypting decryptwithkey encrypt encryptdata encrypted encrypting encryption encryptwithkey future getsecurityans hashed key method muhcapp object objects parameter password returns secret security service sets setsecurityans strings userauthorizationinfo"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:FileManagerService",
      "shortName": "FileManagerService",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Allows the app&#39;s controllers or services interact with the file storage of the device. For more information look at Cordova File Plugin, reference for social sharing plugin Cordova Sharing Plugin",
      "keywords": "$cordovafileopener2 $filter $q allows android api app appropiate base64 browser cdv check checks concatanates content controllers converts cordova correct correctly determine device document documents documentsdirectory documentsernum download downloaded downloadfileintostorage downloads entry error externalrootdirectory extract file filepath finddocumentindevice finds format fulfilled function functionality getcdvfilepathfordocument getdocumenturls getfilepathfordocument getfiletype getfileurl https inside interact ios ispdfdocument mediums method muhcapp native object obtains open opened opener2 openpdf opens openurl parameters party path paths pdf phone plugin prefix proceeds promise promises property protocol public refer reference rejects representation representations representing resolves return returned returns sandbox service services set setbase64document share shared sharedocument sharing simply social software storage string stroage targetpath third type url urlcdvpathdocuments urldevicedocuments user window"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:FirebaseService",
      "shortName": "FirebaseService",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Allows the app controllers or services obtain the authentication state and credentials, it also returns the urls inside for the firebase connection",
      "keywords": "$firebaseauth allows angular api app authentication connection controllers credentials fire firebase getauthentication getauthenticationcredentials getfirebaseurl inside method muhcapp object reference returns service services string url urls"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:LabResults",
      "shortName": "LabResults",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that requests and manages the lab results (blood tests) from the server.",
      "keywords": "$filter $q api array category clears currently data destroy getter gettestresults gettestresultsarraybydate gettestresultsarraybytype gettestresultsbycategory gettestresultsbydate gettestresultsbytype grabbing implemented lab latest manages method muhcapp object promise property raw requests returns server service sets settestresults status testresults tests type updates updatetestresults"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:LocalStorage",
      "shortName": "LocalStorage",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API to interact with the saved data storage for the patient.",
      "keywords": "$firebaseauth announcements api data decrypted decrypts deletes depending documents encrypting exists fields hashed interact isuserdatadefined local localstorage method muhcapp object parameter password patient process readlocalstorage reads representing resetuserlocalstorage returns saved service storage updatelocalstorageafterpasswordchange updates user write writes writetolocalstorage"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:NativeNotification",
      "shortName": "NativeNotification",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API to display native looking alert, it&#39;s more code but makes it easier to use and cleaner in my opinion. Reference Onsen Alert Dialog",
      "keywords": "alert android api callback cancel cancelcallback check cleaner code confirmcallback dialog display displayed displays easier extract file html https io ios material message method mod muhcapp native onsen opinion pressed prompts property reference representing service shownotificationalert shownotificationconfirm string style type undefined url user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:NavigatorParameters",
      "shortName": "NavigatorParameters",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Used to pass parameters between Navigators, the Onsen navigator options are not good enough because the controller you navigate to has to know the navigator that&#39;s currently in, this is possible but the code becomes",
      "keywords": "api bunch clauses cleaner code controller current currently getparameters good html https info io messy method muhcapp navigate navigation navigator navigators object onsen options param parameter parameters pass property represents returns service setparameters sets simple simply specifies things"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:NewsBanner",
      "shortName": "NewsBanner",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API services used to display message banner alerts for the app, e.g. internet connectivity banners, notification banners, etc. For more information on the plugin, Cordova Toast Plugin",
      "keywords": "$cordovanetwork $filter $translatepartialloader alert alerts alerttypes api app banner banners based callback color colorf connected connectivity cordova display displays duration function https internet mappings message method milliseconds muhcapp nointernet notification notifications number numberofnotifications object online parameters plugin property returns service services setalertonline showalert showcustombanner shownotificationalert specific three toast type types"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Notifications",
      "shortName": "Notifications",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API service used to patient notifications. This Service is deeply linked to other services to extract that information about the actual content of the notification.",
      "keywords": "$filter actual adds aliasname_en aliasname_fr api appropiate array backend belongs clearnotifications clears color contained containts content controller controllers darkorange deeply defined device document documentsernum extract fa fa-folder field finds function getdocumentbysernum getdocumentnames getdocumenturl getnotificationpost getnumberunreadnotifications getter getunreadnotifications getusernotifications gotopost icon initializing iterates language linked localstorage logoutcontroller mappings method muhcapp nameen namefr namesfunction news notification notifications notificationsarray notificationslocalstorage notificationtypes number object opening opens pageurl parameter passed patient post preferred property read readdocument readfunction readnotification readstatus represents request return returns saved search searchfunction sends sernum service services setnotificationslanguage sets setter setusernotifications storage syncs translated translates type unread update updates updateusernotifications userpreferences values var"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Patient",
      "shortName": "Patient",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API service used to access the patient fields.",
      "keywords": "$cordovadevice $q access alias api base64 cdv cdvfilepath cleans clearpatient content device email fields file firstname full getalias getemail getfirstname getlastname getpatientid getprofileimage gettelnum getusersernum image lastname level method muhcapp namefilesystem nickname number offline path pathfilesystem patient patientfields patientid patientsernum pic picture profile profileimage property returns saves service setalias setemail sets settelnum setter setuserfieldsoffline setuserfieldsonline storage stroage tel telephone telnum usersernum"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Permissions",
      "shortName": "Permissions",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that requests and manages the lab results (blood tests) from the server.",
      "keywords": "$q android api asks checks constants device display enabled enablepermission lab manages message method msg muhcapp permission permission_type permissions promise requested requests required returns server service success tests type user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:PlanningSteps",
      "shortName": "PlanningSteps",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Sets and determines the current planning step for the user. The planning sequence is defined as follows:",
      "keywords": "api appointment appointments arrays calc calculated checks clears completed completion ct cts current currentstep defined destroy determines dose existence getctsimappointment getcurrentstep getplanningsequence hasct initializeplanningsequence initializes iscompleted list method muhcapp object patient physician physics plan planning prepares property qa qaed radiation ready return returns scan scans scheduling sequence service sets step steps tasks treatment treatments user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:RequestToServer",
      "shortName": "RequestToServer",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API service used to send requests to the server. Every request is encrypted and sent.",
      "keywords": "$filter $q $state api awaits backend code content data defined encrypted encryption encryptionkey error field firebase hashed key method muhcapp object parameter parameters password processed property reference referencefield refrequests refusers rejects request requests resolves response responsefield returns send sendrequest sendrequestwithresponse sends server service type typeofrequest user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:ResetPassword",
      "shortName": "ResetPassword",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service used to verify and confirm password resets.",
      "keywords": "api code completepasswordchange confirm confirms email expressions firebase getparameter method muhcapp newpassword oobcode param parameter parameters password promise provided query redirect regular reset resets returns scan scans search service string url user verifies verify verifylinkcode void"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:Tasks",
      "shortName": "Tasks",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service used to store and manage treatment planning tasks",
      "keywords": "$filter api array clears deleteplanningtasks destroy getallrecenttasks getplanningtasks local localstorage manage member method model muhcapp null objects physician planning planningtasks property returns service setplanningtasks sets sgetrecentphysiciantask storage store task tasks treatment users writes"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:TxTeamMessages",
      "shortName": "TxTeamMessages",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service that deals with the treatment team message information",
      "keywords": "$filter adds announcements api appropiate array backend clears cleartxteammessages contained containts controller controllers deals device faster finds function getnumberunreadtxteammessages getter gettxteammessagebysernum gettxteammessagename gettxteammessages gettxteammessageurl getunreadtxteammessages individual initializing iterates iteration language logoutcontroller looked matching message messages method muhcapp names news notifications number object parameter passed postname_en postname_fr preferred property read readstatus readtxteammessage readtxteammessagebysernum represents request required returns saved sends sernum service setlanguagetxteammessages sets setter settxteammessages storage syncs team translated translates treatment tx txteammessage txteammessages txteammessagesarray txteammessagesernum unread update updates updatetxteammessages url userpreferences values"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:UpdateUI",
      "shortName": "UpdateUI",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "API service used to update the whole application. The UpdateUI service is in charge of timestamps for updates of sections, set up or any update to the user fields.",
      "keywords": "$cordovanetwork $filter $q api app application appointments array asks asynchronous backend case charge clears clearupdateui completely concerning corresponding current data details device doctors documents download educationalmaterial fields generic hospital images init initializes initiatiates labtests lastupdatetimestamp messages method modules muhcapp notifications object obtaining offline online operations parameter parameters patient perform promisefields property querying questionnaires re-setting reinstantiates reset sections sectionservicemappings service services set setoffline setonline setting setuserfieldsoffline setuserfieldsonline signifying storage string tasks timestamps type update updates updateui updating user var wait"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:UserAuthorizationInfo",
      "shortName": "UserAuthorizationInfo",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Contains all the authorization data for the user",
      "keywords": "api authentication authorization clears clearuserauthorizationinfo data device email encryption epoch exp expiration expires firebase getemail getexpires getpassword gettoken getuserauthdata getusername hashed identifier method milliseconds muhcapp object pass password properties property representation returns service session setemail setpassword sets setuserauthdata single time tok token user username"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:UserPreferences",
      "shortName": "UserPreferences",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service stores and manages user preferences",
      "keywords": "$q $rootscope $translate accesses actual api boolean calendar calendaroption clears clearuserpreferences correctly default device en enable enablesms english find font font-size fontsize format fr fulfills functionality getfontsize globalization lan language logout manages method muhcapp notifications object option patient plugin preference preferences preperty problem promise property rejects returns service set setenablesms setlanguage setnativecalendaroption sets setter setuserpreferences size sms stores tmhdynamiclocale user"
    },
    {
      "section": "api",
      "id": "MUHCApp.service:UUID",
      "shortName": "UUID",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service used to generate UUIDs for browsers.",
      "keywords": "api browser browsers generate generated generates getuuid method muhcapp property random service set sets setuuid uuid uuids"
    },
    {
      "section": "api",
      "id": "MUHCApp.services:Messages",
      "shortName": "Messages",
      "type": "service",
      "moduleName": "MUHCApp",
      "shortDescription": "Service deals with patient/doctor messaging portal, parses Firebase object into the appropiate format",
      "keywords": "$filter $rootscope addnewmessagetoconversation api appropiate calls chronological content conversation conversationindex conversations coversation deals defines doctor fields firebase format getusermessages instatiates instiates javascript lastly localstorage message messagecotent messages messageslocalstorage messaging method methods muhcapp object order organizes parses patient portal property representation request returns senderrole sending sends service services setdateoflastmessage sets setusermessages updates updateui updateusermessages user userconversationsarray usermessages usermessageslastupdated"
    },
    {
      "section": "api",
      "id": "ProjectDependencies",
      "shortName": "ProjectDependencies",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "All the third party dependencies for the application dependencies for the application",
      "keywords": "api application dependencies object party projectdependencies third"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.firebase",
      "shortName": "ProjectDependencies.firebase",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "dependency used to create the user authorization service, if user not authorized, i.e. token expired the user will be redirected to the login screen. Used also by the logOutController to unauthorized users at logout. Link to external reference https://github.com/firebase/angularfire.",
      "keywords": "api authorization authorized create dependency expired external firebase https link login logout logoutcontroller muhcapp object projectdependencies redirected reference screen service token unauthorized user users"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.lueggdirectives",
      "shortName": "ProjectDependencies.lueggdirectives",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used in the messages page to scroll automatically as messages are added to",
      "keywords": "api automatically conversations dependency external https link lueggdirectives messages object projectdependencies reference scroll"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.ngAnimate",
      "shortName": "ProjectDependencies.ngAnimate",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Depencency used to create jQuery like animations, but within the Angular framework in the project.",
      "keywords": "angular animations api create depencency external framework https jquery link nganimate object project projectdependencies reference"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.ngCordova",
      "shortName": "ProjectDependencies.ngCordova",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency provides native device plugins from Cordova as modules that can be used within the Angular framework. Link to external reference https://github.com/driftyco/ng-cordova.",
      "keywords": "angular api cordova dependency device external framework https link modules native ngcordova object plugins projectdependencies reference"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.ngSanitize",
      "shortName": "ProjectDependencies.ngSanitize",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used to clean up and indent the html code.",
      "keywords": "api clean code dependency external html https indent link ngsanitize object projectdependencies reference"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.onsen",
      "shortName": "ProjectDependencies.onsen",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used to create html/AngularJS elements that provide a native like feeling to the app. User accross all the views.",
      "keywords": "accross api app create dependency elements external feeling html https link native object onsen projectdependencies provide reference user views"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.uibootstrap",
      "shortName": "ProjectDependencies.uibootstrap",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used accross all views. Provides a way to interact with bootstrap elements using the Angular Framework.",
      "keywords": "accross angular api bootstrap dependency elements external framework https interact link object projectdependencies reference uibootstrap views"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.uirouter",
      "shortName": "ProjectDependencies.uirouter",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used in the project to provide a routing service to change views,",
      "keywords": "api change dealt dependency external functions https link note object onsen project projectdependencies provide reference routing service uirouter views"
    },
    {
      "section": "api",
      "id": "ProjectDependencies.uiselect",
      "shortName": "ProjectDependencies.uiselect",
      "type": "object",
      "moduleName": "ProjectDependencies",
      "shortDescription": "Dependency used in the messages view. Provides the search bar for the mailbox. Link to external reference https://github.com/angular-ui/ui-select.",
      "keywords": "api bar dependency external https link mailbox messages object projectdependencies reference search uiselect view"
    }
  ],
  "apis": {
    "api": true
  },
  "__file": "_FAKE_DEST_/js/docs-setup.js",
  "__options": {
    "startPage": "/api/MUHCApp",
    "scripts": [
      "js/angular.min.js",
      "js/angular-animate.min.js",
      "js/marked.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular.min.js",
      "http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular-animate.min.js"
    ],
    "styles": [],
    "title": "Opal Mobile App",
    "html5Mode": true,
    "editExample": true,
    "navTemplate": false,
    "navContent": "",
    "navTemplateData": {},
    "titleLink": "/api/MUHCApp",
    "loadDefaults": {
      "angular": true,
      "angularAnimate": true,
      "marked": true
    }
  },
  "html5Mode": true,
  "editExample": true,
  "startPage": "/api/MUHCApp",
  "scripts": [
    "js/angular.min.js",
    "js/angular-animate.min.js",
    "js/marked.js",
    "http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular.min.js",
    "http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular-animate.min.js"
  ]
};