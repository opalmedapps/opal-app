          <div ng-controller="sidePanelMenuController">
            <div class="row side-panel-menu">
              <div class="col-md-6" style="padding-right:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverB}" ng-mouseenter="hoverB=true" ng-mouseleave="hoverB=false" style="cursor:pointer;" ng-click="goToHome()">
                  <div class="side-panel-info">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-home" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Home</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6" style="padding-left:4px;">   
                <div class="panel-container animated" ng-class="{pulse: hoverC, active: currentPage == 'alias'}" ng-mouseenter="hoverC=true" ng-mouseleave="hoverC=false" style="cursor:pointer;" ng-click="goToAlias()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'alias'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-cloud" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Aliases</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>  
            <div class="row">
              <div class="col-md-6" style="padding-right:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverD, active: currentPage == 'post'}" ng-mouseenter="hoverD=true" ng-mouseleave="hoverD=false" style="cursor:pointer;" ng-click="goToPost()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'post'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-comment" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Posts</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6" style="padding-left:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverE, active: currentPage == 'educational-material'}" ng-mouseenter="hoverE=true" ng-mouseleave="hoverE=false" style="cursor:pointer;" ng-click="goToEducationalMaterial()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'educational-material'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-book" aria-hidden="true"></span><br>
                      <span style="font-size: 20px;">Educational<br> Material</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>    
            <div class="row">
              <div class="col-md-6" style="padding-right:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverF, active: currentPage == 'hospital-map'}" ng-mouseenter="hoverF=true" ng-mouseleave="hoverF=false" style="cursor:pointer;" ng-click="goToHospitalMap()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'hospital-map'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-map-marker" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Hospital Maps</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6" style="padding-left:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverG, active: currentPage == 'notification'}" ng-mouseenter="hoverG=true" ng-mouseleave="hoverG=false" style="cursor:pointer;" ng-click="goToNotification()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'notification'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-bell" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Notifications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>  
            <div class="row">
              <div class="col-md-6" style="padding-right:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverH, active: currentPage == 'patients'}" ng-mouseenter="hoverH=true" ng-mouseleave="hoverH=false" style="cursor:pointer;" ng-click="goToPatient()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'patients'}">
                    <div class="panel-content" style="text-align:center">
                      <span style="font-size: 30px;" class="glyphicon glyphicon-user" aria-hidden="true"></span><br><br>
                      <span style="font-size: 20px;">Patients</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6" style="padding-left:4px;">
                <div class="panel-container animated" ng-class="{pulse: hoverI, active: currentPage == 'test-result'}" ng-mouseenter="hoverI=true" ng-mouseleave="hoverI=false" style="cursor:pointer;" ng-click="goToTestResult()">
                  <div class="side-panel-info" ng-class="{active: currentPage == 'test-result'}">
                    <div class="panel-content" style="text-align:center">
                      <i style="font-size: 30px;" class="fa fa-heartbeat" aria-hidden="true"></i><br><br>
                      <span style="font-size: 20px;">Test Results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 

