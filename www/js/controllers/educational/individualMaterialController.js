/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:08 PM
 */

myApp.controller('IndividualEducationalMaterialController', ['$scope', '$timeout', 'NavigatorParameters',
    'UserPreferences', 'EducationalMaterial',
    'FileManagerService','$cordovaNetwork','$filter', 'Logger',
    function ($scope, $timeout, NavigatorParameters, UserPreferences, EducationalMaterial,
              FileManagerService,$cordovaNetwork,$filter, Logger) {
        /**
         * Getting Parameters from navigation
         */
        var param = NavigatorParameters.getParameters();
        var navigatorPage = param.Navigator;

        //set educational material language
        $scope.edumaterial =EducationalMaterial.setLanguageEduationalMaterial(param.Post);
        Logger.sendLog('Educational Material', param.Post.EducationalMaterialSerNum);

        //Determine if material has a ShareURL and is printable
        if($scope.edumaterial.hasOwnProperty('ShareURL')&&$scope.edumaterial.ShareURL !=="") {
            $scope.isPrintable = FileManagerService.isPDFDocument($scope.edumaterial.ShareURL);
        }

        //Determine if material is a booklet
        var isBooklet = $scope.edumaterial.hasOwnProperty('TableContents');

        //Determine if material is an app
        var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

        //If its a booklet, translate table of contents
        if (isBooklet) {
            $scope.tableOfContents = $scope.edumaterial.TableContents;
            $scope.tableOfContents = EducationalMaterial.setLanguageEduationalMaterial($scope.tableOfContents);
        }

        //Determining if its an individual php page to show immediately.
        $scope.isIndividualHtmlPage = (FileManagerService.getFileType($scope.edumaterial.URL_EN) === 'php');
        if($scope.isIndividualHtmlPage) downloadIndividualPage();

        //Function to go to a specific educational material.
        $scope.goToEducationalMaterial = function (index) {
            var nextStatus = EducationalMaterial.openEducationalMaterialDetails($scope.edumaterial);
            if (nextStatus !== -1) {
                //
                NavigatorParameters.setParameters({ 'Navigator': navigatorPage, 'Index': index, 'Booklet': $scope.edumaterial, 'TableOfContents': $scope.tableOfContents });
                window[navigatorPage].pushPage(nextStatus.Url);
            }
        };

        //Instantiating popover controller
        $timeout(function () {
            ons.createPopover('./views/education/popover-material-options.html',{parentScope: $scope}).then(function (popover) {
                $scope.popoverSharing = popover;
            });
        }, 300);

        //On destroy clean up
        $scope.$on('$destroy', function () {
            //
            $scope.popoverSharing.destroy();
        });

        //Function to share material, if shareable
        $scope.share = function () {
            FileManagerService.shareDocument($scope.edumaterial.Name, $scope.edumaterial.ShareURL);
            $scope.popoverSharing.hide();
        };

        //If material is printable, i.e. is a pdf, download material and print it.
        $scope.print = function()
        {
            //If no connection then simply alert the user to connect to the internet
            $scope.popoverSharing.hide();
            if(app&&$cordovaNetwork.isOnline())
            {

                //Get material from server
                var xhr = new XMLHttpRequest();
                xhr.open('GET',  $scope.edumaterial.ShareURL, true);
                xhr.responseType = 'blob';
                //If successful, convert to base64 and print
                xhr.onload = function() {
                    if (this.status === 200) {

                        var blob = new Blob([this.response], { type: 'application/pdf' });
                        var fileReader = new FileReader();
                        fileReader.readAsDataURL(blob);
                        fileReader.onloadend = function() {
                            base64data = fileReader.result;
                            base64data = base64data.replace('data:application/pdf;base64,','');
                            window.plugins.PrintPDF.print({
                                data: base64data,
                                type: 'Data',
                                title: $filter('translate')("PRINTDOCUMENT"),
                                success: function(){

                                },
                                error: function(data){
                                    data = JSON.parse(data);

                                }
                            });

                        }
                    }else{
                        //If unable to obtain, alert the user.
                        ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
                    }
                };
                xhr.send();
            }else{
                $scope.popoverSharing.hide();
                ons.notification.alert({'message':$filter('translate')("PRINTINGUNAVAILABLE")});
            }

        };
        //Function to download educational material
        function downloadIndividualPage()
        {
            if(!$scope.edumaterial.hasOwnProperty('Content'))
            {
                $.get($scope.edumaterial.Url, function (res) {
                    $timeout(function () {
                        //Sets content variable for material and hides loading
                        $scope.edumaterial.Content = res;
                    });
                });
            }

        }

    }]);