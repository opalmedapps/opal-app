angular.module('myApp').controller('LoginController',function($scope,$timeout, UserAuthorizationInfo, LabResults, RequestToServer, FirebaseService)
{
    var email = 'hendren@cs.mcgill.ca';
    var password = '12345';
    var savedEmail = window.localStorage.getItem('email');
    if(savedEmail)
    {
        $scope.email = savedEmail;
    }
    $scope.clearEmail = function()
    {
        $scope.email = '';
    };
    var modal = document.getElementById('modal');
    $scope.login = function(email, password)
    {
        if(!email||!password)
        {
            $scope.error = "Type a proper email or password";
        }
         firebase.auth().signInWithEmailAndPassword(email, password).then(function(auth){
            console.log(auth.uid);
            UserAuthorizationInfo.setUserAuthData(auth.uid, CryptoJS.SHA256(password).toString(), 0,'dasda');
            auth.getToken().then(function(token){
                console.log(token);
                modal.show();
                UserAuthorizationInfo.setToken(token);
                 RequestToServer.sendRequestWithResponse('Refresh',{Fields:'LabTests',Timestamp:0}).then(function(data){
                    console.log(data);
                    LabResults.setTestResults(data.Data.LabTests);
                    modal.hide();
                    navi.pushPage('views/personal/lab-results/lab-results.html');
                }).catch(function(error){
                    console.log(error);
                });
                
            }).catch(function(error){
                console.log(error);
            });

            window.localStorage.setItem('email',email);

        }).catch(function(error) {
            // Handle Errors here.
                console.log('headas');
            
            var errorCode = error.code;
            var errorMessage = error.message;
            $timeout(function()
            {
                 $scope.error = error.message;
            });
           
            console.log(error);

            // ...
        });
    };
   
});

