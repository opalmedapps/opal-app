var sqlInterface=require('./sqlInterface.js');
var q=require('q');
var exports=module.exports={};

exports.securityQuestion=function(requestKey,requestObject) {

    var r = q.defer();
    sqlInterface.updateDeviceIdentifier(requestObject)
        .then(function () {
            return sqlInterface.getSecurityQuestion(requestObject)
        })
        .then(function (response) {
            console.log(response);
            r.resolve({
                Code:3,
                Data:response.Data,
                Headers:{RequestKey:requestKey,RequestObject:requestObject},
                Response:'success'
            });

        })
        .catch(function (response){

            r.resolve({
                Headers:{RequestKey:requestKey,RequestObject:requestObject},
                Code: 2,
                Data:{},
                Response:'error',
                Reason:response
            });

        });
    return r.promise;

};