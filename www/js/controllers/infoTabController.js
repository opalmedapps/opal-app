var myApp=angular.module('MUHCApp');
myApp.controller('InfoTabController',['$scope','$timeout',function($scope,$timeout){
  var tab=tabbar.getActiveTabIndex();
  var views=[
    {
      icon:'fa fa-home',
      color:'SteelBlue',
      name:'Home',
      description:'In your home tab you will be provided with news about your medical status, documents, hospital announcements and appointments.'
    },
    {
      icon:'ion-android-person',
      color:'maroon',
      name:'My Chart' ,
      description:'In your my chart tab you will obtained all the information regarding your electronic health records.'
    },
    {
      icon:'ion-ios-book',
      color:'darkblue',
      name: 'General',
      description:'In your general tab you will find useful information to facilitate your hospital visit.'
    },
    {
      icon:'ion-university',
      color:'Chocolate',
      name:'Education',
      description:'In your my education tab you will find educational material specific to you treatment.'
    },
  ];
  $scope.view=views[tab];
  }]);
