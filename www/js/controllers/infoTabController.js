var myApp=angular.module('MUHCApp');
myApp.controller('InfoTabController',['$scope','$timeout',function($scope,$timeout){
  var tab=tabbar.getActiveTabIndex();
  console.log('inside tabs controller');
  var views=[
    {
      icon:'fa fa-home',
      color:'SteelBlue',
      name:"HOME",
      description:"HOME_DESCRIPTION"
    },
    {
      icon:'ion-android-person',
      color:'maroon',
      name:"MYCHART" ,
      description:"MYCHART_DESCRIPTION"
    },
    {
      icon:'ion-ios-book',
      color:'darkblue',
      name: "GENERAL",
      description:"GENERAL_DESCRIPTION"
    },
    {
      icon:'ion-university',
      color:'Chocolate',
      name:"EDUCATION",
      description:"EDUCATION_DESCRIPTION"
    },
  ];
  $scope.view=views[tab];
  }]);
