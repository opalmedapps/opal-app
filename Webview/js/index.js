
var myWeb = angular.module('MUHCApp', ['ui.bootstrap','ui.router','firebase','tmh.dynamicLocale','pascalprecht.translate','ui.select','ngSanitize','ui.calendar']);
myWeb.controller('MainController', function ($scope,$q,$state, UserAuthorizationInfo,$rootScope,Appointments,Documents,RequestToServer) {
	$rootScope.logout=function(){
		function deleteFields(){
			var r=$q.defer();
			window.localStorage.removeItem('UserAuthorizationInfo');
			window.localStorage.removeItem('locationMUHCApp');
			window.localStorage.removeItem(UserAuthorizationInfo.getUserName());
			$state.go('forms.login');
			r.resolve(true);
			return r.promise;
		}

		$scope.goToNotification=function(index,notification)
		{
		        if(notification.ReadStatus==='0'){
		            RequestToServer.sendRequest('NotificationRead',notification.NotificationSerNum);
		            Notifications.setNotificationReadStatus(index);
		        }
		        if(notification.Type==='Appointment'){
		            var app=Appointments.getAppointmentBySerNum(notification.TypeSerNum);
		            $state.go('app.Appointments');
		        }else if(notification.Type==='Document'){
		            console.log('doing it');
		            var doc=Documents.getDocumentBySerNum(notification.TypeSerNum);
		            $state.go('app.Documents');
		           // menu.setMainPage('views/scansNDocuments.html', {closeMenu: true});
		        }

		};

		deleteFields().then(function(){
			setTimeout(function () {
				location.reload();
			}, 100);
		})
	}
});

myWeb.filter('formatDate',function(){
	return function(str) {
    if(typeof str==='string'){
        str=str.replace('T',' ');
        str=str.replace('Z','');
        return new Date(str);
    }
  }
});
myWeb.filter('dateToFirebase',function(){
    return function(date){
      var month=date.getMonth()+1;
      var year=date.getFullYear();
      var day=date.getDate();
      var minutes=date.getMinutes();
      var seconds=date.getSeconds();
      var hours=date.getHours();
        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.000' + 'Z';
    }

  });
