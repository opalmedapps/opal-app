/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-14
 * Time: 1:37 PM
 */

myApp.controller('AppointmentController', ['NavigatorParameters','NativeNotification','$scope',
    '$timeout', '$rootScope','Appointments', 'CheckInService','$q',
    'NewsBanner','$filter', 'UserPreferences', 'Logger',
    function (NavigatorParameters,NativeNotification,$scope,
              $timeout, $rootScope, Appointments,CheckInService, $q,
              NewsBanner,$filter, UserPreferences, Logger) {
        //Information of current appointment
        var parameters = NavigatorParameters.getParameters();
        var navigatorName = parameters.Navigator;

        $scope.app = parameters.Post;
        $scope.language = UserPreferences.getLanguage();

        Logger.sendLog('Appointment', parameters.Post.AppointmentSerNum);

        $scope.goToMap=function()
        {
            NavigatorParameters.setParameters($scope.app);
            window[navigatorName].pushPage('./views/general/maps/individual-map.html');
        };

        $scope.aboutApp = function () {
            window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: $scope.app["URL_"+UserPreferences.getLanguage()],
                contentType: $scope.app["AppointmentType_"+UserPreferences.getLanguage()]
            });
        }

    }]);