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
          <div class="col-md-3 animated flipInY">
            <div class="panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goToAddPost()">
              <div class="panel-info">
                <div class="panel-content" style="text-align:center">
                  <span style="font-size: 60px;" class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span><br>
                  <br><br>
                  <span style="font-size: 40px;">Add</span>
                </div>
              </div>
            </div>
            <div ng-include="'templates/side-panel-menu.php'"></div>
          </div>
          <div class="col-md-9 animated zoomIn">
            <div class="panel-container" style="text-align:left">
              <div class="panel-info">
                <div class="panel-title-custom" style="padding-bottom: 10px;">
                  <div class="clearfix">
                    <h2 style="font-size: 36px; float:left;">
                      Posts
                    </h2>
                  </div>
                </div>  
                <div class="panel-input">
                  <div class="clearfix">
                    <div style="margin-bottom: 10px;">
                      <div class="input-group">
                        <input type="text" class="form-control" ng-model="filterValue" ng-change="filterPost(filterValue)" placeholder="Search...">
                        <span class="input-group-addon">
                          <span class="glyphicon glyphicon-search"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="data-table">
                    <div class="gridStyle" ui-grid="gridOptions" ui-grid-resize-columns style="height:520px"></div>
                    <div class="table-buttons" style="text-align: center;">
                      <form method="post" ng-submit="submitPublishFlags()">
                        <input class="btn btn-primary" ng-class="{'disabled': !changesMade}" type="submit" value="Save Changes">
                      </form>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   <div class="bannerMessage alert-success">{{bannerMessage}}</div>
  </div>

  <script type="text/ng-template" id="deletePostModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-trash" style="font-size: 30px;"></span> 
          Delete Post: {{postToDelete.name_EN}} / {{postToDelete.name_FR}}
        </h2>
      </div>
      <div class="modal-body">
        <div class="bs-callout bs-callout-danger">
          <h4>Post Delete</h4>
          <p class="deleteText">Are you sure you want to delete the post "{{postToDelete.name_EN}}" ?</p>
          <form method="post" ng-submit="deletePost()">			
            <input class="btn btn-primary" type="submit" value="Delete">
            <input ng-click="cancel()" class="btn btn-danger" type="button" value="Cancel">
          </form>
        </div>
      </div>
    </script>
    <script type="text/ng-template" id="editPostModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-pencil" style="font-size: 30px;"></span> 
          Edit Post: {{post.name_EN}} / {{post.name_FR}}
          <span style="float:right;"> 
            <form method="post" ng-submit="updatePost()">
              <input class="btn btn-primary" ng-class="{'disabled': !checkForm()}" type="submit" value="Save Changes">
            </form>
          </span>      
        </h2>
      </div>
      <div class="modal-body">
        <uib-accordion>
          <uib-accordion-group is-open="statusA.open">
            <uib-accordion-heading>
              <div>
                Titles <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusA.open, 'glyphicon-chevron-right': !statusA.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Post Titles (EN / FR): {{post.name_EN}} / {{post.name_FR}}</h4>
              To change the current title(s), enter the new title(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="post.name_EN" ng-change="setChangesMade()" placeholder="English Title" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="post.name_FR" ng-change="setChangesMade()" placeholder="Titre Français" required="required">
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusB.open">
            <uib-accordion-heading>
              <div>
                Body <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusB.open, 'glyphicon-chevron-right': !statusB.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="row">
              <div class="col-md-8">
                <div style="text-align:center;">
                  <span style="font-size:20px;">HTML</span>
                </div>
                <div class="form-group">
                  <div text-angular ng-model="post.body_EN" ng-change="setChangesMade()"></div>
                </div>
              </div>
              <div class="col-md-4">
                <div style="text-align:center;">
                  <span style="font-size:20px;">iPhone 4 Rendered</span>
                </div>
                <div class="render-html-iphone4"> 
                  <iframe frameborder="0" height="100%" width="100%" srcdoc="{{post.body_EN | deliberatelyTrustAsHtml}}"></iframe>
                </div>
              </div>    
            </div>
            <div class="row">
              <div style="min-height: 15px;"></div><hr>
            </div>
            <div class="row">  
              <div class="col-md-8">
                <div style="text-align:center;">
                  <span style="font-size:20px;">HTML</span>
                </div>
                <div class="form-group">
                  <div text-angular ng-model="post.body_FR" ng-change="setChangesMade()"></div>
                </div>
              </div>
              <div class="col-md-4">
                <div style="text-align:center;">
                  <span style="font-size:20px;">iPhone 4 Rendered</span>
                </div>
                <div class="render-html-iphone4"> 
                  <iframe frameborder="0" height="100%" width="100%" srcdoc="{{post.body_FR | deliberatelyTrustAsHtml}}"></iframe>
                </div>
              </div>    
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusC.open" ng-show="post.type == 'Announcement'">
            <uib-accordion-heading>
              <div>
                Publish Date <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusC.open, 'glyphicon-chevron-right': !statusC.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Publish Date:
                <span ng-hide="post.publish_date && post.publish_time"> NONE</span>
                <span ng-show="post.publish_date && post.publish_time">
                  {{post.publish_date | date:'fullDate'}} at {{post.publish_time | date:'HH:mm'}}
              </h4>
              To change the publish date, use the fields below.
            </div>

            <div class="row">
              <div class="col-md-6" style="padding-top: 10px;">
                <p class="input-group">
                  <input type="text" class="form-control" uib-datepicker-popup="{{format}}" ng-model="post.publish_date" is-open="popup.opened" min="minDate" ng-change="setChangesMade()" datepicker-options="dateOptions" ng-required="true" close-text="Close" />
                  <span class="input-group-btn">
                    <button class="btn btn-default" ng-click="open()"><i class="glyphicon glyphicon-calendar"></i></button>
                  </span>
                </p>
              </div>
              <div class="col-md-6" style="margin-top: -24px;">
                <div>
                  <uib-timepicker ng-change="setChangesMade()" ng-model="post.publish_time" minute-step="5" show-meridian="false"></uib-timepicker>
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusD.open">
            <uib-accordion-heading>
              <div>
                Filter Terms <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusD.open, 'glyphicon-chevron-right': !statusD.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Terms</h4>
              <ul class="list-items-4col">
                <li ng-show="allFilters(termList)">
                  All Terms
                </li>  
                <li ng-repeat="selectedTerm in termList | filter: {added: 1} : 1" ng-hide="allFilters(termList)">
                  {{selectedTerm.name}}
                </li>
              </ul>
              <p>To add/remove term filter, use the list below.</p>
            </div>
            <div class="list-space">
              <div class="input-group">
                <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                <input class="form-control" type="text" ng-model="termSearchField" ng-change="searchTerm(termSearchField)" placeholder="Search..."/>
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
          </uib-accordion-group>
          <uib-accordion-group is-open="statusE.open">
            <uib-accordion-heading>
              <div>
                Filter Diagnoses <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusE.open, 'glyphicon-chevron-right': !statusE.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Diagnosis Filters</h4>
              <ul class="list-items-4col">
                <li ng-show="allFilters(dxFilterList)">
                  All Diagnoses
                </li>  
                <li ng-repeat="dx in dxFilterList | filter: {added: 1} : 1" ng-hide="allFilters(dxFilterList)">
                  {{dx.name}}
                </li>
              </ul>
              <p>To add/remove diagnosis filter, use the list below.</p>
            </div>
            <div class="list-space">
              <div class="input-group">
                <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                <input class="form-control" type="text" ng-model="dxSearchField" ng-change="searchDiagnosis(dxSearchField)" placeholder="Search..."/>
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
          </uib-accordion-group>
          <uib-accordion-group is-open="statusF.open">
            <uib-accordion-heading>
              <div>
                Filter Doctors <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusF.open, 'glyphicon-chevron-right': !statusF.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Doctor Filters</h4>
              <ul class="list-items-4col">
                <li ng-show="allFilters(doctorFilterList)">
                  All Doctors
                </li>  
                <li ng-repeat="doctor in doctorFilterList | filter: {added: 1} : 1" ng-hide="allFilters(doctorFilterList)">
                  {{doctor.name}}
                </li>
              </ul>
              <p>To add/remove doctors, use the list below.</p>
            </div>
            <div class="list-space">
              <div class="input-group">
                <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                <input class="form-control" type="text" ng-model="doctorSearchField" ng-change="searchDoctor(doctorSearchField)" placeholder="Search..."/>
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
          </uib-accordion-group>
          <uib-accordion-group is-open="statusG.open">
            <uib-accordion-heading>
              <div>
                Filter Resources <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusG.open, 'glyphicon-chevron-right': !statusG.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Resource Filters</h4>
              <ul class="list-items-4col">
                <li ng-show="allFilters(resourceFilterList)">
                  All Resources
                </li>  
                <li ng-repeat="resource in resourceFilterList | filter: {added: 1} : 1" ng-hide="allFilters(resourceFilterList)">
                  {{resource.name}}
                </li>
              </ul>
              <p>To add/remove resources, use the list below.</p>
            </div>
            <div class="list-space">
              <div class="input-group">
                <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                <input class="form-control" type="text" ng-model="resourceSearchField" ng-change="searchResource(resourceSearchField)" placeholder="Search..."/>
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
          </uib-accordion-group>
        </uib-accordion>
      </div>
    </script>
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
	$(".global-nav li.nav-post").addClass("active");
    </script>

       

          
                      
                    
