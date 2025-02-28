// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Removes android exports which we don't use, set by cordova plugins
// Adapted from: https://stackoverflow.com/questions/25265908/cordova-remove-unnecessary-permissions

let exportsToRemove = ['nl.xservices.plugins.ShareChooserPendingIntent'];

let fs = require('fs');
let path = require('path');
let rootDir = '';
let manifestFile = path.join(rootDir, 'platforms/android/app/src/main/AndroidManifest.xml');

try {
    // nosemgrep: detect-non-literal-fs-filename (only used when building the app)
    let data = fs.readFileSync(manifestFile, 'utf8');

    let result = data;
    for (let i = 0; i < exportsToRemove.length; i++) {
        let name = exportsToRemove[i];
        let resultAfter = result.replace(
            `<receiver android:enabled="true" android:exported="true" android:name="${name}">`,
            `<receiver android:enabled="true" android:exported="false" android:name="${name}">`,
        );
        console.log(`Removing export of ${name}: ${result === resultAfter ? 'export not found (or already removed)' : 'success'}`);
        result = resultAfter;
    }

    // nosemgrep: detect-non-literal-fs-filename (only used when building the app)
    fs.writeFileSync(manifestFile, result, 'utf8');
}
catch (error) {
    console.error('An error occurred while attempting to remove unwanted android exports.');
    throw error;
}
