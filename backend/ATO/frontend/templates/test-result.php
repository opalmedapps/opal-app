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
            <div class="panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goToAddTestResult()">
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
                      Test Results
                    </h2>
                  </div>
                </div>  
                <div class="panel-input">
                  <div class="clearfix">
                    <div style="margin-bottom: 10px;">
                      <div class="input-group">
                        <input type="text" class="form-control" ng-model="filterValue" ng-change="filterTestResult(filterValue)" placeholder="Search...">
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
  <script type="text/ng-template" id="deleteTestResultModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-trash" style="font-size: 30px;"></span> 
          Delete Test Result: {{testResultToDelete.name_EN}} / {{testResultToDelete.name_FR}}
        </h2>
      </div>
      <div class="modal-body">
        <div class="bs-callout bs-callout-danger">
          <h4>Test Result Delete</h4>
          <p class="deleteText">Are you sure you want to delete the Test Result "{{testResultToDelete.name_EN}}" ?</p>
          <form method="post" ng-submit="deleteTestResult()">			
            <input class="btn btn-primary" type="submit" value="Delete">
            <input ng-click="cancel()" class="btn btn-danger" type="button" value="Cancel">
          </form>
        </div>
      </div>
    </script>
    <script type="text/ng-template" id="editTestResultModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-pencil" style="font-size: 30px;"></span> 
          Edit Test Result: {{testResult.name_EN}} / {{testResult.name_FR}}
          <span style="float:right;"> 
            <form method="post" ng-submit="updateTestResult()">
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
                Assigned Tests <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusA.open, 'glyphicon-chevron-right': !statusA.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Currently assigned tests</h4>
              <ul class="list-items-4col">
                <li ng-repeat="selectedTest in testList | filter: {added: 1} : 1">
                  {{selectedTest.name}}
                </li>
              </ul>
              <p>To add/remove tests, use the list below.</p>
            </div>
            <div class="list-space">
              <div class="input-group">
                <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                <input class="form-control" type="text" ng-model="testFilter" ng-change="changeTestFilter(testFilter)" placeholder="Search Tests..."/>
              </div>
              <ul class="list-items">
                <li ng-repeat="test in testList | filter: searchTestsFilter">
                  <label>
                    <input type="checkbox" ng-click="toggleTestSelection(test)" ng-checked="test.added" /> {{test.name}}
                  </label>
                </li>
              </ul>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusB.open">
            <uib-accordion-heading>
 <div>
                Titles <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusB.open, 'glyphicon-chevron-right': !statusB.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Test Result Titles (EN / FR): {{testResult.name_EN}} / {{testResult.name_FR}}</h4>
              To change the current title(s), enter the new title(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="testResult.name_EN" ng-change="setChangesMade()" placeholder="English Title" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="testResult.name_FR" ng-change="setChangesMade()" placeholder="Titre Français" required="required">
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusC.open">
            <uib-accordion-heading>
              <div>
                Descriptions <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusC.open, 'glyphicon-chevron-right': !statusC.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Test Result Descriptions (EN / FR): {{testResult.description_EN}} / {{testResult.description_FR}}</h4>
              To change the current description(s), enter the new description(s) in the text area(s) below.
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <textarea class="form-control" rows="10" ng-model="testResult.description_EN" ng-change="descriptionUpdate()" placeholder="English Description" required="required"></textarea>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <textarea class="form-control" rows="10" ng-model="testResult.description_FR" ng-change="descriptionUpdate()" placeholder="Description Francais" required="required"></textarea>
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusD.open">
            <uib-accordion-heading>
              <div>
                Test Group <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusD.open, 'glyphicon-chevron-right': !statusD.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info">
              <h4>Current Test Groups (EN / FR): {{testResult.group_EN}} / {{testResult.group_FR}}</h4>
              To change the current group(s), enter the new group(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="testResult.group_EN" ng-change="setChangesMade()" typeahead-on-select="setChangesMade()" uib-typeahead="group for group in TestResultGroups_EN | filter:$viewValue" typeahead-min-length="0" placeholder="English" required="required"> 
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="testResult.group_FR" ng-change="setChangesMade()" typeahead-on-select="setChangesMade()" uib-typeahead="group for group in TestResultGroups_FR | filter:$viewValue" typeahead-min-length="0" placeholder="Francais" required="required"> 
                </div>
              </div>
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


