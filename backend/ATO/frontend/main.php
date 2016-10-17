<?php session_start();

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$username 	= $_SESSION[SESSION_KEY_NAME];
	$loginAttempt 	= $_SESSION[SESSION_KEY_LOGIN];
	$registerAttempt= $_SESSION[SESSION_KEY_REGISTER];
	$userid		= $_SESSION[SESSION_KEY_USERID];
?>
<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6 lt8"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7 lt8"> <![endif]-->
<!--[if IE 8]><html class="ie8" lang="en"><![endif]-->
<!--[if IE 9]><html class="ie9" lang="en"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en"><!--<![endif]-->
<head>
	<title>ARIA To Opal</title>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		
	<!-- Libraries -->
	<script src="js/lib/jquery/jquery-2.2.1.min.js"></script>
	<script src="js/lib/jquery/jquery-ui.min.js"></script>
	<script src="js/lib/angular/angular.min.js"></script>
	<script src="js/lib/angular/angular-route.min.js"></script>
	<script src="js/lib/angular/angular-animate.min.js"></script>
	<script src="js/lib/angular/angular-sanitize.min.js"></script>
	<script src="js/lib/other/moment.min.js"></script>
	<script src="js/lib/livicon/prettify.min.js"></script>
	<script src="js/lib/bootstrap/bootstrap.min.js"></script>
	<script src="js/lib/bootstrap/ui-bootstrap-tpls-1.2.1.custom.min.js"></script>
	<script src="js/lib/bootstrap/bootstrap-datetimepicker.min.js"></script>
	<script src="js/lib/livicon/raphael-min.js"></script>
	<script src="js/lib/livicon/livicons-1.4-custom.min.js"></script>
	<script src="js/lib/ui-grid/ui-grid.min.js"></script>
	<script src="js/lib/textAngular/textAngular-rangy.min.js"></script>
	<script src="js/lib/textAngular/textAngular-sanitize.min.js"></script>
	<script src="js/lib/textAngular/textAngular.min.js"></script>

	<!-- Start Up -->
 	<script type="text/javascript" src="js/app/app.js"></script>

	<!-- Controller -->
 	<script type="text/javascript" src="js/app/controllers/controllers.js"></script>
 	<script type="text/javascript" src="js/app/controllers/headerController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/homeController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/aliasController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newAliasController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/postController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newPostController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newEduMatController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/eduMatController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/hospitalMapController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newHospitalMapController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/notificationController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newNotificationController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/patientController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/testResultController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/newTestResultController.js"></script>
 	<script type="text/javascript" src="js/app/controllers/sidePanelMenuController.js"></script>

	<!-- Collection -->
 	<script type="text/javascript" src="js/app/collections/collections.js"></script>

	<!-- Config -->
 	<script type="text/javascript" src="js/config.js"></script>
	
	<!-- Stylesheets -->
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/jquery-ui.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/bootstrap.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/bootstrap-datetimepicker.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/ui-grid.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/animate.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/livicon.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/prettify.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/docs.min.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/font-awesome.min.css">
	<link media="all" type="text/css" rel="stylesheet" href="css/lib/textAngular.css">

	<link media="all" type="text/css" rel="stylesheet" href="css/style.css">

</head>
<body ng-app="ATO_InterfaceApp">
  <div id="page">
    <div ng-controller="headerController">
    <div class="topbar">
      <div class="global-nav">
        <div class="global-nav-inner">
          <div class="container">
            <span class="title-topbar"> 
              ATO
            </span>
            <!-- PHP if user is logged in -->
            <? if($loginAttempt == "1") : ?>
            <span class="logout-topbar">
              <a href="php/user/logout.php">Logout</a>
            </span>
            <? endif; ?>
            <!--<div role="navigation">
              <ul id="global-actions" class="nav">
                <li class="nav-home">
                  <a href="#/">
                    <span class="text">Home</span>
                  </a>
                </li>
                <li class="nav-alias">
                  <a href="#/alias">
                    <span class="text">Aliases 
                    </span>
                  </a>
                </li>
                <li class="nav-post">
                  <a href="#/post">
                    <span class="text">Posts
                    </span>
                  </a>
                </li>
                <li class="nav-edu-mat">
                  <a href="#/educational-material">
                    <span class="text">Educational Material
                    </span>
                  </a>
                </li>
                <li class="nav-hospital-map">
                  <a href="#/hospital-map">
                    <span class="text">Hospital Maps
                    </span>
                  </a>
                </li>
                <li class="nav-notification">
                  <a href="#/notification">
                    <span class="text">Notifications
                    </span>
                  </a>
                </li>
              </ul>
            </div>-->
          </div>
        </div>
      </div>
    </div>
    </div>
  <ng-view></ng-view>

</div>
 <script>
	function date_time(id)
	{
	        date = new Date;
        	year = date.getFullYear();
	        month = date.getMonth();
        	months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
	        d = date.getDate();
        	day = date.getDay();
	        days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
        	h = date.getHours();
	        if(h<10)
        	{
                	h = "0"+h;
	        }
        	m = date.getMinutes();
	        if(m<10)
        	{
                	m = "0"+m;
	        }
        	s = date.getSeconds();
	        if(s<10)
        	{
                	s = "0"+s;
	        }
        	result = ''+days[day]+' '+months[month]+' '+d+' '+year+' '+h+':'+m+':'+s;
	        document.getElementById(id).innerHTML = result;
        	setTimeout('date_time("'+id+'");','1000');
	        return true;
	}
    </script>
   <script type="text/javascript">//window.onload = date_time('date_time');</script>
</body>
</html>
