/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
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
myApp.controller('CalendarController', ['Appointments', '$q','$scope','$timeout', '$filter', '$location',
    '$templateRequest', '$sce', '$compile','$anchorScroll','NavigatorParameters', 'UserPreferences', 'Logger',
    function (Appointments, $q, $scope,$timeout,$filter,$location,$templateRequest, $sce, $compile,
              $anchorScroll,NavigatorParameters,UserPreferences, Logger) {
       
        /*
        *   Controller constants
        **/ 
        var flag;//Boolean value to indicate initialization
        var todaysTimeMilliseconds;//Time in milliseconds
        var choosenTimeMilliseconds;//Selected time in milliseconds
        var today;//Date today
        var dateLast; //Date of last Appointment;
        var dateFirst;//Date of first Appointment;
        var navigatorName;//Navigator Name;
        //Set the calendar options
        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };
        //Determines color for calendar dates based on appointments
        $scope.showColor = showColor;
        //Obtains color for a given appointment
        $scope.getStyle=getStyle;
        //Determines whether to show header at the end
        $scope.showHeaderEnd = showHeaderEnd;
        //Determines whether or not to show red highlighted date per index
        $scope.showChoosenDateHeader=showChoosenDateHeader;
        //Go to Appointment
        $scope.goToAppointment=goToAppointment;
        //Go to Calendar options
        $scope.goToCalendarOptions = goToCalendarOptions;

        //monitors whether or not the calendar is displayed
        $scope.showCalendar = true;

        $scope.scrollerHeight = '';

        $scope.onHideCalendar= function() {

            $scope.$apply(function() {
                $scope.showCalendar = false;
                $scope.scrollerHeight = '100%';
            })
        };

        $scope.onShowCalendar= function() {
            $scope.$apply(function() {
                $scope.showCalendar = true;
                $scope.scrollerHeight = '45%';
            })
        };

        /*
        *   Implementation
        **/
        //Initializing controller
        init();
        
        function init()
        {
            Logger.sendLog('Appointment', 'all');
            navigatorName = NavigatorParameters.getParameters().Navigator;

            //Obtaining and setting appointments from service
            $scope.appointments=Appointments.getUserAppointments();
            $scope.noAppointments = ($scope.appointments.length === 0);
            $scope.loading = !$scope.noAppointments;
            $scope.language = UserPreferences.getLanguage();
            $scope.dt = new Date();
            $scope.dt.setHours(0,0,0,0);
            today = new Date($scope.dt);
            flag=false;
            //Getting time in milliseconds for today's appointment
            todaysTimeMilliseconds =  today.getTime();
            choosenTimeMilliseconds = todaysTimeMilliseconds;
            if($scope.appointments.length>0)
            {
                //Setting time in milliseconds for last appointment
                dateLast=(new Date($scope.appointments[$scope.appointments.length-1].ScheduledStartTime.getTime()));
                dateLast.setHours(0,0,0,0);
                dateLast = dateLast.getTime();
                //Setting time in milliseconds for first appointment
                dateFirst=(new Date($scope.appointments[0].ScheduledStartTime.getTime()));
                dateFirst.setHours(0,0,0,0);
                dateFirst = dateFirst.getTime();
            }
            loadTemplate().then(function(){
                var divTreatment=document.getElementById('scrollerAppointments');
                var heightTreatment=document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
                if(divTreatment)divTreatment.style.height=heightTreatment+'px';
                setTimeout(scrollToAnchor,100);
            });
        }
        function scrollToAnchor()
        {
            var anchor=findClosestAnchor();
            $location.hash(anchor);
            $anchorScroll();
        }

        function loadTemplate()
        {
            var r = $q.defer();
             $timeout(function () { 
                    $scope.loading = false;
                    var template= $sce.getTrustedResourceUrl('./views/personal/appointments/appointment-list-template.html');
                    $templateRequest(template).then(function(template) {
                    $compile($("#appointment-list").html(template).contents())($scope);
                    r.resolve(true);
                }, function() {
                    r.resolve(true);
                    // An error has occurred
                });
            }, 1000);
            return r.promise;
        }
        function goToCalendarOptions()
        {
            window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        }
        //Watcher for the calendar date
        $scope.$watch('dt',function(){
            choosenTimeMilliseconds = $scope.dt.getTime();
            scrollToAnchor();
        });    

        //Determines color for calendar dates based on appointments
        function showColor(date)
        {
            var result = $scope.appointments.find(function(item){
                return  item.ScheduledStartTime.toDateString() == date.toDateString();
            });
            if(result)
            {
                if(date.getTime()> todaysTimeMilliseconds)
                {
                    return '#cf5c4c';
                }else if(date.getTime() == todaysTimeMilliseconds)
                {
                    return '#3399ff';
                }else{
                    return '#5CE68A';
                }
            }else{
                return 'rgba(255,255,255,0.0)';
            }
        }
        
     
        //Returns string with closest anchor
        function findClosestAnchor()
        {
            if($scope.appointments.length>0)
            {
                if(dateLast<choosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>choosenTimeMilliseconds) return 'firstAnchor';
                else{
                    var ind = findClosestAppointmentToTime(choosenTimeMilliseconds); 
                    return 'anchorAppointments'+ ind;
                }
            }
            return 'firstAnchor';
        }
        //Finds the closest appointment that happens after the choosen appointment, this is use for scrolling
        //Could be done with binary search for an improvement
        function findClosestAppointmentToTime(tmili)
        {
            for(var i =0;i<$scope.appointments.length;i++)
            {
                var date = $scope.appointments[i].ScheduledStartTime.getTime();
                if(date >= tmili)
                {
                    return i;
                }   
            }
            return 0;
             //To be added once is supported by all browsers!
            // var ind = 0;
            // ind = $scope.appointments.findIndex(function(appointment)
            // {
            //     var date = appointment.ScheduledStartTime.getTime();
            //     return date >= tmili;

            // });
            // return ind;
        }

        //Obtains color for a given appointment
        function getStyle(index){
            var dateAppointment=$scope.appointments[index].ScheduledStartTime;
            if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
                return '#3399ff';
            }else if(dateAppointment>today){
                return '#cf5c4c';
            }else{
                return '#5CE68A';
            }
        }

        //Determines whether to show header at the end
        function showHeaderEnd()
        {
            return $scope.appointments.length > 0 && dateLast < choosenTimeMilliseconds;

        }

        //Determines when to show header of appointment vs red highlighted header
        function showChoosenDateHeader(index)
        {
            var same_date = false;
            var cur_date=new Date($scope.appointments[index].ScheduledStartTime);
            cur_date.setHours(0,0,0,0);
            cur_date=cur_date.getTime();

            if(index !== 0){
                var date_prev = new Date($scope.appointments[index - 1].ScheduledStartTime);
                date_prev.setHours(0,0,0,0);
                date_prev=date_prev.getTime();
                same_date = date_prev === cur_date;
            }

            $scope.showHeaderNormalDay = (choosenTimeMilliseconds !== cur_date) && !same_date;

            if(index===0)
            {
                return choosenTimeMilliseconds === cur_date || choosenTimeMilliseconds < cur_date;
            }else
            {
                var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
                date1.setHours(0,0,0,0);
                date1=date1.getTime();
                if(date1===cur_date)
                {
                    return false;
                }else{
                    return (cur_date > choosenTimeMilliseconds && date1 < choosenTimeMilliseconds) || cur_date == choosenTimeMilliseconds;
                }
            }
        }

        //Leaves to appointment
        function goToAppointment(appointment)
        {
            if(appointment.ReadStatus == '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        }

}]);

