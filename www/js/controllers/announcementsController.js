//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
myApp.controller('AnnouncementsController',['$scope','$timeout','Announcements',
    'UserPreferences','NavigatorParameters', 'Logger',
    function($scope,$timeout,Announcements,UserPreferences,NavigatorParameters,Logger){
    init();
    //Initializing name and body of post
    function init()
    {
        $scope.noAnnouncements = true;
        var announcements = Announcements.getAnnouncements();
        announcements = Announcements.setLanguageAnnouncements(announcements);
        if (announcements.length>0) $scope.noAnnouncements = false;
        $scope.announcements=announcements;
        console.log($scope.announcements);
        Logger.sendLog('Announcement', 'all');
    }
    //Function that goes to individual announcement
    $scope.goToAnnouncement=function(announcement)
    {
        console.log(announcement);
        if(announcement.ReadStatus == '0')
        {
            announcement.ReadStatus = '1';
            Announcements.readAnnouncementBySerNum(announcement.AnnouncementSerNum);
        }
        NavigatorParameters.setParameters({Navigator:'generalNavigator', Post: announcement});
        generalNavigator.pushPage('./views/general/announcements/individual-announcement.html');
    }

    $scope.showHeader = function (index) {
        if (index === 0) return true;

        var current = (new Date($scope.announcements[index].DateAdded)).setHours(0,0,0,0);
        var previous = (new Date($scope.announcements[index-1].DateAdded)).setHours(0,0,0,0);
        return current != previous;
    }

}]);
myApp.controller('IndividualAnnouncementController',['$scope','NavigatorParameters', 'Announcements','Logger',
    function($scope,NavigatorParameters,Announcements,Logger){
    var parameters=NavigatorParameters.getParameters();
    console.log(parameters);
    var message = Announcements.setLanguageAnnouncements(parameters.Post);
    $scope.announcement=message;
    Logger.sendLog('Announcement', message.AnnouncementSerNum);
}]);
