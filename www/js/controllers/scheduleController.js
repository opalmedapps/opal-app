var myApp = angular.module('MUHCApp');

/**
*@ngdoc controller
*@name MUHCApp.controller:ScheduleController
*@scope
*@requires $scope
*@requires $rootScope
*@requires MUHCApp.services.UserPreferences
*@requires MUHCApp.services.UpdateUI
*@requires MUHCApp.services.Appointments
*@description
*Controller manages the logic in the schedule appointment main view, it as as "child" controllers,
*/


//Logic for the calendar controller view

myApp.controller('CalendarController', ['Appointments', '$scope','$timeout', '$location','$anchorScroll',function (Appointments, $scope,$timeout,$location,$anchorScroll) {
  var divTreatment=document.getElementById('scrollerAppointments');
  var heightTreatment=document.documentElement.clientHeight-350;
  divTreatment.style.height=heightTreatment+'px';
  $scope.appointments=Appointments.getUserAppointments();
  $scope.dt = new Date();
  $scope.todayDate=new Date();
  var flag=false;
  $scope.$watch('dt',function(){
    if(!flag)
    {
      setTimeout(function () {
        var anchor=findClosestAnchor();
        $location.hash(anchor);
        $anchorScroll();
      }, 500);
    }else{
      var anchor=findClosestAnchor();
      $location.hash(anchor);
      $anchorScroll();
    }
    flag=true;

  });
  $scope.$watch('heightCalendar',function(){
    var flag=false;
    if(flag)
    {
      var divTreatment=document.getElementById('scrollerAppointments');
      var heightTreatment=document.documentElement.clientHeight-350+$scope.heightCalendar;
      console.log($scope.heightCalendar);
      divTreatment.style.height=heightTreatment+'px';
    }
    flag=true;
  });
  function findClosestAnchor()
  {
    var today=new Date($scope.dt);
    today.setHours(0,0,0,0);
    today=today.getTime();
    var dateLast=new Date($scope.appointments[$scope.appointments.length-1].ScheduledStartTime.getTime());
    dateLast.setHours(0,0,0,0);
    dateLast=dateLast.getTime();
    var dateFirst=new Date($scope.appointments[0].ScheduledStartTime.getTime());
    dateFirst.setHours(0,0,0,0);
    dateFirst=dateFirst.getTime();
    if(dateLast<today)
    {
      return 'lastAnchor';
    }else if(dateFirst>=today)
    {
      return 'topListAnchor';
    }else{
      for (var i = 0; i < $scope.appointments.length; i++) {
        var date=new Date($scope.appointments[i].ScheduledStartTime.getTime());
        date.setHours(0,0,0,0);
        date=date.getTime();
        if(i>2&&i<$scope.appointments.length)
        {
          if(i==$scope.appointments.length-1)
          {
            return "anchorAppointments"+($scope.appointments.length-2);
          }else{
            var date2=new Date($scope.appointments[i+1].ScheduledStartTime.getTime());
            date2.setHours(0,0,0,0);
            date2=date2.getTime();
            if(date==today)
            {
              return 'anchorAppointments'+(i-1);
            }else{
              if(today>date&&today<date2)
              {
                return 'anchorAppointments'+(i-1);
              }
            }
          }

        }else if(i<3&&i>0){
          if(date==today)
          {
            return 'anchorAppointments'+0;
          }else{
            var date2=new Date($scope.appointments[i+1].ScheduledStartTime.getTime());
            date2.setHours(0,0,0,0);
            date2=date2.getTime();
            if(today>date&&today<date2)
            {
              return 'anchorAppointments'+0;
            }
          }
        }
      }
      return 'topListAnchor';
    }


  }
    $scope.getStyle=function(index){
        var today=(new Date());
        var dateAppointment=$scope.appointments[index].ScheduledStartTime;

        if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
            return '#cf5c4c';

        }else if(dateAppointment>today){
            return '#D3D3D3';


        }else{
            return '#5CE68A';
        }
    };

    function lookForCalendarDate(date,mode){
        if(mode==='day'){
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var day=date.getDate();
            var calendar=Appointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){
                var calendarYear=calendar[year];
                if(calendarYear.hasOwnProperty(month)){
                    var calendarMonth=calendarYear[month];
                    if(calendarMonth.hasOwnProperty(day)){
                        var calendarDay=calendarMonth[day];
                        return calendarDay;
                    }else{
                    $scope.noAppointments=true;

                        return null;
                    }

                }else{

                    $scope.noAppointments=true;

                    return null;
                }
            }else{
                    $scope.noAppointments=true;
                return null;
            }


        }else if(mode==='month'){
            var year=date.getFullYear();
            var month=date.getMonth()+1;
            var calendar=Appointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){
                var calendarYear=calendar[year];
                if(calendarYear.hasOwnProperty(month)){
                    var calendarMonth=calendarYear[month];
                    return calendarMonth;
                }else{
                    $timeout(function(){
                        $scope.noAppointments=true;
                    });
                    return null;
                }
            }else{
                $timeout(function(){
                    $scope.noAppointments=true;
               });
                return null;
            }




        }else if(mode==='year'){
            var year=date.getFullYear();
            var calendar=Appointments.getUserCalendar();
            if(calendar!==undefined&&calendar.hasOwnProperty(year)){

                var calendarYear=calendar[year];
                return calendarYear
            }else{
                 $timeout(function(){
                    $scope.noAppointments=true;
               });
                return null;
            }
        }

    }


    //Header class for the list of appointments
    $scope.setHeader=function(index)
    {
      var today=new Date($scope.dt);
      today.setHours(0,0,0,0);
      today=today.getTime();
      var date2=new Date($scope.appointments[index].ScheduledStartTime.getTime());
      date2.setHours(0,0,0,0);
      date2=date2.getTime();
      if(index==0)
      {
        if(today==date2)
        {
          return false;
        }else
        {
          return true;
        }
      }else if(index<$scope.appointments.length)
      {
        var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
        date1.setHours(0,0,0,0);
        date1=date1.getTime();
        if(date1==date2)
        {
          return false;
        }else{
          if(date2==today)
          {
            return false;
          }else{
            return true;
          }
        }
      }else {
        if(date2==today)
        {
          return false;
        }else{
          return true;
        }
      }
    }
    $scope.pickLastHeader=function()
    {
      var today=new Date($scope.dt);
      today.setHours(0,0,0,0)
      today=today.getTime();
      var lastTime=new Date($scope.appointments[$scope.appointments.length-1].ScheduledStartTime.getTime());
      lastTime.setHours(0,0,0,0);
      lastTime=lastTime.getTime();
      if(lastTime<today)
      {
        return true;
      }else{
        return false;
      }
    }

    $scope.setHeaderPickedDay=function(index)
    {
      var today=new Date($scope.dt);
      today.setHours(0,0,0,0);
      today=today.getTime();
      var date2=new Date($scope.appointments[index].ScheduledStartTime.getTime());
      date2.setHours(0,0,0,0);
      date2=date2.getTime();
      if(index==0)
      {
        if(today==date2||today<date2)
        {
          return true
        }else{
          return false;
        }
      }else if(index<$scope.appointments.length)
      {
        var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
        date1.setHours(0,0,0,0);
        date1=date1.getTime();
        if(date1==date2)
        {
          return false;
        }else{
          if((date2>today&&date1<today)||date2==today)
          {
            return true;
          }else{
            return false;
          }
        }
      }else {
        if(date2==today)
        {
          return true;
        }else{
          return false
        }
      }
    }



    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];


    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date);
            var today=(new Date());
            if(dayToCheck.setHours(0,0,0,0)===today.setHours(0,0,0,0)){//===today.getDate()&&dateToCheck.getMonth()===today.getMonth()&&dateToCheck.getFullYear()===today.getFullYear()){
                    return 'today';
            }else if(lookForCalendarDate(dayToCheck,mode)){
                var dateAppointment=dayToCheck;
                 if(dateAppointment>today){
                    return 'full';
                 }else{
                    return 'partially';
                }
            }
        }else if(mode==='month'){
            return 'partially';
            var monthToCheck=new Date(date);
            if(lookForCalendarDate(monthToCheck,mode)){
                console.log('monthColorMe');
                return 'partially';
            }
        }else if(mode ==='year'){
            return 'partially';
            var yearToCheck=new Date(date);
            if(lookForCalendarDate(yearToCheck,mode)){
                console.log('yearColorMe');
                return 'partially';
            }
        }

        return '';
    };
    addEventsToNativeCalendar();

    /**
    *@ngdoc method
    *@name addEventsToCalendar
    *@methodOf MUHCApp.controller:ScheduleController
    *@description  If its a device checks to see if the user authorized access to calendar device feature, if the user has not
                   defined it (first time), it prompts the user, otherwise it checks through the {@link Appointments.}whether it
                   they have been added.
    **/


    function addEventsToNativeCalendar(){
          //Check for device or website
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if(app){
            var nativeCalendarOption=window.localStorage.getItem('NativeCalendar')
            if(!nativeCalendarOption){
                 var message='Would you like these appointments to be saved as events in your device calendar?';
                navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
            }else if( Number(nativeCalendarOption)===1){
                console.log('option was one!')
                Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
                {
                  console.log(eventSuccession);
                });
            }else{
                console.log('Opted out of appointments in native calendar');
            }
        }else{
            console.log('website');
        }
    }
    function confirmCallback(index){
    if(index==1){
        console.log(index);
        window.localStorage.setItem('NativeCalendar', 0);
        console.log('Not Allowed!');
    }else if(index==2){
        console.log(index);
        window.localStorage.setItem('NativeCalendar', 1);
        console.log('Allowed!');
        Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
        {
          console.log(eventSuccession);
        });
    }
    }
}]);
myApp.controller('ScheduleController', ['$rootScope', 'UserPreferences', 'Appointments','$cordovaCalendar','$scope',
function ($rootScope, UserPreferences, Appointments,$cordovaCalendar,$scope) {

    $scope.closeAlert = function () {
        $rootScope.showAlert = false;
    };
    addEventsToNativeCalendar();

    /**
    *@ngdoc method
    *@name addEventsToCalendar
    *@methodOf MUHCApp.controller:ScheduleController
    *@description  If its a device checks to see if the user authorized access to calendar device feature, if the user has not
                   defined it (first time), it prompts the user, otherwise it checks through the {@link Appointments.}whether it
                   they have been added.
    **/


    function addEventsToNativeCalendar(){
          //Check for device or website
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if(app){
            var nativeCalendarOption=window.localStorage.getItem('NativeCalendar')
            if(!nativeCalendarOption){
                 var message='Would you like these appointments to be saved as events in your device calendar?';
                navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
            }else if( Number(nativeCalendarOption)===1){
                console.log('option was one!')
                Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
                {
                  console.log(eventSuccession);
                });
            }else{
                console.log('Opted out of appointments in native calendar');
            }
        }else{
            console.log('website');
        }
    }
    function confirmCallback(index){
    if(index==1){
        console.log(index);
        window.localStorage.setItem('NativeCalendar', 0);
        console.log('Not Allowed!');
    }else if(index==2){
        console.log(index);
        window.localStorage.setItem('NativeCalendar', 1);
        console.log('Allowed!');
        Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
        {
          console.log(eventSuccession);
        });
    }
    }

}]);

