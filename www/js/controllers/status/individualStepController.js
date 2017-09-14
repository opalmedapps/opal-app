/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-14
 * Time: 2:53 PM
 */


/**
 * Controls the view for the treatment planning step information.
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStepController', IndividualStepController);

    IndividualStepController.$inject = ['NavigatorParameters', 'UserPreferences','$filter', 'Logger'];

    function IndividualStepController(NavigatorParameters, UserPreferences, $filter, Logger) {

        var stepVM = this;
        var nav = NavigatorParameters.getNavigator();

        stepVM.showTab = true;
        stepVM.about = about;
        stepVM.stage = {};

        activate();

        function activate() {
            stepVM.stage = NavigatorParameters.getParameters().Post;
            stepVM.name = NavigatorParameters.getParameters().StepName;
            Logger.sendLog('Treatment Plan', stepVM.stage);

        }

        //Links to the about page controlled by the contentController
        function about() {
            nav.pushPage('./views/templates/content.html', {
                contentLink: stepVM.stage ? stepVM.stage["URL_"+UserPreferences.getLanguage()] : '',
                contentType: $filter('translate')(stepVM.name)
            });
        }

    }

})();
