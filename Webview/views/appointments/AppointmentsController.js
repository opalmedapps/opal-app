var app=angular.module('MUHCApp')
app.controller('AppointmentsController', ['$scope','$compile','uiCalendarConfig','Appointments','$timeout','$uibModal', function($scope,$compile,uiCalendarConfig,Appointments,$timeout, $uibModal)
{
  init();
  function init(){
    $scope.dateToday=new Date();
  var date;
  var nextAppointment=Appointments.getNextAppointment();
  var lastAppointment=Appointments.getLastAppointmentCompleted();
  if(nextAppointment.Index!=-1){
      $scope.noAppointments=false;
      $scope.appointmentShown=nextAppointment.Object;
      $scope.titleAppointmentsHome='Next Appointment';
      date=nextAppointment.Object.ScheduledStartTime;
      var dateDay=date.getDate();
      var dateMonth=date.getMonth();
      var dateYear=date.getFullYear();

      if(dateMonth==$scope.dateToday.getMonth()&&dateDay==$scope.dateToday.getDate()&&dateYear==$scope.dateToday.getFullYear()){
          console.log('asdas');
          $scope.nextAppointmentIsToday=true;
      }else{
          console.log('notToday');
          $scope.nextAppointmentIsToday=false;
      }
  }else if(lastAppointment!=-1){
    $scope.nextAppointmentIsToday=false;
    $scope.appointmentShown=lastAppointment;
    $scope.titleAppointmentsHome='Last Appointment';
  }
  else{
      $scope.noAppointments=true;
  }
  }
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
            console.log($scope.radioModel);
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
            return 'grey';


        }else{
            return '#5CE68A';
        }
    };
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.changeTo = 'French';
    /* event source that pulls from google.com */
    $scope.eventSource = {
            url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
            className: 'gcal-event',           // an option!
            currentTimezone: 'America/Chicago' // an option!
    };
    /* event source that contains custom events on the scope */
    $scope.events =[];
    var appointments=Appointments.getUserAppointments();
    for (var i = 0; i < appointments.length; i++) {
      var objectEvent={};
      objectEvent.title=appointments[i].AppointmentType_EN;
      objectEvent.id=appointments[i].AppointmentSerNum;
      objectEvent.start=appointments[i].ScheduledStartTime;
      var copiedDate=new Date(objectEvent.start.getTime());
      copiedDate.setHours(copiedDate.getHours()+1);
      objectEvent.end=copiedDate;
      var today=$scope.today;
      var dateAppointment=appointments[i].ScheduledStartTime;

      if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
          objectEvent.color='#3399ff';

      }else if(dateAppointment>today){
          objectEvent.color='grey';


      }else{
          objectEvent.color='#5CE68A';
      }

      $scope.events.push(objectEvent);
    }
    /*$scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];*/
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };
    /* alert on eventClick */
    $scope.clickEventOnList=function(serNum)
    {
      var object={};
      object.id=serNum;
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: './views/appointments/individual-appointment.html',
        controller: 'IndividualAppointmentController',
        resolve: {
          items: function () {
            return object;
          }
        }
          });
    }
    $scope.alertOnEventClick = function( date, jsEvent, view){

    console.log(date);
 var modalInstance = $uibModal.open({
   animation: $scope.animationsEnabled,
   templateUrl: './views/appointments/individual-appointment.html',
   controller: 'IndividualAppointmentController',
   resolve: {
     items: function () {
       return date;
     }
   }
  });
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function(sources,source) {
      var canAdd = 0;
      angular.forEach(sources,function(value, key){
        if(sources[key] === source){
          sources.splice(key,1);
          canAdd = 1;
        }
      });
      if(canAdd === 0){
        sources.push(source);
      }
    };
    /* add custom event*/
    $scope.addEvent = function() {
      $scope.events.push({
        title: 'Open Sesame',
        start: new Date(y, m, 28),
        end: new Date(y, m, 29),
        className: ['openSesame']
      });
    };
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };
    /* remove event */
    $scope.remove = function(index) {
      $scope.events.splice(index,1);
    };
    /* Change View */
    $scope.changeView = function(view,calendar) {
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView',view);
    };
    if(uiCalendarConfig.calendars['myCalendar1']){
      uiCalendarConfig.calendars['myCalendar1'].fullCalendar('render');
    }
     /* Render Tooltip */
    $scope.eventRender = function( event, element, view ) {
        element.attr({'tooltip': event.title,
                     'tooltip-append-to-body': true});
        $compile(element)($scope);
    };
    /* config object */


    $scope.changeLang = function() {
      if($scope.changeTo === 'Hungarian'){
        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
        $scope.changeTo= 'English';
      } else {
        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        $scope.changeTo = 'Hungarian';
      }
    };
    /* event sources array*/
    $scope.eventSources = [$scope.events, $scope.eventSource, $scope.eventsF];
    $scope.eventSources2 = [$scope.calEventsExt, $scope.eventsF, $scope.events];

}]);
