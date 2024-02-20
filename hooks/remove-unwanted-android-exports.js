// Removes android exports which we don't use, set by cordova plugins
// Adapted from: https://stackoverflow.com/questions/25265908/cordova-remove-unnecessary-permissions

let exportsToRemove = ['nl.xservices.plugins.ShareChooserPendingIntent'];

let fs = require('fs');
let path = require('path');
let rootdir = '';
let manifestFile = path.join(rootdir, 'platforms/android/app/src/main/AndroidManifest.xml');

// nosemgrep: detect-non-literal-fs-filename (only used when building the app)
fs.readFile(manifestFile, 'utf8', function(err, data) {
    if (err) return console.log(err);

    let result = data;
    for (let i = 0; i < exportsToRemove.length; i++) {
        result = result.replace(
            `<receiver android:enabled="true" android:exported="true" android:name="${exportsToRemove[i]}">`,
            `<receiver android:enabled="true" android:exported="false" android:name="${exportsToRemove[i]}">`,
        );
    }

    // nosemgrep: detect-non-literal-fs-filename (only used when building the app)
    fs.writeFile(manifestFile, result, 'utf8', function(err) {
        if (err) return console.log(err);
    });
});
