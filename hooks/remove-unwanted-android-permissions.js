// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Removes android permissions which we don't use, set by cordova plugins
// Source: https://stackoverflow.com/questions/25265908/cordova-remove-unnecessary-permissions

let permissionsToRemove = ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'];

let fs = require('fs');
let path = require('path');
let rootDir = '';
let manifestFile = path.join(rootDir, 'platforms/android/app/src/main/AndroidManifest.xml');

try {
    // nosemgrep: detect-non-literal-fs-filename (only used when building the app)
    let data = fs.readFileSync(manifestFile, 'utf8');

    let result = data;
    for (let i = 0; i < permissionsToRemove.length; i++) {
        let name = permissionsToRemove[i];
        let resultAfter = result.replace(`<uses-permission android:name="android.permission.${name}" />`, '');
        console.log(`Removing permission ${name}: ${result === resultAfter ? 'permission not found (or already removed)' : 'success'}`);
        result = resultAfter;
    }

    // nosemgrep: detect-non-literal-fs-filename (only used when building the app)
    fs.writeFileSync(manifestFile, result, 'utf8');
}
catch (error) {
    console.error('An error occurred while attempting to remove unwanted android permissions.');
    throw error;
}
