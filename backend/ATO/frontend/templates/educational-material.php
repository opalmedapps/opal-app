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
            <div class="panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goToAddEducationalMaterial()">
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
                      Educational Material
                    </h2>
                  </div>
                </div>  
                <div class="panel-input">
                  <div class="clearfix">
                    <div style="margin-bottom: 10px;">
                      <div class="input-group">
                        <input type="text" class="form-control" ng-model="filterValue" ng-change="filterEduMat(filterValue)" placeholder="Search...">
                        <span class="input-group-addon">
                          <span class="glyphicon glyphicon-search"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="data-table">
                    <div class="gridStyle" ui-grid="gridOptions" ui-grid-expandable ui-grid-resize-columns style="height:520px"></div>
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


  <script type="text/ng-template" id="deleteEduMatModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-trash" style="font-size: 30px;"></span> 
          Delete Educational Material: {{eduMatToDelete.name_EN}} / {{eduMatToDelete.name_FR}}
        </h2>
      </div>
      <div class="modal-body">
        <div class="bs-callout bs-callout-danger">
          <h4>Educational Material Delete</h4>
          <p class="deleteText">Are you sure you want to delete the Educational Material "{{eduMatToDelete.name_EN}}" ?</p>
          <form method="post" ng-submit="deleteEducationalMaterial()">			
            <input class="btn btn-primary" type="submit" value="Delete">
            <input ng-click="cancel()" class="btn btn-danger" type="button" value="Cancel">
          </form>
        </div>
      </div>
    </script>
    <script type="text/ng-template" id="editEduMatModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-pencil" style="font-size: 30px;"></span> 
          Edit Educational Material: {{eduMat.name_EN}} / {{eduMat.name_FR}}
          <span style="float:right;"> 
            <form method="post" ng-submit="updateEduMat()">
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
              <h4>Current Educational Material Titles (EN / FR): {{eduMat.name_EN}} / {{eduMat.name_FR}}</h4>
              To change the current title(s), enter the new title(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="eduMat.name_EN" ng-change="setChangesMade()" placeholder="English Title" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="eduMat.name_FR" ng-change="setChangesMade()" placeholder="Titre Français" required="required">
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusB.open" ng-show="!eduMat.tocs.length">
            <uib-accordion-heading>
              <div>
                URLs <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusB.open, 'glyphicon-chevron-right': !statusB.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Educational Material URLs (EN / FR): {{eduMat.url_EN}} / {{eduMat.url_FR}}</h4>
              To change the current URL(s), enter the new URL(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="eduMat.url_EN" ng-change="setChangesMade()" placeholder="English URL" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="eduMat.url_FR" ng-change="setChangesMade()" placeholder="URL Français" required="required">
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusC" ng-hide="eduMat.url_EN || eduMat.url_FR">
            <uib-accordion-heading>
              <div>
                Table of Contents <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusC, 'glyphicon-chevron-right': !statusC}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              To change edit the TOC(s), modify the text field(s) below.    
            </div>
            <div class="row" ng-repeat="toc in eduMat.tocs" style="margin-bottom:7px; border-bottom:1px solid #ddd;">
              <h2 style="margin:0 0 7px 0; padding:0 15px; font-size:30px;">Order: {{toc.order}}
              <span style="float:right; cursor:pointer;" ng-click="removeTOC(toc.order)"><span class="glyphicon glyphicon-remove"></span></span>
              </h2>
              <div class="col-md-6">
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">Title EN</span>
                  <input class="form-control" type="text" ng-model="toc.name_EN" ng-change="setChangesMade()" placeholder="English Title" required="required">
                </div>
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">URL EN</span>
                  <input class="form-control" type="text" ng-model="toc.url_EN" ng-change="setChangesMade()" placeholder="English URL" required="required">
                </div>
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">Type EN</span>
                  <input class="form-control" type="text" ng-model="toc.type_EN" ng-change="setChangesMade()" typeahead-on-select="setChangesMade()" uib-typeahead="type for type in EduMatTypes_EN | filter:$viewValue" typeahead-min-length="0" placeholder="English Type" required="required"> 
                </div>
              </div>  
              <div class="col-md-6">           
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">Titre FR</span>
                  <input class="form-control" type="text" ng-model="toc.name_FR" ng-change="setChangesMade()" placeholder="Titre Français" required="required">
                </div>
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">URL FR</span>
                  <input class="form-control" type="text" ng-model="toc.url_FR" ng-change="setChangesMade()" placeholder="URL Français" required="required">
                </div>
                <div class="input-group" style="margin-bottom: 7px;">
                  <span class="input-group-addon">Type FR</span>
                  <input class="form-control" type="text" ng-model="toc.type_FR" ng-change="setChangesMade()" typeahead-on-select="setChangesMade()" uib-typeahead="type for type in EduMatTypes_FR | filter:$viewValue" typeahead-min-length="0" placeholder="Type Francais" required="required"> 
                 </div>
              </div>
            </div>
            <div class="table-buttons">
              <button class="btn btn-primary" ng-click="addTOC()">Add another TOC</button>
            </div>
          </uib-accordion-group>  
          <uib-accordion-group is-open="statusH.open">
            <uib-accordion-heading>
              <div>
                Supporting PDF Document<i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusH.open, 'glyphicon-chevron-right': !statusH.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Supporting Educational Material URLs (EN / FR): {{eduMat.share_url_EN}} / {{eduMat.share_url_FR}}</h4>
              To change the current URL(s), enter the new URL(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="eduMat.share_url_EN" ng-change="setChangesMade()" placeholder="English URL" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="eduMat.share_url_FR" ng-change="setChangesMade()" placeholder="URL Français" required="required">
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
	$(".global-nav li.nav-edu-mat").addClass("active");
    </script>




