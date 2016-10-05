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
                    <li class="list-group-item" ng-show="newEduMat.name_EN || newEduMat.name_FR">
                      <strong>Titles:</strong> EN: {{newEduMat.name_EN}} | FR: {{newEduMat.name_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newEduMat.url_EN || newEduMat.url_FR">
                      <strong>URLs:</strong> EN: {{newEduMat.url_EN}} | FR: {{newEduMat.url_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newEduMat.type_EN || newEduMat.type_FR">
                      <strong>Type:</strong> EN: {{newEduMat.type_EN}} | FR: {{newEduMat.type_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newEduMat.phase_in_tx">
                      <strong>Phase In TX:</strong> {{newEduMat.phase_in_tx.name_EN}} / {{newEduMat.phase_in_tx.name_FR}}
                    </li>
                    <li class="list-group-item" ng-show="newEduMat.tocs.length">
                      <strong>Table of contents:</strong>
                      <p style="margin-top: 5px;">
                        <ul style="max-height: 100px; overflow-y: auto;">
                          <li ng-repeat="toc in newEduMat.tocs">
                            EN: {{toc.name_EN}} | FR: {{toc.name_FR}}
                          </li>
                        </ul> 
                      </p>
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
                    <form ng-submit="submitEduMat()" method="post">
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
                  <span style="font-size: 40px; line-height: 35px;">Educational Material</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-9 form-box-right animated" ng-show="formLoaded">
            <div class="panel-container" style="text-align: left">
              <uib-accordion close-others="true">                
                <uib-accordion-group ng-class="(newEduMat.name_EN && newEduMat.name_FR) ? 'panel-success': 'panel-danger'" is-open="true">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign EN/FR titles</strong>
                      <span ng-hide="newEduMat.name_EN && newEduMat.name_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newEduMat.name_EN && newEduMat.name_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newEduMat.name_EN" ng-change="titleUpdate()" placeholder="English Title" required="required">
                        </div>
                      </div>    
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newEduMat.name_FR" ng-change="titleUpdate()" placeholder="Titre Français" required="required">
                        </div>
                      </div> 
                    </div>
                  </div>  
                </uib-accordion-group>        
                <uib-accordion-group ng-class="(newEduMat.url_EN && newEduMat.url_FR && !newEduMat.tocs.length) ? 'panel-success': 'panel-danger'" is-open="statusC" ng-show="!newEduMat.tocs.length">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign EN/FR URL</strong>
                      <span ng-hide="newEduMat.url_EN && newEduMat.url_FR && !newEduMat.tocs.length" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newEduMat.url_EN && newEduMat.url_FR && !newEduMat.tocs.length" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newEduMat.url_EN" ng-change="urlUpdate()" placeholder="English URL" required="required">
                        </div>
                      </div>    
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newEduMat.url_FR" ng-change="urlUpdate()" placeholder="URL Français" required="required">
                        </div>
                      </div> 
                    </div>
                  </div>  
                </uib-accordion-group>  
                <uib-accordion-group ng-class="(newEduMat.type_EN && newEduMat.type_FR) ? 'panel-success': 'panel-danger'" is-open="statusE">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign EN/FR Type</strong>
                      <span ng-hide="newEduMat.type_EN && newEduMat.type_FR" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newEduMat.type_EN && newEduMat.type_FR" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newEduMat.type_EN" ng-change="typeUpdate()" typeahead-on-select="typeUpdate()" uib-typeahead="type for type in EduMatTypes_EN | filter:$viewValue" typeahead-min-length="0" placeholder="English Type" required="required"> 
                        </div>
                      </div>     
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newEduMat.type_FR" ng-change="typeUpdate()" typeahead-on-select="typeUpdate()" uib-typeahead="type for type in EduMatTypes_FR | filter:$viewValue" typeahead-min-length="0" placeholder="Type Francais" required="required"> 
                        </div>
                      </div>     
                    </div>
                  </div>
                </uib-accordion-group> 
                <uib-accordion-group ng-class="(newEduMat.phase_in_tx) ? 'panel-success': 'panel-danger'" is-open="statusF">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Assign a phase in treatment</strong>
                      <span ng-hide="newEduMat.phase_in_tx" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="newEduMat.phase_in_tx" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">
                    <div class="row">
                      <div class="col-md-6">
                        <ul class="no-list">
                          <li ng-repeat="phase in phaseInTxs">
                            <label>
                              <input type="radio" ng-model="newEduMat.phase_in_tx" ng-change="phaseUpdate()" ng-value="phase"> {{phase.name_EN}} / {{phase.name_FR}}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </uib-accordion-group>
                <uib-accordion-group ng-class="(tocsComplete) ? 'panel-success': 'panel-danger'" is-open="statusG" ng-hide="newEduMat.url_EN || newEduMat.url_FR">              
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>Table of contents</strong>
                      <span ng-hide="tocsComplete" style="float:right"><em>Incomplete</em></span>
                      <span ng-show="tocsComplete" style="float:right"><em>Complete</em></span>
                    </h2>
                  </uib-accordion-heading> 
                  <div class="panel-input">
                    <div class="row" ng-repeat="toc in newEduMat.tocs" style="margin-bottom: 7px; border-bottom: 1px solid #ddd">
                      <h2 style="margin:0 0 7px 0; padding: 0 15px; font-size:30px;">Order: {{toc.order}}
                        <span style="float:right; cursor:pointer;" ng-click="removeTOC(toc.order)"><span class="glyphicon glyphicon-remove"></span></span>
                      </h2>
                      <div class="col-md-6">           
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">Title EN</span>
                          <input class="form-control" type="text" ng-change="tocUpdate()" ng-model="toc.name_EN" placeholder="English Title" required="required">
                        </div>
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">URL EN</span>
                          <input class="form-control" type="text" ng-change="tocUpdate()" ng-model="toc.url_EN" placeholder="English URL" required="required">
                        </div>
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">Type EN</span>
                          <input class="form-control" type="text" ng-model="toc.type_EN" ng-change="tocUpdate()" typeahead-on-select="tocUpdate()" uib-typeahead="type for type in EduMatTypes_EN | filter:$viewValue" typeahead-min-length="0" placeholder="English Type" required="required"> 
                        </div>
                      </div>  
                      <div class="col-md-6">           
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">Titre FR</span>
                          <input class="form-control" type="text" ng-change="tocUpdate()" ng-model="toc.name_FR" placeholder="Titre Français" required="required">
                        </div>
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">URL FR</span>
                          <input class="form-control" type="text" ng-change="tocUpdate()" ng-model="toc.url_FR" placeholder="URL Français" required="required">
                        </div>
                        <div class="input-group" style="margin-bottom: 7px;">
                          <span class="input-group-addon">Type FR</span>
                          <input class="form-control" type="text" ng-model="toc.type_FR" ng-change="tocUpdate()" typeahead-on-select="tocUpdate()" uib-typeahead="type for type in EduMatTypes_FR | filter:$viewValue" typeahead-min-length="0" placeholder="Type Francais" required="required"> 
                        </div>
                      </div>
                      <hr>
                    </div>
                    <div class="table-buttons">
                      <button class="btn btn-primary" ng-click="addTOC()">Add another TOC</button>
                    </div>
                  </div>  
                </uib-accordion-group>   
                <uib-accordion-group ng-class="panel-warning" is-open="statusL">
                  <uib-accordion-heading>
                    <h2 class="panel-title"><strong>EN/FR Supporting PDF</strong>
                      <span style="float:right"><em>Optional</em></span>
                    </h2>
                  </uib-accordion-heading>
                  <div class="panel-input">  
                    <div class="row">
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">EN</span>
                          <input class="form-control" type="text" ng-model="newEduMat.share_url_EN" placeholder="English URL" required="required">
                        </div>
                      </div>    
                      <div class="col-md-6">
                        <div class="input-group">
                          <span class="input-group-addon">FR</span>
                          <input class="form-control" type="text" ng-model="newEduMat.share_url_FR" placeholder="URL Français" required="required">
                        </div>
                      </div> 
                    </div>
                  </div>  
                </uib-accordion-group>  
                <uib-accordion-group ng-class="panel-warning" is-open="statusH">
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
                <uib-accordion-group ng-class="panel-warning" is-open="statusI">
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
                <uib-accordion-group ng-class="panel-warning" is-open="statusJ">
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
                <uib-accordion-group ng-class="panel-warning" is-open="statusK">
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
	$(".global-nav li.nav-new-edu-mat").addClass("active");
    </script>


