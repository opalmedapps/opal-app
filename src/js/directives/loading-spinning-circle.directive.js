angular.module("MUHCApp").directive("loadingSpinningCircle", LoadingSpinningCircle);

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
		},
		replace: false,
		transclude: false,
		template: `
            <div align="center">
                <svg class="progress-circular"  style="margin-top:25vh">
                    <circle class="progress-circular__primary" cx="50%" cy="50%" r="40%" fill="none" stroke-width="10%"
                            stroke-miterlimit="10"/>
                </svg>
                <p style="margin-top: 30px" ng-class="fontSizeDesc">{{ loadingMessage }}</p>
            </div>                      
            `,

	};
}
