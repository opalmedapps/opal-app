(function(){
    var myApp = angular.module('MUHCApp')
    .controller("<controller-name>",<controller-name>);
    <controller-name>.$inject = [];   
    function <controller-name>()
    {
        var vm = this;
        vm.title = '<controller-name>';
        vm.list = [
                {"Title":"Opal Module 1"},
                {"Title":"Opal Module 2"},
                {"Title":"Opal Module 3"},
                {"Title":"Opal Module 4"},
                {"Title":"Opal Module 5"},
                {"Title":"Opal Module 6"}
        ];
        vm.noList=false;
    }
})();