myApp.controller('AppointmentListController', ['$scope','$timeout','Appointments','$location','$anchorScroll',

function ($scope,$timeout, Appointments,$location,$anchorScroll) {
    //Initializing choice
    if(Appointments.getTodaysAppointments().length!==0){
        $scope.radioModel = 'Today';
    }else {
        $scope.radioModel = 'All';
    }


    //Today's date
    $scope.today=new Date();

    //Sets up appointments to display based on the user option selected
    $scope.$watch('radioModel',function(){
        $timeout(function(){
            selectAppointmentsToDisplay();
        });

    });

     //Function to select whether the today, past, or upming buttons are selected
    function selectAppointmentsToDisplay(){
        var selectionRadio=$scope.radioModel;
        if(selectionRadio==='Today'){
            $scope.appointments=Appointments.getTodaysAppointments();

        }else if(selectionRadio==='Upcoming'){
            $scope.appointments=Appointments.getFutureAppointments();
        }else if(selectionRadio==='Past'){
            $scope.appointments=Appointments.getPastAppointments();
        }else{
            $scope.appointments=Appointments.getUserAppointments();
        }
        if($scope.appointments.length==0){
            $scope.noAppointments=true;
        }
    }

    //Function to select the color of the appointment depending on whether the date has passed or not
    $scope.getStyle=function(index){
        var today=$scope.today;
        var dateAppointment=$scope.appointments[index].ScheduledStartTime;

        if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
            return '#3399ff';

        }else if(dateAppointment>today){
            return '#D3D3D3';


        }else{
            return '#5CE68A';
        }
    };

    //Set header
    $scope.scrollTo=function()
    {
      if($scope.pickAnchor&&typeof $scope.pickAnchor!=='undefined')
      {
        var anchor='anchorAppointments'+$scope.pickAnchor;
        console.log(anchor);
        $location.hash(anchor);
        $anchorScroll();
      }
    }
    $scope.setHeader=function(index)
    {
      if(index>0)
      {
        var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
        date1.setHours(0,0,0,0);
        date1=date1.getTime();
        var date2=new Date($scope.appointments[index].ScheduledStartTime.getTime());
        date2.setHours(0,0,0,0);
        date2=date2.getTime();
        if(date1==date2)
        {
          return false;
        }else{
          return true;
        }
      }else{
        return true;
      }
    }
}]);
myApp.controller('IndividualAppointmentController', ['$scope','$timeout', 'Appointments', '$q',
    function ($scope, $timeout, Appointments, $q) {
        //Information of current appointment
        if(typeof personalNavigator!=='undefined'&&typeof personalNavigator.getCurrentPage()!=='undefined')
        {
          console.log('grabbing parameters');
            var page=personalNavigator.getCurrentPage();
            if(page.options.flag=='Appointments')
            {
              delete page.options.flag;
              var parameters=page.options.param;
              $scope.app=parameters;
              $scope.showTab=false;
            }else{
              $scope.app=Appointments.getUpcomingAppointment();
              $scope.showTab=true;
            }

        }else{
          $scope.app=Appointments.getUpcomingAppointment();
          $scope.showTab=true;

        }
}]);


