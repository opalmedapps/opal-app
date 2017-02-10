var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
if (app){
    document.addEventListener("deviceready", function() {
        angular.bootstrap(document, ["MUHCApp"]);
    }, false);
}
else {
    $('document').ready(function(){
        angular.bootstrap(document, ["MUHCApp"]);
    })
}

function handleOpenURL(url) {
    setTimeout(function() {
        initNavigator.pushPage("./views/login/security-question.html", {url: url});
    }, 0);
}