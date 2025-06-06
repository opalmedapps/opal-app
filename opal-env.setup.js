// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const shelljs = require('shelljs');
const xmlJs = require('xml-js');

class OpalEnv {

    /********************************/
    /******* PUBLIC FUNCTIONS *******/
    /********************************/

    /**
     * @description Verifies if the directory for a given Opal environment exists. If not, an error is thrown.
     * @param {string} env The name of the environment, i.e. the name of a sub-folder in env/.
     */
    static verifyOpalEnvironmentExists(env) {
        const environments = this.getDirectories("./env");
        if (!env || env.includes("npm_config_env")) throw new Error(`Invalid environment; no value was provided. Use --env=___ at the end of your npm command to specify an environment to use; available choices: ${environments.join(", ")}`);
        if (environments.indexOf(env) === -1) throw new Error(`Unable to find environment "${env}" in ./env folder, please choose one of the following: ${environments.join(", ")}`);
    }

    /**
     * @description Copies all files from a given environment to the root directory.
     * @param {string} env The name of the environment, i.e. the name of a sub-folder in env/.
     */
    static copyEnvironmentFiles(env) {
        this.verifyOpalEnvironmentExists(env);
        const environment_folder = `./env/${env}/*`;
        shelljs.cp('-f', environment_folder, './');
        shelljs.cp('-f', './env/config.xml', './');
        this.insertConfigXmlPlaceholders(env);
    }

    /**
     * @description Sets the version and build numbers in config.xml and the opal.config.js files of all environments
     *              (with one exception: in prod, only the version is set, not the build).
     * @author Stacey Beard
     * @date 2023-07-06
     * @param {string|null} version Version number passed to setVersion().
     * @param {string|number|null} build Build number passed to setBuildNumber() (except for prod).
     */
    static setVersionAndBuildAllEnv(version = null, build = null) {
        const environments = this.getDirectories("./env");
        this.setVersion(version);
        // Exception for prod: don't change the build number. This is done separately upon release.
        environments.forEach(env => this.setBuildNumber((env === 'prod') ? 'same' : build, env));
    }

    /**
     * @name updateWebVersion
     * @author Stacey Beard
     * @date 2020-07-24
     * @description Updates the file web-version.json with the app's web version, taken from config.xml and opal.config.js.
     *              The web version is made available throughout the app as WEB_VERSION.version
     *              and WEB_VERSION.build via webpack's ProvidePlugin.
     *              If the target files are not found, generic default version numbers are used.
     * @param {string} env The name of the environment, i.e. the name of a sub-folder in env/.
     *                     This is needed because the build number for prod is different than for the other environments.
     */
    static updateWebVersion(env) {
        let versionNumber, buildNumber;

        // Try to set the build and version numbers, or use defaults upon failure
        try {
            versionNumber = this.getVersion();
        }
        catch (error) {
            versionNumber = "100.100.100";
            console.warn(`No version number found; using ${versionNumber}`);
        }
        try {
            buildNumber = this.getBuildNumber(env);
        }
        catch (error) {
            buildNumber = "1";
            console.warn(`No build number found; using ${buildNumber}`);
        }

        /* Write the numbers to ./web-version.json, which is made accessible everywhere in the app using
        * the webpack ProvidePlugin (as WEB_VERSION). The values in this file are used as the app's web version number.
        */
        fs.writeFileSync("./web-version.json", `{\n`
            + '    "_comment": "This file is automatically generated when building the app, using information from config.xml and opal.config.js; do not edit.",\n'
            + `    "version": "${versionNumber}",\n`
            + `    "build": "${buildNumber}"\n`
            + `}\n`
        );
    }

    /**
     * @description Reads and returns a specific environment setting from opal.config.js.
     * @author Stacey Beard
     * @date 2022-03-23
     * @param {string} settingName The name of the setting to read from the file.
     * @param {string} env The name of the environment to use.
     * @returns {*} The setting provided in the file.
     */
    static getEnvSetting(settingName, env) {
        const settings = this.getEnvSettings(env);
        if (!settings || typeof settings[settingName] === "undefined") throw new Error(`opal.config.js for environment "${env}" is missing the setting: "${settingName}". See env/opal.config.sample.js for details.`);
        return settings[settingName];
    }

