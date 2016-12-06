var myApp = angular.module('MUHCApp');
myApp.controller('LabResultsControllerCopy', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', 'LabResults', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences, LabResults) {

  $scope.load = function($done) {
    RequestToServer.sendRequest('Refresh','LabTests');
    $timeout(function() {
      loadInfo();
          $done();
    }, 3000);
  };

  function loadInfo(){
    UpdateUI.UpdateSection('LabTests').then(function()
    {
      $scope.init();
    });
 }
    // Constants
    var DATE_TAB = 'Date';
    var ALL_TESTS_TAB = 'AllTests';
    var GROUPS_TAB = 'Groups';
    var FAVORITES_TAB = 'Favorites';

    $scope.selectedLabResults = undefined;
    $scope.selectedTest = undefined;

    // Flags for defining various views
    $scope.isNotificationView = undefined;
    $scope.isTestsView = undefined;
    $scope.isSpecificTestView = undefined;
    $scope.isTimeView = undefined;

    $scope.isListView = undefined;
    $scope.isTimeViewAll = undefined;

    $scope.isGroupsListView = undefined;
    $scope.isTestsViewGroups = undefined;
    $scope.isTimeViewGroups = undefined;

    $scope.isListViewFavorites = undefined;
    $scope.isTimeViewFavorites = undefined;


    $scope.testResultsByDate = LabResults.getTestResultsByDate();
    $scope.testResultsByType = LabResults.getTestResultsByType();
    $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
    console.log($scope.testResultsByDate);
    console.log($scope.testResultsByType);
    console.log($scope.testResultsByCategory);


    $scope.init = function() {

      // DATE tab
      $scope.isNotificationView = true;
      $scope.isTestsView = false;
      $scope.isSpecificTestView = false;
      $scope.isTimeView = false;
      // ALL tab
      $scope.isListView = true;
      $scope.isTimeViewAll = false;
      // FAVORITES tab
      $scope.isListViewFavorites = true;
      $scope.isTimeViewFavorites = false;
      // Initialize messages
      $scope.title = 'Lab Results';
      $scope.testsReceived = 'Lab results';

      // Start in DATE tab
      $scope.radioModel = 'Date';
    };

    $scope.goToNotificationView = function() {
      if($scope.radioModel === DATE_TAB) {
        $scope.isNotificationView = true;
        $scope.isTestsView = false;
        $scope.isSpecificTestView = false;
        $scope.isTimeView = false;
      } else if($scope.radioModel === ALL_TESTS_TAB) {
        $scope.isListView = true;
        $scope.isTimeViewAll = false;
      } else if($scope.radioModel === FAVORITES_TAB) {
        $scope.isListViewFavorites = true;
        $scope.isTimeViewFavorites = false;
      }
    };


    $scope.goToTestsView = function(testResult, testDate, testCategory) {
      if (testResult) {
        $scope.selectedLabResults = testResult;
        $scope.testDate = testDate;
      }
      if(testCategory) {
        $scope.selectedCategory = testCategory;
      }

      // Update title
      $scope.title = 'Lab Results - ' + $scope.testDate;

      if ($scope.radioModel === DATE_TAB){
        $scope.isNotificationView = false;
        $scope.isTestsView = true;
        $scope.isSpecificTestView = false;
        $scope.isTimeView = false;
      }
    };

    $scope.goToSpecificTestView = function(test) {
      if (test) {
        $scope.selectedTest = test;
        $scope.testName = test.ComponentName;
        $scope.testValue = test.TestValue;
      }

      // Update title
      $scope.title = $scope.selectedTest.FacComponentName;

      $scope.isNotificationView = false;
      $scope.isTestsView = false;
      $scope.isSpecificTestView = true;
      $scope.isTimeView = false;

      var maxNorm = [];
      var minNorm = [];
      var result = [];
      for (var i=0; i<100; i++) {
        maxNorm.push({x: i, y: $scope.selectedTest.MaxNorm});
        minNorm.push({x: i, y: $scope.selectedTest.MinNorm});
      }
      for (var i=20; i<80; i++){
        result.push({x: i, y: $scope.selectedTest.TestValue});
      }

      $scope.data = [
        {
          values: maxNorm,
          key: 'Max Norm',
          color: '#000000',
          area: false
        },
        {
          values: minNorm,
          key: 'Min Norm',
          color: '#000000',
          area: false
        }
        ,{
          key: 'Result',
          values: result,
          color: '#ff7f0e',
          area: true
        }
      ];
    };

    $scope.goToTimeView = function(testName) {
      if($scope.radioModel === DATE_TAB) {
        $scope.isNotificationView = false;
        $scope.isTestsView = false;
        $scope.isSpecificTestView = false;
        $scope.isTimeView = true;
      } else if($scope.radioModel === ALL_TESTS_TAB) {
        $scope.isListView = false;
        $scope.isTimeViewAll = true;
      } else if($scope.radioModel === FAVORITES_TAB) {
        $scope.isListViewFavorites = false;
        $scope.isTimeViewFavorites = true;
      }

      $scope.testInformation = $scope.testResultsByType[testName].testResults[0];
      $scope.title = testName;
      var testResults = $scope.testResultsByType[testName].testResults;
      $scope.historicViewTestResult = $scope.testResultsByType[testName].testResults;

      // Chart
      $scope.data = [{
        key: 'Data',
        values: []
      }];
      for (var i=0; i<testResults.length; i++) {
        $scope.data[0].values[i] = {
          x: i,
          y: testResults[i].TestValue
        };
      }
    };

    $scope.goBack = function() {
      // DATE tab
      if ($scope.isTestsView) {
        $scope.goToNotificationView();
      } else if($scope.isSpecificTestView) {
        $scope.goToTestsView();
      } else if($scope.isTimeView) {
        $scope.goToSpecificTestView();

      // ALL TESTS tab
      } else if($scope.isTimeViewAll) {
        $scope.goToNotificationView();

        // FAVORITES tab
      } else if($scope.isTimeViewFavorites) {
        $scope.goToNotificationView();
      }
    };



    $scope.$watch('radioModel',function(){
           // selectTestResultsToLoad();
    });
}]);
myApp.controller('AllTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  //Enter code here!!
    $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
    $scope.testResultsByType = LabResults.getTestResultsArrayByType();
    console.log($scope.testResultsByType);
  }]);
