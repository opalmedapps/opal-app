// Removes android permissions which we don't use, set by cordova plugins
// Source: https://stackoverflow.com/questions/25265908/cordova-remove-unnecessary-permissions

let permissionsToRemove = ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'];

let fs = require('fs');
let path = require('path');
let rootdir = '';
let manifestFile = path.join(rootdir, 'platforms/android/app/src/main/AndroidManifest.xml');

fs.readFile(manifestFile, 'utf8', function(err, data) {
    if (err) return console.log(err);

    let result = data;
    for (let i = 0; i < permissionsToRemove.length; i++) {
        result = result.replace(`<uses-permission android:name="android.permission.${permissionsToRemove[i]}" />`, '');
    }

    fs.writeFile(manifestFile, result, 'utf8', function(err) {
        if (err) return console.log(err);
    });
});
