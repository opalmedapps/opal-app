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
                    <li class="list-group-item" ng-show="checkTestsAdded(testList)">
                      <strong>Test(s):</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-repeat="test in testList | filter: {added: 1} : 1">
                            {{test.name}} 
                          </li>
                        </ul>
                      </p>       
                    </li>
                    <li class="list-group-item" ng-show="newTestResult.name_EN || newTestResult.name_FR">
                      <strong>Titles:</strong> EN: {{newTestResult.name_EN}} | FR: {{newTestResult.name_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newTestResult.description_EN || newTestResult.description_FR">
                      <strong>Descriptions:</strong> EN: {{newTestResult.description_EN}} | FR: {{newTestResult.description_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newTestResult.group_EN || newTestResult.group_FR">
                      <strong>Test Groups:</strong> {{newTestResult.group_EN}} | FR: {{newTestResult.group_FR}}
                    </li>
                  </ul>
                  <div ng-hide="toggleAlertText()" class="table-buttons" style="text-align: center">
                    <form ng-submit="submitTestResult()" method="post">
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
                  <br>
                  <span style="font-size: 40px; line-height: 35px;">Test Results</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-9 form-box-right animated" ng-show="formLoaded">
            <div class="panel-container" style="text-align: left">
              <uib-accordion close-others="true">        
                <uib-accordion-group ng-class="checkTestsAdded(testList) ? 'panel-success': 'panel-danger'" is-open="true">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign Tests</strong>
                      <span ng-hide="checkTestsAdded(testList)" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="checkTestsAdded(testList)" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="list-space">
                      <div class="input-group">
                        <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                        <input class="form-control" type="text" ng-model="testFilter" ng-change="changeTestFilter(testFilter)" placeholder="Search Tests"/>
                      </div>
                      <ul class="list-items">
                        <li ng-repeat="test in testList | filter: searchTestsFilter">
                          <label>
                            <input type="checkbox" ng-click="toggleTestSelection(test)" ng-checked="test.added" /> {{test.name}}
                          </label>
                        </li>
                      </ul>
                    </div>
                  </div>
                </uib-accordion-group>     
                <uib-accordion-group ng-class="(newTestResult.name_EN && newTestResult.name_FR) ? 'panel-success': 'panel-danger'" is-open="statusB">
                  <uib-accordion-heading> 
                    <h2 class="panel-title"><strong>Assign EN/FR titles</strong>
                      <span ng-hide="newTestResult.name_EN && newTestResult.name_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newTestResult.name_EN && newTestResult.name_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newTestResult.name_EN" ng-change="titleUpdate()" placeholder="English Title" required="required">
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newTestResult.name_FR" ng-change="titleUpdate()" placeholder="Titre Français" required="required">
                        </div>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>
                <uib-accordion-group ng-class="(newTestResult.description_EN && newTestResult.description_FR) ? 'panel-success': 'panel-danger'" is-open="statusC">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign EN/FR descriptions</strong>
                      <span ng-hide="newTestResult.description_EN && newTestResult.description_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newTestResult.description_EN && newTestResult.description_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="form-group">
                          <textarea class="form-control" rows="5" ng-model="newTestResult.description_EN" ng-change="descriptionUpdate()" placeholder="English Description" required="required"></textarea>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <textarea class="form-control" rows="5" ng-model="newTestResult.description_FR" ng-change="descriptionUpdate()" placeholder="Description Français" required="required"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>
                <uib-accordion-group ng-class="(newTestResult.group_EN && newTestResult.group_FR) ? 'panel-success': 'panel-danger'" is-open="statusD">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign EN/FR Test Group</strong>
                      <span ng-hide="newTestResult.group_EN && newTestResult.group_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newTestResult.group_EN && newTestResult.group_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newTestResult.group_EN" ng-change="groupUpdate()" typeahead-on-select="groupUpdate()" uib-typeahead="group for group in TestResultGroups_EN | filter:$viewValue" typeahead-min-length="0" placeholder="English" required="required"> 
                        </div>
                      </div>     
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newTestResult.group_FR" ng-change="groupUpdate()" typeahead-on-select="groupUpdate()" uib-typeahead="group for group in TestResultGroups_FR | filter:$viewValue" typeahead-min-length="0" placeholder="Francais" required="required"> 
                        </div>
                      </div>     
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