myApp.controller('IndividualAppointmentController', ['NavigatorParameters','NativeNotification','$scope',
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
        //Historical Delay Chart
        //get SQL date format
        var day = $scope.app.ScheduledStartTime.toISOString().slice(0, 19).replace('T', ' ');
        console.log(day);

        var percent = Appointments.getPercent($scope.app.AppointmentSerNum);
        $scope.percent0 = percent[0];
        $scope.percent15 = percent[1];
        $scope.percent30 = percent[2];
        $scope.percent45 = percent[3];

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

        };

        $scope.aboutWait = function () {
            window[navigatorName].pushPage('./views/personal/appointmentswait/aboutwait.html', {
                contentLink: $scope.app["URL_"+UserPreferences.getLanguage()],
                contentType: $scope.app["AppointmentType_"+UserPreferences.getLanguage()]
        });

        };

        $scope.goToWait=function()
        {
            window[navigatorName].pushPage('./views/personal/appointmentswait/waitinginfo.html', {
                contentLink: $scope.app["URL_"+UserPreferences.getLanguage()],
                contentType: $scope.app["AppointmentType_"+UserPreferences.getLanguage()]
            });
        };
    }]);

myApp.controller('waitingInfoController', ['$scope', '$timeout', 'NavigatorParameters', '$rootScope', '$filter', function ($scope, $timeout, NavigatorParameters, $rootScope, $filter) {

    //Obtaining appointment information parameters
    var parameters = NavigatorParameters.getParameters();
    var navigatorName = parameters.Navigator;

    console.log("Navigator paranms",parameters);

    initBooklet();

    //Initialization variables for material
    function initBooklet() {
        $rootScope.contentsEduBooklet = parameters;
        $scope.booklet = parameters.Booklet;
        $scope.activeIndex = parameters.Index;
        $scope.tableOfContents = parameters.TableOfContents;
    }
    $scope.isFullscreen = false;

    /**
     * Function handlers for advancing with the carousel
     */
    $scope.goNext = function () {
        if ($scope.activeIndex < $scope.tableOfContents.length - 1) {
            $scope.activeIndex++;
            $scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);
            console.log('go next');
        }
    };
    $scope.goBack = function () {
        if ($scope.activeIndex > 0) {
            $scope.activeIndex--;
            $scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);
            console.log('go back');
        }

    };
    /*
     * Method in charge of fullscreen functionality. **deprecated!!
     */
    // $scope.fullScreenToggle = function () {
    // 	$scope.isFullscreen = !$scope.isFullscreen;
    // 	setHeightElement();
    // }

    /**
     * Instantiation the popover for table of contents, delayed is to prevent the transition animation from lagging.
     */
    $timeout(function () {
        ons.createPopover('./views/education/table-contents-popover.html').then(function (popover) {
            $scope.popover = popover;
            $rootScope.popoverEducation = popover;
            $scope.popover.on('posthide', function () {
                if (typeof $rootScope.indexEduMaterial !== 'undefined') $scope.carousel.setActiveCarouselItemIndex($rootScope.indexEduMaterial);
            });
        });
    }, 300);

    //Popover method to jump between educational material sections from a table of contents
    $rootScope.goToSectionBooklet = function (index) {
        $rootScope.indexEduMaterial = index;
        $rootScope.popoverEducation.hide();
    };
    //Cleaning up controller after its uninstantiated. Destroys all the listeners and extra variables
    $scope.$on('$destroy', function () {
        console.log('on destroy');
        ons.orientation.off("change");
        delete $rootScope.contentsEduBooklet;
        document.removeEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);
        document.removeEventListener('ons-carousel:init', handleInitEventCarousel);
        $scope.carousel.off('init');
        $scope.carousel.off('postchange');
        $scope.popover.off('posthide');
        $scope.popover.destroy();
        delete $rootScope.indexEduMaterial;
        delete $rootScope.popoverEducation;
        delete $rootScope.goToSectionBooklet;
    });
    /**
     * Set height of container carousel element
     *
     */
    function setHeightElement() {
        $timeout(function () {
            var constantHeight = (ons.platform.isIOS()) ? 120 : 100;
            var divTitleHeight = $('#divTitleBookletSection').height();
            if ($scope.isFullscreen) {
                divTitleHeight = 0;
                constantHeight -= 48;
            }
            var heightChange = document.documentElement.clientHeight - constantHeight - divTitleHeight;
            $scope.heightSection = heightChange + 'px';
            $('#contentMaterial').height(heightChange);
        }, 10);
    }
    //Handles the post change even carousel, basically updates activeIndex, sets height of view and lazily loads slides
    function handlePostChangeEventCarousel(ev) {
        setHeightSection(ev.activeIndex);
        $scope.carousel = ev.component;
        $scope.activeIndex = ev.activeIndex;
        setHeightElement();
        lazilyLoadSlides(ev.activeIndex);
    }

    //Sets the height dynamically for educational material contents. Fixing the bug from Onsen.
    function setHeightSection(index) {
        $scope.heightSection = $('#sectionContent' + index).height();
    }

    //This method is in charge of "lazy loading". It only loads the material if it has not been loaded yet and only for the current, previous and next slides.
    function lazilyLoadSlides(index) {
        if (index - 1 >= 0 && !$scope.tableOfContents[index - 1].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index - 1].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index - 1].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        }
        if (!$scope.tableOfContents[index].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        };
        if (index + 1 < $scope.tableOfContents.length && !$scope.tableOfContents[index + 1].hasOwnProperty("Content")) {
            $.get($scope.tableOfContents[index + 1].Url, function (res) {
                $timeout(function () {
                    $scope.tableOfContents[index + 1].Content = $filter('removeTitleEducationalMaterial')(res);
                });
            });
        }
    }
    //Function that handles the initialization of the carousel. Basically deals with instantiation of carousel, loading the first slides, settings initial height, and then instaitiating a listener to watch the
    //change from portrait to landscape.
    function handleInitEventCarousel(ev) {
        console.log('initializing carouse');
        $scope.carousel = ev.component;
        $timeout(function () {
            $scope.carousel.setActiveCarouselItemIndex(parameters.Index);
            $scope.carousel.refresh();
            lazilyLoadSlides(parameters.Index);
            setHeightElement();

        }, 10);
        if (app) {
            ons.orientation.on("change", function (event) {
                console.log(event.isPortrait); // e.g. portrait
                //$scope.carousel.refresh();
                console.log('orientation changed');
                setHeightElement();
                var i = $scope.carousel._scroll / $scope.carousel._currentElementSize;
                delete $scope.carousel._currentElementSize;
                $scope.carousel.setActiveCarouselItemIndex(i);
            });
        }
    }

/*
    $scope.gaugeOptions = {

        chart: {
            type: 'solidgauge'
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickAmount: 2,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

// The speed gauge
    $scope.chartSpeed = Highcharts.chart('container-speed', Highcharts.merge($scope.gaugeOptions, {
        yAxis: {
            min: 0,
            max: 30,
            title: {
                text: ''
            }
        },

        credits: {
            enabled: false
        },

        series: [{
            name: 'Speed',
            data: [23],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                '<span style="font-size:18px;color:black">%</span></div>'
            },
            tooltip: {
                valueSuffix: '%'
            }
        }]

    }));
*/
}]);