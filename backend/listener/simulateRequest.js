const admin            	=   	require("firebase-admin");
const config            =       require('./config.json');
// Initialize firebase connection
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://opal-prod.firebaseio.com"
});
var db = admin.database();
var ref = db.ref("/dev3/requests");
var request = {"Request":"SecurityQuestion","DeviceId":"9c1640db02001e0c40510320-2915e0870b80-42609d0310-507205805f0-721340bb00760c00ac0870c90d00b20a30","Token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3N2I2ZWVjZmI3MGNjOWQwOWYyNGNkY2QzYWI3MzNiNDRhNmNjZGYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb3BhbC1wcm9kIiwiYXVkIjoib3BhbC1wcm9kIiwiYXV0aF90aW1lIjoxNTA5NzI0OTE5LCJ1c2VyX2lkIjoiQjJrWXNTZXBNTmNLbjVkUjRBeHNrYUhmeVMwMiIsInN1YiI6IkIya1lzU2VwTU5jS241ZFI0QXhza2FIZnlTMDIiLCJpYXQiOjE1MDk3MjQ5MTksImV4cCI6MTUwOTcyODUxOSwiZW1haWwiOiJtdWhjLmFwcC5tb2JpbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.K-yie_Y9N2BB4pLfKSVj-_DreyyD5JlbIB7oYJhFsLKX-EPsFfOOtYfUrvvIPFxmfhzE-OdqfuI0O4aAtmsjHU9-jASwJIJLfHMYZY9DLnbuBAtQRkvP1fTY4yJqngtdJgTT9cOlfWyX9G3HJZqTkDIq1mrigrn9fRR75xAu_GK_EworTsbODX7NEzowb4kC_2UZY3ZBbIjTNkV9wRAleBm7KA481CdQV7W4lE7cEvxCK3aKCkJBQkPPjpSYORYw7UuZ8D66-mSPb4Wr4JEdm1iA4vwKL7aD_7yw4Jlhd5dGFwCrewFETT6_LQNUcn7hj3IVvdZFR5nuZWyTat2Pqg","UserID":"B2kYsSepMNcKn5dR4AxskaHfyS02","Parameters":{"registrationId":"5/AeP2hxGN9SnPVhS0MuVsNESXAEowZWo20X+zBuHTN6zXCWhVaFuw==","deviceUUID":"5/AeP2hxGN9SnPVhS0MuVsNESXAEowZWX3kSI9t7AYO1PXwRvoMoN8VPzoZneFHKzg==","deviceType":"5/AeP2hxGN9SnPVhS0MuVsNESXAEowZW2lunw7QbUxznHQwMJIljoNJTxZRydE0=","Password":"5/AeP2hxGN9SnPVhS0MuVsNESXAEowZWlr3+JmrVYZZf5F3DtFGQtoITm9AwKFyby305FgmWPO836Gva2mFd+UEuDiw3zlSWMD2wrn+t/q2pT70Y/9RXt15vNqkydLDl95b+G0DxjV0vQN0TnkKWyYw1I2Ybj0RYEe6+eEA1+2gFl5YIxWwouqOiyCHdAwD4XT4WWBlCMe1eX8o/DMBme6+l0LJ293xd"},"Timestamp":{".sv":"timestamp"},"UserEmail":"muhc.app.mobile@gmail.com"};
//var request2 = {"Request":"VerifyAnswer","DeviceId":"491980d00c10c407d0430ee0-cf1b5070ba0-430140170-380bd0e104b0-941a04501d0bc0120b406305704b0da0770","Token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3N2I2ZWVjZmI3MGNjOWQwOWYyNGNkY2QzYWI3MzNiNDRhNmNjZGYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb3BhbC1wcm9kIiwiYXVkIjoib3BhbC1wcm9kIiwiYXV0aF90aW1lIjoxNTA5NzQxMzM2LCJ1c2VyX2lkIjoiQjJrWXNTZXBNTmNLbjVkUjRBeHNrYUhmeVMwMiIsInN1YiI6IkIya1lzU2VwTU5jS241ZFI0QXhza2FIZnlTMDIiLCJpYXQiOjE1MDk3NDEzMzcsImV4cCI6MTUwOTc0NDkzNywiZW1haWwiOiJtdWhjLmFwcC5tb2JpbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.r04V52lEpyz7QxU8e9PpAOQCLlKX2ZsmzABo3NycICFay3_eWI5bva-imEOPCQ-UkRj87BE25GrIcBeVKROBMi_OWOifxVs7pV8ZGhu1vTsO5YaC-CghI_Z_oqBJL4_nXb-AmCBc_dvF5K8ziYI7O_H0l63N8-MeOR5f9nO5RBlLnNiAnsrjLdomG7VkdFoVjcTp207uX_VgLoVFOD8QUqs8HDF4KWHfY9gnvbAzYH7-24holHMkeSeeSPOC49kye9wEuZ9__ZkDdTJFPgjO7RpUXVU1tRB7rvnmiAASw_igJEyeyrxTo3Glsbp8Oe-tz4f0BC_CoTmGsM_pA17j8g","UserID":"B2kYsSepMNcKn5dR4AxskaHfyS02","Parameters":{"Question":"MvJXCYfya5FE6FOQUK5bhspIYm2PdfHxtI+U50cCxB+BvZl9727hU/IxIoGaonc68+6sAb8dhyRFXLI0ySOC6j7MWba/K17Ao0wfDzU=","Answer":"MvJXCYfya5FE6FOQUK5bhspIYm2PdfHxaZf3PEBfXsmX8h6Aop44C5U6d8WOtyJx46vzAaod0X0ZHvY9yzafsXqKSrK1Px7XsBZGRD6O5gVjpV9EzIhu6zE2XP8B38BVBgdJ85YO9LTwJ/EpMYsU4wheWdJXJOovgNwyJRnm2bIvMlvppmSdQtxZ1YxjU4a+7vLioOmHKEPZZiw6RBWYhhIVmecvQ24n","SSN":"MvJXCYfya5FE6FOQUK5bhspIYm2PdfHxKjIdT+HeUKOBaeB2Xss1W9A3J5DcvHgstw==","Trusted":"MvJXCYfya5FE6FOQUK5bhspIYm2PdfHxZJEeW9XmdMDgCACyzrOmPMM4L4bf","Password":"MvJXCYfya5FE6FOQUK5bhspIYm2PdfHx5IHc6wRExA77VUEKuggatpdrcsaL7HV9svjzUa9HjHgZHKM/nzWat3LYTuPib0mBtxtOGG6MswRg81wQm9M/7GNhXPdUj5EOUldCpMFZ9bLxc/MvMtsVvw1fDYwEJesviNo+JR/r27woY1nr8zXMSN5egtlrVtHpu/ywpr3QfkHZbiQ6RkOS00cXzeB0F20h"},"Timestamp":{".sv":"timestamp"},"UserEmail":"muhc.app.mobile@gmail.com"};
var request2 = {"Request":"VerifyAnswer","DeviceId":"ea11a0df0560990490c50690-dd1710840610-4c70630970-294370880670-9e1db0770e50c0f401f08a05e09b0fc07d0","Token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3N2I2ZWVjZmI3MGNjOWQwOWYyNGNkY2QzYWI3MzNiNDRhNmNjZGYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb3BhbC1wcm9kIiwiYXVkIjoib3BhbC1wcm9kIiwiYXV0aF90aW1lIjoxNTA5NzQyMzMwLCJ1c2VyX2lkIjoiQjJrWXNTZXBNTmNLbjVkUjRBeHNrYUhmeVMwMiIsInN1YiI6IkIya1lzU2VwTU5jS241ZFI0QXhza2FIZnlTMDIiLCJpYXQiOjE1MDk3NDIzMzEsImV4cCI6MTUwOTc0NTkzMSwiZW1haWwiOiJtdWhjLmFwcC5tb2JpbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.TAxw6fXeT9MfsN_aS4tRg1mMR6hKv-4gS_ugPkCaOAQafME2KQSQTWS7tPx4I70Rz89tSEnMtov22uG27ZmMBlZP_eVUF5Mc5Abezad49NmU5ZYNzA-SWt6HZ4jd3Ogi5JxyPGFZPpSvUnqgGTDj894h3gf7Vr0SeXDz6BigdtHqVQB7Mq8083nvSaZFhVlhEk2a2CNkI8-JZNNkaW60ugXzppmLU3olSM_sSliItgnttWpVz3PWW2N9rLS96imU7Bfl8gSEnR0XYkf3MmD3_EB7K1bO5y9Sip3q2U5Tq2h5tp5oabmzKqgdAlECCEgwq4K7KB7XQSGDGQ17wMgIrw","UserID":"B2kYsSepMNcKn5dR4AxskaHfyS02","Parameters":{"Question":"Y/uqOEAPfg+WvJ9IGQjD4L1h+TYEHh6NmhbTMfLusNW18Up2/tOpqL+61bqNSg2orWZ3DS2Yr/DOhflIQWspGfYO/WS4r0nalZvxj/WCkis9","Answer":"Y/uqOEAPfg+WvJ9IGQjD4L1h+TYEHh6N6TIDwMusUahLgYjdgrGhYtixgP6ZQUqw5Dg1Gjid97OSx/RaQH4gWLRTrWe36RPX1da7w6zSn25gixSIkruCQuvl61q+Lh5e2J7lQE1dLdyb0nfro+azNnXDqJr4kQIUsYDdhV/fxEdkxreI+z9Ilz8RuqongECJb+6RCT2TT+F8FT8I+kSORQ2eMnzg5cIh","SSN":"Y/uqOEAPfg+WvJ9IGQjD4L1h+TYEHh6NBHQ9mwFfzDvKz2xO5Z9Dup280KvLShDtsA==","Trusted":"Y/uqOEAPfg+WvJ9IGQjD4L1h+TYEHh6Nt0K9eWUgRy3uxv5qaaVSYY6z2L3I","Password":"Y/uqOEAPfg+WvJ9IGQjD4L1h+TYEHh6N4vUv2x5CkrPl+kptRZNw9trghf2cGh28tWs1Sj3HqraSxaFYFH0lXrwBqTbguUSB0tuzn/zQym9j3RfcxeDTRbmy61Lrfk8FjM7uFxoKLNqahnXtoLayanDC/MSrkAMUuYbRhVnSxkljl7WKrm4ZnT0W7f8vhRfeOuDDD2nEGeN8HTcI+BKEEFicZnu7scEn"},"Timestamp":{".sv":"timestamp"},"UserEmail":"muhc.app.mobile@gmail.com"};
var request3 = {"Request":"q2swiEIHiaIoXVDMqjnoChqfLXhYschUoxVn0La6WpgIi8Gv7tely1NtOfUL","DeviceId":"741506b0520fd0490360ca0-e111f01f0560-4970f60b30-13c190890be0-4c1104101a0ac0950aa06f03b07808f060","Token":"eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ3N2I2ZWVjZmI3MGNjOWQwOWYyNGNkY2QzYWI3MzNiNDRhNmNjZGYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb3BhbC1wcm9kIiwiYXVkIjoib3BhbC1wcm9kIiwiYXV0aF90aW1lIjoxNTA5NzQ1NjczLCJ1c2VyX2lkIjoiQjJrWXNTZXBNTmNLbjVkUjRBeHNrYUhmeVMwMiIsInN1YiI6IkIya1lzU2VwTU5jS241ZFI0QXhza2FIZnlTMDIiLCJpYXQiOjE1MDk3NDU2NzQsImV4cCI6MTUwOTc0OTI3NCwiZW1haWwiOiJtdWhjLmFwcC5tb2JpbGVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbIm11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.tTWpiTGELMZkYuYKRFcfy3ipJmN2a6n_nJFWKs3V73B7XoeDdhGMsdC1JbWPpC6nM1W55jYUHCGR5talet86Em-PpnPc5b-s02O54ndam1Kpm2mitNuqT2VyidLMpir5uQcSt1tB_Us40uXXo5QlgsxhnFF3Ecs_MGQedyyVa7mlRjQSNVOM1PmfwmjwqUKuiFPGSB2sO0fsVmFplR2lqUEodI__RbqwtcPP1R8T5nuTbAjnhd2mGDv8i4xk_1lgi4itARuEusz-1rU1Pkqh9ou9tXEv-ew97P7WnIbcO_dRajCGjLnmGyhDP8DHoFiyBjlqL6SBBqk_DJPU-ajGdQ","UserID":"B2kYsSepMNcKn5dR4AxskaHfyS02","Parameters":{"Fields":["uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuW8JNDNPACdaXRs1t9Tz3B385X33n767g=","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWN8NTUEn7mGvxuoaib6BhUN9G23/367jYARREYg==","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWLYCcJU9PowdmEjWclPql7spX2Hvt","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuW+jRwzyofNN2B004p2BW+08pO/3X/6IHQFwlRdkzC","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWV8O6P9azR1YnnwA5h/28e9tS3nP/8aXaChtcXEjFlYKR5C0=","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWl8SjWWCmHZJ9NxBCUkLsl9pZyGXz4KLBFw==","uP8ZfM9GngvYOjUD8Wn9p1d3eKI58TuWXGn6nMp/6GcZnTxAmzUGYtBZ33n47K/UEBNff1o="]},"Timestamp":admin.database.ServerValue.TIMESTAMP,"UserEmail":"muhc.app.mobile@gmail.com"};
var requestArr = [request3];
if(process.argv[2]!=='--delete')
{
    writeRequests(requestArr, process.argv[2]);
    setInterval(()=>{
        writeRequests(requestArr);
    },30000);
    
    
    
}
console.log(process.argv[2]);
if(process.argv[2]=='--delete'){
    ref.set(null);
    db.ref("/dev3/users").set(null);
}

function writeRequests(arr, requestNumber){
    for(var i = 0;i< requestNumber;i++)
    {
        arr.forEach((req)=>{
            var key = ref.push(req).then(function(){
                console.log(request);
                
            }).catch((err)=>{
                console.log(err);
            });
            
        });
        
    }
}