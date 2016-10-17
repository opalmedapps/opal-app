<?php session_start();

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	if (!isset($_SESSION[SESSION_KEY_LOGIN])) {
		echo "<script>
			window.location.href = 'php/user/logout.php';
		      </script> ";
	}

?> 
 <div id="main">
    <div id="top">
      <div class="clearfix">
        <div class="row">
          <div class="col-md-3 form-box-left animated" ng-show="formLoaded">
            <div class="panel-container">
              <div class="panel-info">
                <div class="panel-title-custom" style="border-bottom: 0">
                  <h2 style="margin-bottom: 15px; margin-top: 0;">
                    <span style="font-size: 20px;" class="glyphicon glyphicon-th-list" aria-hidden="true"></span>
                    Progress: {{stepProgress}}% Complete
                  </h2>
                  <div class="progress progress-striped active">
                    <div class="progress-bar" ng-class="{'progress-bar-success': stepProgress == 100}" role="progressbar" aria-valuenow="{{stepProgress}}" aria-valuemin="0" aria-valuemax="100" style="width: {{stepProgress}}%">
                    </div>
                  </div>
                </div>
                <div class="panel-content" style="padding-top: 0">
                  <ul class="list-group">
                    <li class="list-group-item" ng-show="newPost.name_EN || newPost.name_FR">
                      <strong>Titles:</strong> EN: {{newPost.name_EN}} | FR: {{newPost.name_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newPost.body_EN || newPost.body_FR">
                      <strong>Body:</strong> See rendered output in accordion
                    </li>
                    <li class="list-group-item" ng-show="newPost.type">
                      <strong>Type:</strong> {{newPost.type}}
                    </li>
                    <li class="list-group-item" ng-show="newPost.type">
                      <strong>Publish Date:</strong> 
                      <span ng-hide="newPost.publish_date && newPost.publish_time"> None </span> <br> 
                      <span ng-show="newPost.publish_date && newPost.publish_time">
                        {{newPost.publish_date | date:'fullDate'}} at {{newPost.publish_time | date:'HH:mm'}}
                      </span>
                    </li>
                    <li class="list-group-item" ng-show="newPost.type"> 
                      <strong>Term Filter(s):</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-show="allFilters(termList)">
                            All Terms
                          </li> 
                          <li ng-repeat="term in termList | filter: {added: 1} : 1" ng-hide="allFilters(termList)">
                            {{term.name}}
                          </li>
                        </ul>
                      </p>
                    </li>
                    <li class="list-group-item" ng-show="newPost.type">
                      <strong>Diagnosis Filter(s):</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-show="allFilters(dxFilterList)">
                            All Diagnoses
                          </li> 
                          <li ng-repeat="Filter in dxFilterList | filter: {added: 1} : 1" ng-hide="allFilters(dxFilterList)">
                            {{Filter.name}}
                          </li>
                        </ul>
                      </p>
                    </li>
                    <li class="list-group-item" ng-show="newPost.type">
                      <strong>Doctor Filter(s):</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-show="allFilters(doctorFilterList)">
                            All Doctors
                          </li> 
                          <li ng-repeat="Filter in doctorFilterList | filter: {added: 1} : 1" ng-hide="allFilters(doctorFilterList)">
                            {{Filter.name}}
                          </li>
                        </ul>
                      </p>
                    </li>
                    <li class="list-group-item" ng-show="newPost.type">
                      <strong>Resource Filter(s):</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-show="allFilters(resourceFilterList)">
                            All Resources
                          </li> 
                          <li ng-repeat="Filter in resourceFilterList | filter: {added: 1} : 1" ng-hide="allFilters(resourceFilterList)">
                            {{Filter.name}}
                          </li>
                        </ul>
                      </p>
                    </li>
                  </ul>
                  <div ng-hide="toggleAlertText()" class="table-buttons" style="text-align: center">
                    <form ng-submit="submitPost()" method="post">
                      <button class="btn btn-primary" ng-class="{'disabled': !checkForm()}" type="submit">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="side-panel-menu panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goBack()">
              <div class="panel-info">
                <div class="panel-content" style="text-align:center">
                  <span style="font-size: 60px;" class="glyphicon glyphicon-circle-arrow-left" aria-hidden="true"></span><br>
                  <br><br>
                  <span style="font-size: 40px;">Posts</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-9 form-box-right animated" ng-show="formLoaded">
            <div class="panel-container" style="text-align: left">
              <uib-accordion close-others="true">
                <uib-accordion-group ng-class="(newPost.name_EN && newPost.name_FR) ? 'panel-success': 'panel-danger'" is-open="true">
                  <uib-accordion-heading> 
                    <h2 class="panel-title"><strong>Assign EN/FR titles</strong>
                      <span ng-hide="newPost.name_EN && newPost.name_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newPost.name_EN && newPost.name_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newPost.name_EN" ng-change="titleUpdate()" placeholder="English Title" required="required">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newPost.name_FR" ng-change="titleUpdate()" placeholder="Titre Français" required="required">
                        </div>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>
                <uib-accordion-group ng-class="(newPost.body_EN && newPost.body_FR) ? 'panel-success': 'panel-danger'" is-open="statusB">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Body EN/FR </strong>
                      <span ng-hide="newPost.body_EN && newPost.body_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newPost.body_EN && newPost.body_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
<div class="alert alert-warning" role="alert">
                          <span><strong>HTML exceptions</strong><br>
                            <ul style="margin-left: 15px;">
                              <li>Add <strong>img-responsive</strong> class to img tags. Ex: 
                                <code data-lang="html">&lt;img class="img-responsive"&gt;</code> 
                              </li>
                              <li>No <strong>absolute</strong> measurements! Ie. 
                                <code data-lang="html">&lt;span style="width:200px"&gt;</code>
                              </li>
                            </ul>
                          </span>
                        </div>  
                    <div class="row">
                      <div class="col-md-8">
                        <div style="text-align:center;">
                          <span style="font-size:20px;">English</span>
                        </div>  
                        <div class="form-group">
                          <div text-angular ng-model="newPost.body_EN" ng-change="bodyUpdate()"></div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div style="text-align:center;">
                          <span style="font-size:20px;">iPhone 4 Rendered</span>
                        </div>
                        <div class="render-html-iphone4"> 
                          <iframe height="100%" width="100%" srcdoc="{{newPost.body_EN | deliberatelyTrustAsHtml}}" frameborder="0"></iframe>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div style="min-height: 15px;"></div><hr>
                    </div>
                    <div class="row">
                      <div class="col-md-8">
                        <div style="text-align:center;">
                          <span style="font-size:20px;">Français</span>
                        </div>
                        <div class="form-group">
                          <div text-angular ng-model="newPost.body_FR" ng-change="bodyUpdate()"></div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div style="text-align:center;">
                          <span style="font-size:20px;">iPhone 4 Rendered</span>
                        </div>
                        <div class="render-html-iphone4"> 
                          <iframe frameborder="0" height="100%" width=100%" srcdoc="{{newPost.body_FR | deliberatelyTrustAsHtml}}"></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>
                <uib-accordion-group ng-class="newPost.type ? 'panel-success': 'panel-danger'" is-open="statusC.open">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign a type</strong>
                      <span ng-hide="newPost.type" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newPost.type" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-5">
                        <ul class="no-list">
                          <li ng-repeat="type in postTypes">
                            <label>
                              <input type="radio" ng-model="newPost.type" ng-change="typeUpdate()" ng-value="type.name" /> {{type.name}}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group> 
                <uib-accordion-group ng-class="newPost.publish_date && newPost.publish_time ? 'panel-success': 'panel-danger'" is-open="statusD.open" ng-show="newPost.type == 'Announcement'">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign a publish date</strong>
                      <span ng-hide="newPost.publish_date && newPost.publish_time" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newPost.publish_date && newPost.publish_time" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6" style="padding-top: 10px;">
                        <p class="input-group">
                          <input type="text" class="form-control" uib-datepicker-popup="{{format}}" ng-model="newPost.publish_date" ng-change="publishDateUpdate()" is-open="popup.opened" min="minDate" datepicker-options="dateOptions" ng-required="true" close-text="Close" />
                          <span class="input-group-btn">
                            <button class="btn btn-default" ng-click="open()"><i class="glyphicon glyphicon-calendar"></i></button>
                          </span>
                        </p>
                      </div>
                      <div class="col-md-6" style="margin-top: -24px;">
                        <div>
                          <uib-timepicker ng-model="newPost.publish_time" ng-change="publishDateUpdate()" minute-step="5" show-meridian="false"></uib-timepicker>
                        </div>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>     
                <uib-accordion-group ng-class="panel-warning" is-open="statusE.open">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Filter terms</strong>
                      <span style="float:right"><em>Optional</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="list-space">
                      <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                        <input class="form-control" type="text" ng-model="termSearchField" ng-change="searchTerm(termSearchField)" placeholder="Search Terms"/>
                      </div>
              	      <div style="padding: 10px;">
                        <label>
                          <input type="checkbox" ng-click="selectAllTerms()"> Select All
                        </label>
                      </div>
                      <ul class="list-items">
                        <li ng-repeat="term in termList | filter: searchTermsFilter">
                          <label>
                            <input type="checkbox" ng-click="selectItem(term)" ng-checked="term.added" /> {{term.name}}
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </uib-accordion-group>    
                <uib-accordion-group ng-class="panel-warning" is-open="statusF.open">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Filter Diagnoses</strong>
                      <span style="float:right"><em>Optional</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="list-space">
                      <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                        <input class="form-control" type="text" ng-model="dxSearchField" ng-change="searchDiagnosis(dxSearchField)" placeholder="Search Diagnosis"/>
                      </div>
              	      <div style="padding: 10px;">
                        <strong>
                           To select all, leave all boxes unchecked.
                        </strong>
                      </div>
                      <ul class="list-items">
                        <li ng-repeat="dx in dxFilterList | filter: searchDxFilter">
                          <label>
                            <input type="checkbox" ng-click="selectItem(dx)" ng-checked="dx.added" /> {{dx.name}}
                          </label>
                        </li>
                      </ul>
                     </div>
                  </div>
                </uib-accordion-group>     
                <uib-accordion-group ng-class="panel-warning" is-open="statusG.open">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Filter Doctors</strong>
                      <span style="float:right"><em>Optional</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="list-space">
                      <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                        <input class="form-control" type="text" ng-model="doctorSearchField" ng-change="searchDoctor(doctorSearchField)" placeholder="Search Doctor"/>
                      </div>
              	      <div style="padding: 10px;">
                        <strong>
                           To select all, leave all boxes unchecked.
                        </strong>
                      </div>
                      <ul class="list-items">
                        <li ng-repeat="doctor in doctorFilterList | filter: searchDoctorFilter">
                          <label>
                            <input type="checkbox" ng-click="selectItem(doctor)" ng-checked="doctor.added" /> {{doctor.name}}
                          </label>
                        </li>
                      </ul>
                     </div>
                  </div>
                </uib-accordion-group>     
                <uib-accordion-group ng-class="panel-warning" is-open="statusH.open">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Filter Resource</strong>
                      <span style="float:right"><em>Optional</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="list-space">
                      <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                        <input class="form-control" type="text" ng-model="resourceSearchField" ng-change="searchResource(resourceSearchField)" placeholder="Search Resource"/>
                      </div>
              	      <div style="padding: 10px;">
                        <strong>
                           To select all, leave all boxes unchecked.
                        </strong>
                      </div>
                      <ul class="list-items">
                        <li ng-repeat="resource in resourceFilterList | filter: searchResourceFilter">
                          <label>
                            <input type="checkbox" ng-click="selectItem(resource)" ng-checked="resource.added" /> {{resource.name}}
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </uib-accordion-group>     
              </uib-accordion> 
            </div>       
          </div>
        </div>
      </div>
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
	$(".global-nav li.nav-new-post").addClass("active");
    </script>