    /**
     * @description Creates an empty www folder. This is necessary, because the app won't be considered a real
     *              cordova project without a www folder, and cordova commands will fail.
     */
    static createWWWFolder(){
        const path = "www";
        if (!shelljs.test('-d', path)) shelljs.mkdir(path);
    }

    /********************************/
    /******* PRIVATE FUNCTIONS ******/
    /********************************/

    /**
     * @description Helper function which gets the list of directories at a given path.
     * @param {string} source The path at which to read the directories.
     * @returns {string[]} The list of directories at that path.
     */
    static getDirectories(source) {
        // nosemgrep: detect-non-literal-fs-filename (only used by webpack)
        return fs.readdirSync(source, {withFileTypes: true})
            .filter(directory => directory.isDirectory())
            .map(directory => directory.name);
    }

    /**
     * @description Reads and returns the environment settings from opal.config.js.
     * @author Stacey Beard
     * @date 2022-03-23
     * @param {string} env The name of the environment to use.
     * @returns {object} The settings object provided in the file.
     */
    static getEnvSettings(env) {
        const config = this.getOpalConfigJs(env, true);
        if (!config || !config.settings) throw new Error(`opal.config.js for environment "${env}" is not correctly formatted with a "settings" property.`);
        return config.settings;
    }

    /**
     * @description Reads the app's version from config.xml in the /env directory.
     * @returns {string} The app's version number.
     */
    static getVersion() {
        let configFile = this.getConfigXML('./env', true);
        return configFile.elements[1].attributes.version;
    }

    /**
     * @description Reads the app's build number from an environment's opal.config.js file.
     * @returns {string} The app's build number.
     * @param {string} env The name of the environment, i.e. the name of a sub-folder in env/.
     */
    static getBuildNumber(env) {
        let envConfigs = this.getOpalConfigJs(env, true);
        return envConfigs.configXml.BUILD_NUMBER;
    }

    /**
     * @description Sets a new version number for the app (but not the build number).
     * @param {string|null} newVersion New version to set; if null, it increments the patch number by one.
     */
    static setVersion(newVersion = null) {
        const currentVersion = this.getVersion();
        newVersion = newVersion ? newVersion : semver.inc(currentVersion, 'patch');
        console.log(`Version update: ${currentVersion} => ${newVersion}`);
        this.writeToConfigXML(
            './env',
            this.setXMLWidgetAttributeText(this.getConfigXML('./env', true), 'version', newVersion),
        );
    }

    /**
     * @description Sets a new build number for the app.
     * @param {string} env The name of the environment to update.
     * @param {number|null|string} buildNumber New build number for the app: either a string/integer representing the new value,
     *                                         or null, which updates the current value by 1,
     *                                         or 'same', in which case the build number is not altered.
     */
    static setBuildNumber(buildNumber = null, env) {
        let envConfigs = this.getOpalConfigJs(env, true);

        // Get existing build number
        let oldBuildNumber = envConfigs.configXml.BUILD_NUMBER;

        if (buildNumber === 'same') buildNumber = oldBuildNumber;
        else if (buildNumber) {
            buildNumber = Number(buildNumber);
            if (Number.isNaN(buildNumber)) throw new Error(`Build number ${buildNumber} must be numeric`);
        }
        else {
            buildNumber = oldBuildNumber + 1;
            console.log(`Incremented build number by 1`);
        }

        // Replace the build number in opal.config.js
        let rawConfigFile = this.getOpalConfigJs(env, false);
        rawConfigFile = rawConfigFile.replace(/"BUILD_NUMBER": [0-9]+,/i, `"BUILD_NUMBER": ${buildNumber},`);
        fs.writeFileSync(`./env/${env}/opal.config.js`, rawConfigFile);

        console.log(`Build number for env: '${env}' set to ${buildNumber}`);
    }

