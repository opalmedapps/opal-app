<?php session_start();

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$username 	    = $_SESSION[SESSION_KEY_NAME];
	$loginAttempt 	= $_SESSION[SESSION_KEY_LOGIN];
	$registerAttempt= $_SESSION[SESSION_KEY_REGISTER];
	$userid		    = $_SESSION[SESSION_KEY_USERID];
 ?>

  <div id="main">
    <!-- PHP if user is logged in -->
    <? if($loginAttempt == 1) : ?>
    <div id="top" class="home-main">
      <div class="clearfix">
        <div class="row">
          <div class="col-md-3 animated slideInLeft">
            <div class="panel-container">
              <div class="panel-info">
                <div class="panel-title-custom" style="padding-bottom: 10px;">
                  <span style="font-size: 20px;" class="glyphicon glyphicon-time" aria-hidden="true"></span>
                  <span style="font-size: 26px;">Cron</span> 
                </div>
                <div class="panel-content">
                  <p>
                    <strong>Next Cron:</strong> <br>
                      {{cronDetails.nextCronDate | date:'fullDate'}} at {{cronDetails.nextCronTime | date:'HH:mm'}} <br>
                    <strong>Repeat:</strong> Every {{cronDetails.repeatInterval}} {{cronDetails.repeatUnits}}
                  </p>
                </div>
                <div class="panel-buttons">
                  <span style="font-size: 20px; cursor: pointer;" class="glyphicon" ng-class="editCron ? 'glyphicon-chevron-down': 'glyphicon-option-horizontal'" aria-hidden="true" ng-click="editCron = !editCron"></span>
                </div>
              </div>
            </div>
            <div class="panel-container" ng-show="editCron">
              <div class="panel-info">
                <div class="panel-content">
                  <p><strong>Next Cron</strong></p>
                  <div class="row">
                    <div class="col-md-6" style="padding-top: 10px;">
                      <p class="input-group">
                        <input type="text" class="form-control" uib-datepicker-popup="{{format}}" ng-model="cronDetailsMod.nextCronDate" is-open="opened" min="minDate" ng-change="setChangesMade()" datepicker-options="dateOptions" ng-required="true" close-text="Close" />
                        <span class="input-group-btn">
                          <button class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6" style="margin-top: -24px;">
                      <div>
                        <uib-timepicker ng-model="cronDetailsMod.nextCronTime" ng-change="setChangesMade()" minute-step="5" show-meridian="false"></uib-timepicker>
                      </div>
                    </div>
                  </div>
                  <p><strong>Repeat</strong></p>
                  <div class="row">
                    <div class="col-md-6">
                      <select ng-model="cronDetailsMod.repeatUnits" ng-change="setChangesMade()" ng-options="unit for unit in repeatUnits" class="form-control" ></select>
                    </div>
                    <div class="col-md-6">
                      <input class="form-control" ng-model="cronDetailsMod.repeatInterval" ng-change="setChangesMade()" type="number" max="59" min="1" required="required">
                    </div>
                  </div>
                </div>
                <div class="panel-buttons">
                  <input class="btn btn-primary" type="button" value="Save Changes" ng-class="{'disabled': !checkForm()}" ng-click="submitCronChange()">
                </div>
              </div>
            </div>
            <!--<div class="panel-container animated" ng-class="{pulse: hoverP}" ng-mouseenter="hoverP=true" ng-mouseleave="hoverP=false" style="cursor:pointer;" ng-click="registerUser()">
              <div class="panel-info" style="height:100px; background-color:#fffff4; margin-top:25px;">
                <div class="panel-content" style="text-align:center">
                  <span style="font-size: 30px;" class="glyphicon glyphicon-user" aria-hidden="true"></span><br>
                  <span style="font-size: 20px;">Register Users</span>
                </div>
              </div>
            </div>-->
          </div>
          <div class="col-md-9 animated slideInDown" ng-controller="sidePanelMenuController">
            <div class="row">
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goToAlias()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-cloud" aria-hidden="true"></span><br>
                      <br><br>
                      <span style="font-size: 40px;">Aliases</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverB}" ng-mouseenter="hoverB=true" ng-mouseleave="hoverB=false" style="cursor:pointer;" ng-click="goToPost()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-comment" aria-hidden="true"></span><br>
                      <br><br>
                      <span style="font-size: 40px;">Posts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverC}" ng-mouseenter="hoverC=true" ng-mouseleave="hoverC=false" style="cursor:pointer;" ng-click="goToEducationalMaterial()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-book" aria-hidden="true"></span><br><br>     
                      <span style="font-size: 40px; line-height: 35px;">Educational<br> Material</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
            <div class="row" style="margin-top:25px;">
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverD}" ng-mouseenter="hoverD=true" ng-mouseleave="hoverD=false" style="cursor:pointer;" ng-click="goToHospitalMap()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-map-marker" aria-hidden="true"></span><br>
                      <br><br>
                      <span style="font-size: 40px;">Hospital Maps</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverE}" ng-mouseenter="hoverE=true" ng-mouseleave="hoverE=false" style="cursor:pointer;" ng-click="goToNotification()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-bell" aria-hidden="true"></span><br>
                      <br><br>
                      <span style="font-size: 40px;">Notifications</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverF}" ng-mouseenter="hoverF=true" ng-mouseleave="hoverF=false" style="cursor:pointer;" ng-click="goToPatient()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 60px;" class="glyphicon glyphicon-user" aria-hidden="true"></span><br>
                      <br><br>
                      <span style="font-size: 40px;">Patients</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row" style="margin-top:25px;">
              <div class="col-md-4">
                <div class="panel-container animated" ng-class="{pulse: hoverG}" ng-mouseenter="hoverG=true" ng-mouseleave="hoverG=false" style="cursor:pointer;" ng-click="goToTestResult()">
                  <div class="panel-info" style="height: 200px;">
                    <div class="panel-content" style="text-align:center">
                      <i style="font-size: 60px;" class="fa fa-heartbeat" aria-hidden="true"></i><br>
                      <br><br>
                      <span style="font-size: 40px;">Test Results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- PHP Else user is not logged in to use the site -->
    <? else: ?> 
    <div class="container login-register">
      <div class="row">
        <div class="col-sm-8 col-md-6 col-sm-offset-2 col-md-offset-3"> 
          <div class="form-box animated" ng-class="{'bounceInDown': !formLoaded}">
            <h1 class="title">
              <span class="login-register-title" ng-show="loginDisplayed">Log In</span>
            </h1>  
            <div id="block-system-main" class="login-register-block-main">
              <div class="login-content clearfix">
                <form ng-submit="submitLogin()" method="post">
                  <div class="row clearfix" style="margin-top:20px; margin-bottom:20px;">
                    <div class="col-md-12">
                      <label>Username</label>
                      <div class="input-group">
                        <span class="input-group-addon">U</span>
                        <input type="text" class="form-control" required="required" ng-model="login.username">    
                      </div>
                    </div>
                  </div>
                  <div class="row" style="margin-bottom:20px;">    
                    <div class="col-md-12">
                      <label>Password</label>
                      <div class="input-group">
                        <span class="input-group-addon">P</span>
                        <input type="password" class="form-control" required="required" ng-model="login.password">    
                      </div>
                    </div>
                  </div>  
                  <div class="table-buttons">
                    <div class="btn-group btn-group-justified" role="group">
                      <div class="btn-group" role="group">
                        <input class="btn btn-primary" ng-class="{'disabled': !loginFormComplete()}" type="submit" value="Log in">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <!--<div class="register-content clearfix">
                <form ng-submit="submitRegister()" method="post">
                  <div class="row clearfix" style="margin-top:20px; margin-bottom:20px;">
                    <div class="col-md-12">
                      <label>Username</label>
                      <div class="input-group">
                        <span class="input-group-addon">U</span>
                        <input type="text" class="form-control" required="required" ng-model="register.username">    
                      </div>
                    </div>
                  </div>
                  <div class="row" style="margin-bottom:20px;">    
                    <div class="col-md-12">
                      <label>Password</label>
                      <div class="input-group">
                        <span class="input-group-addon">P</span>
                        <input type="password" class="form-control" required="required" ng-model="register.password">    
                      </div>
                    </div>
                  </div>
                  <div class="row" style="margin-bottom:20px;">    
                    <div class="col-md-12">
                      <label>Confirm Password</label>
                      <div class="input-group">
                        <span class="input-group-addon">C</span>
                        <input type="password" class="form-control" required="required" ng-model="register.passConfirm">    
                      </div>
                    </div>
                  </div>  
                  <div class="table-buttons">
                    <div class="btn-group btn-group-justified" role="group">
                      <div class="btn-group" role="group">
                        <input class="btn btn-primary" ng-class="{'disabled': !registerFormComplete()}" type="submit" value="Register">
                      </div>
                    </div>
                  </div>
                </form>
              </div>-->
            </div>
          </div>
        </div>
      </div>
    </div>                         
    <? endif; ?> 
    <div class="bannerMessage" ng-class="banner.alertClass">{{banner.message}}</div>
  </div>
<script type="text/ng-template" id="processingModal.htm">
  <div class="modal-header">
    <h1> Processing...</h1>
  </div>
  <div class="modal-body">
    <div class="progress progress-striped active">
      <div class="progress-bar" style="width: 100%"></div>        
    </div>
  </div>
</script>

   <script type="text/javascript">
	$(".global-nav li").removeClass("active");
	$(".global-nav li.nav-home").addClass("active");
    </script>

       

          
                      
                    
