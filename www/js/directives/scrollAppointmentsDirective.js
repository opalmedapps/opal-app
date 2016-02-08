angular.module('MUHCApp').directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
             if (this.pageYOffset < 100) {
                console.log('true');
                 scope.showCalendarButton = true;
             } else {
               console.log('false');
                 scope.showCalendarButton = false;
             }
            scope.$apply();
        });
    };
});
