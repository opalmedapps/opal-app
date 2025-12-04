// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * The IPS viewer URL is provided here as a simple export to be available both early in the app's
 * configuration phase (to $sceDelegateProvider) and after configuration (to the IPS controller).
 *
 * It's also referenced in `static/landingpage/.htaccess` to avoid CSP errors in the web app.
 *
 * The URL must end in a forward slash.
 */
export default 'https://viewer.opalmedapps.ca/';
