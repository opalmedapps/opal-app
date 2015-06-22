//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//

angular.module('app')
    .controller('loginController', ['$scope', '$state', 'UserAuthorizationInfo', function ($scope, $state, UserAuthorizationInfo) {
    	
    $state.transitionTo('logIn.enter');

}]);
