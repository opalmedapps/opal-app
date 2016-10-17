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
            <div class="panel-container animated" ng-class="{pulse: hoverA}" ng-mouseenter="hoverA=true" ng-mouseleave="hoverA=false" style="cursor:pointer;" ng-click="goToAddHospitalMap()">
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
                      Hospital Maps
                    </h2>
                  </div>
                </div>  
                <div class="panel-input">
                  <div class="clearfix">
                    <div style="margin-bottom: 10px;">
                      <div class="input-group">
                        <input type="text" class="form-control" ng-model="filterValue" ng-change="filterHosMap(filterValue)" placeholder="Search...">
                        <span class="input-group-addon">
                          <span class="glyphicon glyphicon-search"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="data-table">
                    <div class="gridStyle" ui-grid="gridOptions" ui-grid-resize-columns style="height:520px"></div>
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
  <script type="text/ng-template" id="deleteHosMapModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-trash" style="font-size: 30px;"></span> 
          Delete Hospital Map: {{hosMapToDelete.name_EN}} / {{hosMapToDelete.name_FR}}
        </h2>
      </div>
      <div class="modal-body">
        <div class="bs-callout bs-callout-danger">
          <h4>Hospital Map Delete</h4>
          <p class="deleteText">Are you sure you want to delete the Hospital Map "{{hosMapToDelete.name_EN}}" ?</p>
          <form method="post" ng-submit="deleteHospitalMap()">			
            <input class="btn btn-primary" type="submit" value="Delete">
            <input ng-click="cancel()" class="btn btn-danger" type="button" value="Cancel">
          </form>
        </div>
      </div>
    </script>
    <script type="text/ng-template" id="editHosMapModalContent.htm">
      <div class="modal-header">
        <h2 class="modal-title">
          <span class="glyphicon glyphicon-pencil" style="font-size: 30px;"></span> 
          Edit Hospital Map: {{hosMap.name_EN}} / {{hosMap.name_FR}}
          <span style="float:right;"> 
            <form method="post" ng-submit="updateHosMap()">
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
              <h4>Current Hospital Map Titles (EN / FR): {{hosMap.name_EN}} / {{hosMap.name_FR}}</h4>
              To change the current title(s), enter the new title(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">EN</span>
                  <input class="form-control" type="text" ng-model="hosMap.name_EN" ng-change="setChangesMade()" placeholder="English Title" required="required">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <span class="input-group-addon">FR</span>
                  <input class="form-control" type="text" ng-model="hosMap.name_FR" ng-change="setChangesMade()" placeholder="Titre Français" required="required">
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusB.open">
            <uib-accordion-heading>
              <div>
                Descriptions <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusB.open, 'glyphicon-chevron-right': !statusB.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info" style="word-wrap:break-word">
              <h4>Current Hospital Descriptions (EN / FR): {{hosMap.description_EN}} / {{hosMap.description_FR}}</h4>
              To change the current description(s), enter the new description(s) in the text area(s) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="form-group">
                  <textarea class="form-control" rows="10" ng-model="hosMap.description_EN" ng-change="setChangesMade()" placeholder="English Description" required="required"></textarea>
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="form-group">
                  <textarea class="form-control" rows="10" ng-model="hosMap.description_FR" ng-change="setChangesMade()" placeholder="Description Français" required="required"></textarea>
                </div>
              </div>
            </div>
          </uib-accordion-group>
          <uib-accordion-group is-open="statusC.open">
            <uib-accordion-heading>
              <div>
                QR Identifier / Map URL <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': statusC.open, 'glyphicon-chevron-right': !statusC.open}"></i>
              </div>
            </uib-accordion-heading>
            <div class="bs-callout bs-callout-info" style="word-wrap:break-word">
              <h4>QR Identifier -- {{hosMap.qrid}} <br> Map URL -- {{hosMap.url}}</h4>
              To change the current detail(s), enter the new detail(s) in the text box(es) below.
            </div>
            <div class="row">
              <div class="col-md-5">
                <div class="input-group">
                  <input class="form-control" type="text" ng-model="hosMap.qrid" ng-change="setChangesMade()" placeholder="QR Identifier" required="required">
                  <span class="input-group-btn">
                    <button class="btn btn-default" type="button" ng-click="generateQRCode(hosMap.qrid)">Generate QR</button>
                  </span>
                </div>
                <div ng-show="hosMap.qrcode" style="text-align:center">
                  <img ng-src="{{hosMap.qrcode}}" style="width:200px;height:200px;">
                </div>
              </div>
              <div class="col-md-1"></div>
              <div class="col-md-5">
                <div class="input-group">
                  <input class="form-control" type="text" ng-model="hosMap.url" ng-change="setChangesMade()" placeholder="Map URL" required="required">
                  <span class="input-group-btn">
                    <button class="btn btn-default" type="button" ng-click="showMap(hosMap.url)">Show Map</button>
                  </span>
                </div>
                <div ng-show="hosMap.url" style="text-align:center">
                  <img ng-src="{{mapURL}}" style="width:200px;height:200px;">
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

   <script type="text/javascript">
	$(".global-nav li").removeClass("active");
	$(".global-nav li.nav-hospital-map").addClass("active");
    </script>



