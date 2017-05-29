/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');
myApp.controller('TabsController',['$scope','$timeout','$translate','$translatePartialLoader','$rootScope',function($scope,$timeout,$translate,$translatePartialLoader,$rootScope){

    $scope.tour = './views/home/tour/tour.html';
    if (!localStorage.getItem('firstInstall')){
        $scope.tour = './views/home/tour/tour.html';
        localStorage.setItem('firstInstall', '1');
        $timeout(function () {
            tourModal.show();
        },500);
    }

    $translatePartialLoader.addPart('all-views');

    $scope.analyze = function(e){
        console.log("event: " + e);
        if(event.index === tabbar.getActiveTabIndex()){
            event.cancel()
        }
        else{
            tabbar.setActiveTab(e.index);
        }
    }


}]);

myApp.controller('personalTabController',
    ['$scope','$timeout','Appointments','$translate','TxTeamMessages','Documents',
        '$location','RequestToServer','UpdateUI','NavigatorParameters',
        'Notifications','Questionnaires', 'Patient', 'NetworkStatus', 'MetaData',
        function($scope,$timeout,Appointments,$translate, TxTeamMessages,Documents,
                 $location,RequestToServer,UpdateUI,NavigatorParameters,
                 Notifications,Questionnaires,Patient, NetworkStatus, MetaData){

    //Its possible for a notification to have been read such as a document since this controller has already been instantiated
    // we will have to check to sync that number on the badges for the tabs on the personal page.
    NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
    NavigatorParameters.setNavigator(personalNavigator);
    personalNavigator.on('prepop',function(){
        setNewsNumbers();
    });
    
    personalNavigator.on('prepush',function(event){
        console.log("event "  + event);
        if(event.navigator._isPushing) event.cancel();       
    });

    if(MetaData.isFirstTimePersonal()){

        console.log("choosing to load from metadata");

        var meta = MetaData.fetchPersonalMeta();

        $scope.appointmentsUnreadNumber = meta.appointmentsUnreadNumber;
        $scope.documentsUnreadNumber = meta.documentsUnreadNumber;
        $scope.txTeamMessagesUnreadNumber = meta.txTeamMessagesUnreadNumber;
        $scope.notificationsUnreadNumber = meta.notificationsUnreadNumber;
        $scope.questionnairesUnreadNumber = meta.questionnairesUnreadNumber;

        MetaData.setFetchedPersonal();
    }
    
    // $scope.load = function($done) {
    //
    //     else{
    //         UpdateUI.update('All').then(function()
    //         {
    //             updated=true;
    //             $timeout(function()
    //             {
    //                 setNewsNumbers();
    //                 clearTimeout(timeOut);
    //                 $done();
    //             });
    //         }).catch(function(error){
    //             console.log(error);
    //             clearTimeout(timeOut);
    //             $done();
    //         });
    //
    //         var timeOut = setTimeout(function(){
    //             $done();
    //         },5000);
    //
    //     }
    // };

    $scope.censor = Patient.getAccessLevel() == 3;
    //Setting up numbers on the
    function setNewsNumbers()
    {
        $scope.appointmentsUnreadNumber = Appointments.getNumberUnreadAppointments();
        $scope.documentsUnreadNumber = Documents.getNumberUnreadDocuments();
        $scope.txTeamMessagesUnreadNumber = TxTeamMessages.getUnreadTxTeamMessages();
        $scope.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
        $scope.questionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnaires();
    }

    //Must have a function to go to status as we must set the navigator as a parameter
    $scope.goToStatus = function()
    {
        NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
        personalNavigator.pushPage('views/home/status/status_new.html');
    };

    //Creating a device button
    var backButtonPressed = 0;
    $scope.personalDeviceBackButton=function()
    {
        tabbar.setActiveTab(0);
    };


    //Sets appointments and treatment plan stage tab
    if(NetworkStatus.isOnline()){
        initPersonalTab();
    }


    //Init function for this controller
    function initPersonalTab()
    {
        if(MetaData.isFirstTimePersonal()){

            console.log("choosing to load from metadata");

            var meta = MetaData.fetchPersonalMeta();

            console.log(meta);

            $scope.appointmentsUnreadNumber = meta.appointmentsUnreadNumber;
            $scope.documentsUnreadNumber = meta.documentsUnreadNumber;
            $scope.txTeamMessagesUnreadNumber = meta.txTeamMessagesUnreadNumber;
            $scope.notificationsUnreadNumber = meta.notificationsUnreadNumber;
            $scope.questionnairesUnreadNumber = meta.questionnairesUnreadNumber;

            MetaData.setFetchedPersonal();

            return;

        }
        else if (Documents.getLastUpdated() < Date.now() - 300000 || TxTeamMessages.getLastUpdated() < Date.now() - 300000 ){
            // $scope.loading = true;
            UpdateUI.set([
                'Documents',
                'TxTeamMessages'
            ])
            .then(function () {
                // $scope.loading = false;
            })
            .catch(function(error){
                "use strict";
                $scope.loading = false;
                console.log('error', error);
            });
        }

        setNewsNumbers();

    }
    //Destroying personal navigator events
    $scope.$on('$destroy', function(){ 
            personalNavigator.off('prepush');
            personalNavigator.off('prepop');
    });
}]);


