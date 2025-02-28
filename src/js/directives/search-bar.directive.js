// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').directive("searchBar", SearchBar);

/**
 * This directive offers a search bar with appropriate spacing.
 * <pre>
 *  <search-bar search-text="tests.searchText" placeholder="{{'SEARCH'|translate}}" style-class="fontSizeDesc">
 *  </search-bar>
 * </pre>
 */
function SearchBar() {
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
				<div class="navigation-bar__center" style="display:block">
					<input ng-model="searchText" type="search" class="search-input" ng-class="styleClass"
						style="width: 96%; margin: 6px auto 6px auto;" placeholder="{{placeholder}}">
				</div>
			</div>`,

	};
}