/*myApp.controller('RequestChangeController',['$timeout','$scope','RequestToServer', 'Appointments', '$cordovaDatePicker','$filter', function($timeout, $scope, RequestToServer, Appointments,$cordovaDatePicker, $filter){
    var page = myNavigator.getCurrentPage();
    var parameters=page.options.param;
    $scope.today=(new Date()).setHours(0,0,0);
    console.log(parameters);
    $scope.showAlert=false;
    $scope.changeSubmitted=false;
    $scope.app=parameters;
    $scope.timeOfDay;
    $scope.editRequest=function(){
        $scope.changeSubmitted=false;
        $scope.showAlert=false;
    }
    if(parameters.ChangeRequest==1){
        $scope.showAlert=true;
        $scope.alertClass="bg-success updateMessage-success";
        $scope.alertMessage="Request to change appointment has been sent!";
        $scope.changeSubmitted=true;
    }
    $scope.$watchGroup(['firstTimeOfDay','secondTimeOfDay','thirdTimeOfDay','firstDate', 'secondDate', 'thirdDate'],function(){
        if(!$scope.firstTimeOfDay||!$scope.secondTimeOfDay||!$scope.thirdTimeOfDay||!$scope.firstDate||!$scope.secondDate||!$scope.thirdDate){
            $scope.disabledButton=true;
        }else{
            $scope.disabledButton=false;
        }
    });
    $scope.requestChange=function(){
            objectToSend={};
            objectToSend.AppointmentSerNum=$scope.app.AppointmentSerNum;
            objectToSend.StartDate=$filter('formatDateToFirebaseString')($scope.firstDate);
            objectToSend.EndDate=$filter('formatDateToFirebaseString')($scope.secondDate);
            objectToSend.TimeOfDay=$scope.firstTimeOfDay;
            console.log(objectToSend);
            Appointments.setChangeRequest(parameters.AppointmentSerNum, 1);
            RequestToServer.sendRequest('AppointmentChange',objectToSend);
            $scope.alertMessage='Request to change appointment has been submitted';
            $scope.alertClass="bg-success updateMessage-success"
            $scope.showAlert=true;
            $scope.changeSubmitted=true;

    };
}]);*/


