var myApp=angular.module('MUHCApp');
myApp.controller('AnnouncementsController',['$scope','$timeout','Announcements','UserPreferences','NavigatorParameters',function($scope,$timeout,Announcements,UserPreferences,NavigatorParameters){
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

}]);
myApp.controller('IndividualAnnouncementController',['$scope','NavigatorParameters', 'Announcements',function($scope,NavigatorParameters,Announcements){
  var parameters=NavigatorParameters.getParameters();
  console.log(parameters);
  var message = Announcements.setLanguageAnnouncements(parameters.Post);
  $scope.announcement=message;
}]);