myApp.controller('FavoritesTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  //Enter code here!!
  $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
  $scope.testResultsByType = LabResults.getTestResultsByType();
  $scope.testsReceived = 'Your lab results are in';


}]);
myApp.controller('ByDateTestsController',['$scope','$timeout','LabResults','$filter',function($scope,$timeout,LabResults,$filter){
  //Enter code here!!

  //Initializing option
  $scope.radioModel='All';

  $scope.testResultsByDateArray=LabResults.getTestResultsArrayByDate();
  $scope.selectedTests=$scope.testResultsByDateArray;
  //$scope.testResultsByDate = LabResults.getTestResultsByDate();
  $scope.testsReceived = 'Lab results';
  /*$scope.$watch('radioModel',function(){
    console.log('inside');
      $scope.selectedTests=$filter('filterDateLabTests')($scope.testResultsByDateArray, $scope.radioModel);
    });*/
}]);


myApp.controller('IndividualLabTestController',['$scope','$timeout',function($scope,$timeout){
  var page = personalNavigator.getCurrentPage();
  var test = page.options.param;
  console.log(test);
  if (test.testResults) {
    $scope.selectedLabResults = test.testResults;
    $scope.testDate = test.testDate;
  }
  /*if(test.testCategory) {
    $scope.selectedCategory = testCategory;
  }*/

  // Update title
  $scope.title = 'Lab Results - ' + $scope.testDate;
  $scope.goToSpecificTestView=function(test)
  {
    personalNavigator.pushPage('./views/personal/lab-results/specific-test-component.html',{param:test});
  }
}]);

myApp.controller('SpecificTestComponentController',['$scope','$timeout',function($scope,$timeout){
  var page = personalNavigator.getCurrentPage();
  var test = page.options.param;
  $scope.selectedTest = test;
  $scope.testName = test.ComponentName;
  $scope.testValue = test.TestValue;
  // Update title
  $scope.title = $scope.selectedTest.FacComponentName;
  var maxNorm = [];
  var minNorm = [];
  var result = [];
  for (var i=0; i<100; i++) {
    maxNorm.push({x: i, y: $scope.selectedTest.MaxNorm});
    minNorm.push({x: i, y: $scope.selectedTest.MinNorm});
  }
  for (var i=20; i<80; i++){
    result.push({x: i, y: $scope.selectedTest.TestValue});
  }

  $scope.data = [
    {
      values: maxNorm,
      key: 'Max Norm',
      color: '#000000',
      area: false
    },
    {
      values: minNorm,
      key: 'Min Norm',
      color: '#000000',
      area: false
    }
    ,{
      key: 'Result',
      values: result,
      color: '#ff7f0e',
      area: true
    }
  ];
}]);
myApp.controller('TimelineTestComponentController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  var page = personalNavigator.getCurrentPage();
  var testName = page.options.param;
  $scope.testResultsByType = LabResults.getTestResultsByType();
  $scope.testInformation = $scope.testResultsByType[testName].testResults[0];
  $scope.title = testName;
  var testResults = $scope.testResultsByType[testName].testResults;
  $scope.historicViewTestResult = $scope.testResultsByType[testName].testResults;

  // Chart
  $scope.data = [{
    key: 'Data',
    values: []
  }];
  for (var i=0; i<testResults.length; i++) {
    $scope.data[0].values[i] = {
      x: i,
      y: testResults[i].TestValue
    };
  }


}]);
