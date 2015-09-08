NG_DOCS={
  "sections": {
    "api": "API Documentation"
  },
  "pages": [
    {
      "section": "api",
      "id": "AdminPanel",
      "shortName": "AdminPanel",
      "type": "overview",
      "moduleName": "AdminPanel",
      "shortDescription": "This is a single-page application for the administrators of the patient&#39;s app. It uses AngularJS modules and some JQuery for the frontend and PHP for the backend.",
      "keywords": "administrators adminpanel angularjs api app application backend bootstrap controllers file frontend jquery js modules nganimate ngfileupload overview patient php router single-page ui written"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller: welcomeController",
      "shortName": "welcomeController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the home view.",
      "keywords": "$rootscope $scope adminpanel api controller view welcomecontroller"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:adminController",
      "shortName": "adminController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the admin management view.",
      "keywords": "$http $scope access account admin administrator adminpanel admins adminsernum alert alerts api application controller createadmin creates currently firstname getadmins lastname list management message method mysql password passwordconfirm re-entered removeadmin removed removes saves table user username view"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:appointmentController",
      "shortName": "appointmentController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the requests view.",
      "keywords": "$anchorscroll $http $location $rootscope $scope adminpanel api appoinment appointment change changeappointment changes controller currently day equal getrequests gototop isprocessed key list method mysql refresh remove removeappointmentrequest requests saves scheduled scrolls selected setcurrentreq sets start syncenddate table time top view"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:feedbackController",
      "shortName": "feedbackController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the feedback view.",
      "keywords": "$http $scope adminpanel api controller feedback feedbacks getfeedback method mysql saves table view"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:loginModalController",
      "shortName": "loginModalController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the login modal.",
      "keywords": "$http $modalinstance $rootscope admin adminpanel api authenticate cancel cancels closes controller credentials instantly login logs method modal mysql password saves super table user username users"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:managementController",
      "shortName": "managementController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the patient manager view.",
      "keywords": "$http $rootscope $scope account activities adminpanel alerts api appointments based change changed changes changevalue column controller currently doctors enter findpatient finds foundalert going info key manager message method mysql number patient patientinfo prompting refresh relevant removealert removes removeuser saves table user view"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:messagesController",
      "shortName": "messagesController",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the messaging view.",
      "keywords": "$http $rootscope $scope $timeout adds admin administrator adminpanel api arbitrary attachment based controller conversation conversations create creates current currentconversation database equal errormsg exists false file findpatient general getmessages individual inside key locally message messages messaging method mysql newconversation object patient patientfiles patients patientsernum post read readmessages readstatus relevant request saved saves scope selected sendfile sendmessage sends service setcurrentconversation sets sorts table togglefiles true upload user versa vice view wanttosend"
    },
    {
      "section": "api",
      "id": "AdminPanel.controller:registerCtrl",
      "shortName": "registerCtrl",
      "type": "controller",
      "moduleName": "AdminPanel",
      "shortDescription": "Controller for the patient registration view.",
      "keywords": "$http $scope account adminpanel api aria based controller creates database empty findpatient firebase form html medicare message method mysql number patient patientfound provided register registration resets sets ssn true values view"
    },
    {
      "section": "api",
      "id": "AdminPanel.service:loginModal",
      "shortName": "loginModal",
      "type": "service",
      "moduleName": "AdminPanel",
      "shortDescription": "A service that opens a new login modal (also creates a promise) and sets the $rootScope.user variable when its closed(resolved). It will allow the user to use other panels besides the home view.",
      "keywords": "$modal $rootscope adminpanel allow api closed creates login modal opens panels promise service sets user variable view"
    },
    {
      "section": "api",
      "id": "AdminPanel.service:run",
      "shortName": "run",
      "type": "service",
      "moduleName": "AdminPanel",
      "shortDescription": "Sets an interceptor for the app. Whenever a state change happens if data.requireLogin is set to true for that state it will prevent the user from switching to that view and prompt them to log in. If authenticated, it will go the chosen state, goes to home view otherwise.",
      "keywords": "$loginmodal $rootscope $state adminpanel api app authenticated change chosen data interceptor log prevent prompt requirelogin service set sets switching true user view"
    }
  ],
  "apis": {
    "api": true
  },
  "html5Mode": false,
  "editExample": true,
  "startPage": "/api",
  "scripts": [
    "angular.min.js"
  ]
};