//Checking in the native calendar directly instead of the app service, userNativeCalendar

        /* var startDateMost=appointments[0].Date;
        var changeHourMost=startDateMost.getHours();
        var endDateMost = new Date(startDateMost.getTime());
        endDateMost.setHours(changeHourMost+1);
        var titleMost=appointments[0].Type;
        var locationMost=appointments[0].Location;
        var notesMost='Source: ' +appointments[0].Resource+', Description: '+ appointments[0].Description;
        $cordovaCalendar.findEvent({
            title: titleMost,
            location: locationMost,
            notes: notesMost,
            startDate: startDateMost,
            endDate: endDateMost
        }).then(function (result) {
            console.log(result);

        }, function (err) {


        });*/
            //loopAsychAppointments(0,appointments);
            //Checks whether the app is allowed to add the events by prompting the user, only asks for the first event trying to be added i.e.
            //flagAlreadyAddedEvents, flagNoAccess disallows the operation to continue at the next iteration.
            /*function loopAsychAppointments(index,appointments){
                console.log(index);
                if(index>appointments.length-1){
                    return;
                }else{
                    var startDate=appointments[index].Date;
                    var changeHour=startDate.getHours();
                    var endDate = new Date(startDate.getTime());
                    endDate.setHours(changeHour+1);
                    var title=appointments[index].Type;
                    var location=appointments[index].Location;
                    var notes='Source: ' +appointments[index].Resource+', Description: '+ appointments[index].Description;
                    $cordovaCalendar.findEvent({
                            title: title,
                            location: location,
                            notes: notes,
                            startDate: startDate,
                            endDate: endDate
                        }).then(function (result) {
                            //console.log(result);
                            if(!result[0]){
                                //console.log(appointments);
                                //console.log(index);
                                var startDate=appointments[index].Date;
                                var changeHour=startDate.getHours();
                                var endDate = new Date(startDate.getTime());
                                endDate.setHours(changeHour+1);
                                var title=appointments[index].Type;
                                var location=appointments[index].Location;
                                var notes='Source: ' +appointments[index].Resource+', Description: '+ appointments[index].Description;
                                $cordovaCalendar.createEvent({
                                title: title,
                                location: location,
                                notes: notes,
                                startDate: startDate,
                                endDate: endDate
                                }).then(function (result) {
                                    console.log('appointment added');
                                }, function (err) {
                                     navigator.notification.alert(
                                        'An error occured while adding your appointments',  // message
                                        alertDismissed,         // callback
                                        'Error',            // title
                                        'OK'                  // buttonName
                                    );
                              });
                        }
                        loopAsychAppointments(index+1,appointments);
                        return;
                        }, function (err) {


                        });


                }


            }*/
            /*
            for (var i = 0; i < appointments.length; i++) {
                var startDate=appointments[i].Date;
                var changeHour=startDate.getHours();
                var endDate = new Date(startDate.getTime());
                endDate.setHours(changeHour+1);
                var title=appointments[i].Type;
                var location=appointments[i].Location;
                var notes='Source: ' +appointments[i].Resource+', Description: '+ appointments[i].Description;

               /* $cordovaCalendar.findEvent({
                    title: title,
                    location: location,
                    notes: notes,
                    startDate: startDate,
                    endDate: endDate
                  }).then(function (result) {
                     console.log(result);
                     if(result.length===0){
                        console.log('I will try to add the appointment now!');
                        flagAlreadyAddedEvents++;
                        if(flagAlreadyAddedEvents==1){
                            navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
                        }


                        $cordovaCalendar.createEvent({
                        title: title,
                        location: location,
                        notes: notes,
                        startDate: startDate,
                        endDate: endDate
                        }).then(function (result) {
                            appCalendarAdded++;
                        }, function (err) {
                             navigator.notification.alert(
                                'An error occured while adding your appointments',  // message
                                alertDismissed,         // callback
                                'Error',            // title
                                'OK'                  // buttonName
                            );
                      });
                     }else{
                         console.log('That Appointment has already been added!');
                     }
                  }, function (err) {
                        navigator.notification.alert(
                                'An error occured while adding your appointments',  // message
                                alertDismissed,         // callback
                                'Error',            // title
                                'OK'                  // buttonName
                            );

                  });

                };
                if(appCalendarAdded>0){
                            navigator.notification.alert(
                                'Appointment Events Successfully Added to Your Calendar!',  // message
                                alertDismissed,         // callback
                                'Appointment Events Added',            // title
                                'OK'                  // buttonName
                            );

                        }

        }*/
