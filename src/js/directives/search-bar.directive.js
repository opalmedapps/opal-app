angular.module("MUHCApp").directive("searchBar", SearchBar);

SearchBar.$inject = ['Constants'];

/**
 * This directive offers a search bar with appropriate spacing.
 * <pre>
 *  <search-bar search-text="tests.searchText" placeholder="{{'SEARCH'|translate}}" style-class="fontSizeDesc">
 *  </search-bar>
 * </pre>
 */
function SearchBar(Constants) {
	return {
		restrict: 'E',
		scope: {
			"searchText": "=",
			"placeholder": "@",
			"styleClass": "=",
		},
		replace: false,
		transclude: false,
		template:
			`<div class="navigation-bar" >
				<form class="navigation-bar__center" style="display:block" novalidate>
					<input ng-model="searchText" type="search" class="search-input" ng-class="styleClass"
						style="width: 96%; margin: 6px auto 6px auto;" placeholder="{{placeholder}}">
					<!-- Invisible button that automatically closes the keyboard when submitting the search -->
					<button ng-click="closeKeyboard()" style="display:none"></button>
				</form>
			</div>`,

		link: function (scope) {
			scope.closeKeyboard = () => { if (Constants.app) Keyboard.hide() };
		}
	};
}
