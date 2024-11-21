import "../../css/directives/loading-spinning-circle.directive.css";

angular.module('OpalApp').directive("loadingSpinningCircle", LoadingSpinningCircle);

/**
 * This directive offers a spinning loader with a default loading message
 * <pre>
 *  <loading-spinning-circle loading-text="Labs loading..."></loading-spinning-circle>
 * </pre>
 */
function LoadingSpinningCircle() {
    return {
        restrict: 'E',
        scope: {
            "loadingMessage": "@",
            // Optional parameter that overrides the default margin-top of 25vh. Example usage: "15vh".
            "margintop": "@?",
            // Optional parameter. If set to true, makes the loading wheel float over and mask the page body (header/tab-bar excluded).
            // Can be useful to hide the page contents without losing the user's scroll position.
            "maskPage": "<?",
        },
        replace: false,
        transclude: false,
        template: `
            <div align="center" ng-class="{'loading-wheel-float': maskPage}">
                <svg class="progress-circular" style="margin-top:25vh" ng-style="margintop && {'margin-top': '{{margintop}}'}">
                    <circle class="progress-circular__primary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%"
                            stroke-miterlimit="10"/>
                </svg>
                <p style="margin-top: 30px" ng-class="fontSizeDesc">{{ loadingMessage }}</p>
            </div>
        `,
    };
}