myApp.controller('generalTabController',['$scope','$timeout','Announcements','RequestToServer','UpdateUI','Notifications','NavigatorParameters','$filter','Doctors', 'NetworkStatus', 'MetaData',
    function($scope,$timeout,Announcements,RequestToServer,UpdateUI,Notifications,NavigatorParameters,$filter, Doctors, NetworkStatus, MetaData){

    //Sets appointments and treatment plan stage tab
    if(NetworkStatus.isOnline()){
        initGeneralTab();
    }

    function initGeneralTab(){
        if(MetaData.isFirstTimeGeneral()){

            console.log("choosing to load from metadata");

            var meta = MetaData.fetchGeneralMeta();

            console.log(meta);

            $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();

            MetaData.setFetchedGeneral();

            return;

        }
        else if (Announcements.getLastUpdated() < Date.now() - 300000 ) {
            $scope.loading = true;
            UpdateUI.set([
                'Doctors',
                'Announcements'
            ])
                .then(function () {
                    $scope.loading = false;
                })
                .catch(function (error) {
                    "use strict";
                    $scope.loading = false;
                    console.log('error', error);
                });
        }
        setNewsNumbers();
    }

    NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
    NavigatorParameters.setNavigator(generalNavigator);

    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

    generalNavigator.on('prepop',function(){
        setNewsNumbers();
    });

     generalNavigator.on('prepush',function(event){
        if(event.navigator._isPushing) event.cancel();       
    });

    // $scope.load = function($done) {
    //     UpdateUI.update('All').then(function()
    //     {
    //         $timeout(function()
    //         {
    //             updated=true;
    //             backButtonPressed = 0;
    //             setNewsNumbers();
    //             clearTimeout(timeOut);
    //             $done();
    //         });
    //     }).catch(function(error){
    //         console.log(error);
    //         clearTimeout(timeOut);
    //         $done();
    //     });
    //     var timeOut = setTimeout(function(){
    //         $done();
    //     },5000);
    // };

    $scope.goToPatientCharter = function()
    {
        console.log('heading to charter');
        NavigatorParameters.setParameters('generalNavigator');
        generalNavigator.pushPage('./views/general/charter/charter.html');
    };
    $scope.goToGeneralSettings = function()
    {
        NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
        generalNavigator.pushPage('./views/init/init-settings.html')
    };

    $scope.goToParking = function()
    {
        NavigatorParameters.setParameters('generalNavigator');
        generalNavigator.pushPage('views/general/parking/parking.html')
    };
    function setNewsNumbers()
    {
        $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
    }
    var backButtonPressed = 0;
    $scope.generalDeviceBackButton=function()
    {
        tabbar.setActiveTab(0);
    };
    
    //Destroying personal navigator events
    $scope.$on('$destroy', function(){ 
            generalNavigator.off('prepush');
            generalNavigator.off('prepop');
    });


}]);