    /**
     * @description Reads and returns the contents of opal.config.js from the directory for
     *              the given environment. Can be returned either as a JS object, or as raw string content.
     * @author Stacey Beard
     * @date 2022-03-23
     * @param {string} env The name of the environment to use.
     * @param {boolean} parseAsJs If true, the file content is retrieved as a JavaScript object.
     *                            If false, the raw string content is returned.
     * @returns {object|string} The JS object provided in the file, or the raw string content of the file.
     */
    static getOpalConfigJs(env, parseAsJs) {
        this.verifyOpalEnvironmentExists(env);
        const path = `./env/${env}/opal.config.js`;
        // nosemgrep: detect-non-literal-fs-filename (only used by webpack)
        if (!fs.existsSync(path)) throw new Error(`File not found: ${path}`);
        // nosemgrep: detect-non-literal-require, detect-non-literal-fs-filename (internal functionality; no user-supplied data used, only used by webpack)
        return parseAsJs ? require(path) : fs.readFileSync(path).toString();
    }

    /**
     * @description Reads the config.xml file, (optionally) converts it to a JavaScript object, and returns it.
     *              Assumes a config.xml file exists at the specified path.
     * @param {string} basePath The base path in which to look ('config.xml' is appended to it).
     * @param {boolean} parseAsJs If true, the file content is parsed as a JavaScript object.
     *                            If false, the raw string content is returned.
     * @returns {Element|string} The content of the file, either as a JS object or as a string.
     */
    static getConfigXML(basePath, parseAsJs) {
        let filePath = path.join(basePath, 'config.xml');
        // nosemgrep: detect-non-literal-fs-filename (only used by webpack)
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        // nosemgrep: detect-non-literal-fs-filename (only used by webpack)
        let fileContentString = fs.readFileSync(filePath).toString();
        return parseAsJs ? xmlJs.xml2js(fileContentString) : fileContentString;
    }

    /**
     * @description Writes content back to the config.xml file. Converts it from a JS object if necessary,
     *              otherwise, writes the raw string directly to the file.
     *              Assumes the current directory contains this file.
     * @param {string} basePath The base path in which to look ('config.xml' is appended to it).
     * @param {Element|string} content The new content to write.
     */
    static writeToConfigXML(basePath, content) {
        let filePath = path.join(basePath, 'config.xml');
        let contentToWrite = typeof content === "string" ? content : xmlJs.js2xml(content, {
            fullTagEmptyElement: false,
            indentCdata: true,
            spaces: 4,
        });
        // Make sure the file ends in a newline
        contentToWrite += '\n';
        fs.writeFileSync(filePath, contentToWrite);
    }

    /**
     * @description Modifies a specific attribute's value in an XML object.
     * @throws error Throws an error if no child elements are found that match the given childName.
     * @param {Element} xmlObject JavaScript object whose interface is the specified interface in the xml-js package.
     * @param {string} attributeName Attribute name to modify in the xml.
     * @param {*} newValue New value for the attribute.
     * @example let xmlObject = xmlJs.xml2js('<widget version="1.8.10"></widget>');
     *          xmlObject = setXMLWidgetChildText(xmlObject, 'version', '1.8.11');
     *          xmlJs.js2xml(xmlObject); // returns '<widget version="1.8.11"></widget>'
     * @returns {Element} Returns the modified XML Element object.
     */
    static setXMLWidgetAttributeText(xmlObject, attributeName, newValue) {
        if (xmlObject && attributeName && newValue) {
            xmlObject.elements[1].attributes[String(attributeName)] = String(newValue);
        }
        return xmlObject;
    }

    /**
     * @description Replaces all placeholders in config.xml by the values in opal.config.js for the given environment.
     *              Assumes a config.xml file exists in the current directory.
     * @param {string} env The name of the environment to use.
     */
    static insertConfigXmlPlaceholders(env) {
        let configXmlFile = this.getConfigXML('./', false);
        let envConfigs = this.getOpalConfigJs(env, true);

        Object.entries(envConfigs.configXml).forEach(([placeholder, value]) => {
            configXmlFile = configXmlFile.replaceAll('${' + placeholder + '}', value.toString());
        });

        this.writeToConfigXML('./', configXmlFile);
    }
}
module.exports = OpalEnv;
