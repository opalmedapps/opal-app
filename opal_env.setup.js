const fs = require("fs");
const shelljs = require("shelljs");
const semver = require("semver");
const xmlJs = require("xml-js");

class OpalEnv {
	/**
	 * Function verifies the Opal environment directory exists, throws error if it does not find it.
	 * @param {string} env string value for the environment, normally one of ['local', 'dev', 'qa', 'staging', 'preprod', 'prod'].
	 */
	static verifyOpalEnvironmentExists(env = null) {
		if (env) {
			const environments = this.getDirectories("./env");
			// Check if environment exists in folder
			if (environments.indexOf(env) === -1) {
				let error = env.includes("npm_config_env")
					? `Use --env=___ at the end of your npm command to specify an environment to use; available choices: ${environments.join(", ")}`
					: `Unable to find environment "${env}" in ./env folder, please choose one of the following: ${environments.join(", ")}`;
				throw new Error(error);
			}
		}
	}

	/**
	 * Function takes the environment string and copies the files over to the root directory.
	 * If no environment is set, the default is to do nothing.
	 * This assumes the files in the root directory are present already.
	 * @param {string} env string value for the environment, normally one of ['local', 'dev', 'qa', 'staging', 'preprod', 'prod'].
	 */
	static copyEnvironmentFiles(env = null) {
		if (env) {
			this.verifyOpalEnvironmentExists(env);
			const environment_folder = `./env/${env}/*`;
			shelljs.cp("-f", environment_folder, "./");
		}
	}

	/**
	 * @name updateWebVersion
	 * @author Stacey Beard
	 * @date 2020-07-24
	 * @description Updates the file web-version.json with the app's web version, taken from config.xml of the
	 *              specified environment. The web version is made available throughout the app as WEB_VERSION.version
	 *              and WEB_VERSION.build via webpack's ProvidePlugin.
	 *              If the config.xml file is not found, generic default version numbers are used.
	 *              Note: since the build number in config.xml is repeated twice, the Android one is used here.
	 * @param {string} env Environment from which to get the version, normally one of ['local', 'dev', 'qa', 'staging', 'preprod', 'prod'].
	 */
	static updateWebVersion(env) {

		const initialDirectory = shelljs.pwd().toString();
		this.setDirectory(env);

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
			buildNumber = this.getBuildNumbers()[1];
		}
		catch (error) {
			buildNumber = "1";
			console.warn(`No build number found; using ${buildNumber}`);
		}

		/* Write the numbers to ./web-version.json, which is made accessible everywhere in the app using
		* the webpack ProvidePlugin (as WEB_VERSION). The values in this file are used as the app's web version number.
		*/
		fs.writeFileSync("../../web-version.json", `{\n`
			+ '    "_comment": "This file is automatically generated when building the app, using information from config.xml; do not edit.",\n'
			+ `    "version": "${versionNumber}",\n`
			+ `    "build": "${buildNumber}"\n`
			+ `}\n`
		);

		shelljs.cd(initialDirectory);
	}

	/**
	 * Returns current app version for the given environment, if environment not passed looks
	 * on the root directory
	 */
	static getVersion(env = null) {
		this.setDirectory(env);
		let configFile = this.getConfigXMLJSON();
		return configFile.elements[0].attributes.version;
	}

	/**
	 * Returns tuple [ios, android] for build numbers given an environment, if none passed, it looks
	 * in the root directory for the config.xml
	 * @param {string} env  string value representing the environment
	 */
	static getBuildNumbers(env = null) {
		this.setDirectory(env);
		let configFile = this.getConfigXMLJSON();
		return [Number(configFile.elements[0].attributes["ios-CFBundleVersion"]), Number(configFile.elements[0].attributes["android-versionCode"])];
	}

	/**
	 * @description Reads and returns a specific environment setting from opal.config.js.
	 * @author Stacey Beard
	 * @date 2022-03-23
	 * @param {string} settingName - The name of the setting to read from the file.
	 * @param {string|null} [env] - The name of the environment to use.
	 * @returns {*} The setting provided in the file.
	 */
	static getEnvSetting(settingName, env = null) {
		const settings = this.getEnvSettings(env);
		if (!settings || typeof settings[settingName] === "undefined") throw new Error(`opal.config.js for environment "${env}" is missing the setting: "${settingName}". See env/opal.config.sample.js for details.`);
		return settings[settingName];
	}

	/**
	 * @description Reads and returns the environment settings from opal.config.js.
	 * @author Stacey Beard
	 * @date 2022-03-23
	 * @param {string|null} [env] - The name of the environment to use.
	 * @returns {object} The settings object provided in the file.
	 */
	static getEnvSettings(env = null) {
		const config = this.getOpalConfigJSON(env);
		if (!config || !config.settings) throw new Error(`opal.config.js for environment "${env}" is not correctly formatted with a "settings" property.`);
		return config.settings;
	}

	/**
	 * Sets the name of the application in the config.xml, useful when changing environment and name of the app
	 * @param {string} newName New name for the application
	 * @param {string} env string value representing the environment
	 */
	static setApplicationName(newName/*:string*/, env = null) {
		if (newName) {
			let name = `Opal ${this.capitalize(newName)}`;
			this.setDirectory(env);
			this.writeToConfigXML(this.setXMLWidgetChildText(this.getConfigXMLJSON(),
				"name", name));
		}

	}
	/**
	 * Creates www folder, this step is a necessary post-installed step as the app is not a consider a "proper"
	 * cordova project otherwise for the `cordova prepare` step to run.
	 */
	static createWWWFolder(){
		const path = "www";
		if(!shelljs.test('-d', path)) shelljs.mkdir("www");
	}

	/**
	 * Modifies xml child element from widget element object
	 * @throws error Throws error if no child elements found that match given childName.
	 * @param {Element} xmlObject JavaScript object whose interface is the specified interface in the xml-js package
	 * @param childName Name of child to change
	 * @param newTextValue New text value for the element.
	 * @example
	 * let xmlObject = xmlJs.xml2js('<widget><name>My name</name></widget>');
	 * xmlObject = setXMLWidgetChildText(xmlObject, 'name', 'Your name');
	 * xmlJs.js2xml(xmlObject); //returns '<widget><name>Your name</name></widget>'
	 * @returns {Element} returns Element object from the xml-js library
	 */
	static setXMLWidgetChildText(xmlObject, childName, newTextValue) {
		if (childName && newTextValue) {
			xmlObject.elements[0].elements.filter(ele => ele.name === String(childName))[0]
				.elements[0].text = String(newTextValue);
		}
		return xmlObject;
	}

	/**
	 * Modifies xml child element from widget element object
	 * @throws error Throws error if no child elements found that match given childName.
	 * @param {Element} xmlObject JavaScript object whose interface is the specified interface in the xml-js package
	 * @param attributeName Attribute name to modify in the xml
	 * @param newAttributeText New value for the attribute
	 * @example
	 * let xmlObject = xmlJs.xml2js('<widget version="1.8.10"></widget>');
	 * xmlObject = setXMLWidgetChildText(xmlObject, 'version', '1.8.11');
	 * xmlJs.js2xml(xmlObject); //returns '<widget version="1.8.11"></widget>'
	 * @returns {Element} returns Element object from the xml-js library
	 */
	static setXMLWidgetAttributeText(xmlObject, attributeName, newAttributeText) {
		if (xmlObject && attributeName && newAttributeText) {
			xmlObject.elements[0].attributes[String(attributeName)] = String(newAttributeText);
		}
		return xmlObject;
	}

	/**
	 * Sets version for the app, this is different from the build number, this is the version that
	 * shows in the app store.
	 * @throws Throws error if environment not defined, if config.xml file is not
	 * @param {string|null} newVersion New version; if null, it increments the patch number by one.
	 * @param {string|null} env Environment to update; if null, it updates the file in the root directory.
	 */
	static setVersion(newVersion = null, env = null) {
		// Gets new version or simply increases current patch version by one.
		const currentVersion = this.getVersion(env);
		newVersion = (newVersion) ? newVersion : semver.inc(currentVersion, "patch");
		console.log(`Version update for env: '${env ? env : "default (root)"}' ${currentVersion}=>${newVersion}`);
		this.writeToConfigXML(this.setXMLWidgetAttributeText(this.getConfigXMLJSON(),
			"version", newVersion));
	}
	static bumpBuildNumbers(env=null){
		OpalEnv.setBuildNumbers(null, env);
	}
	/**
	 * Sets build number in config.xml for cordova file
	 * @param {string|null} env Environment to update
	 * @param {number|[number,number]|null} buildNumber New build number for app, it could a tuple representing
	 *                                      new build numbers for [ios,android], or null, which updates
	 *                                      the current value of both platforms by 1.
	 */
	static setBuildNumbers(buildNumber = null, env = null) {
		this.setDirectory(env);
		let configFile = this.getConfigXMLJSON();
		if (buildNumber && Array.isArray(buildNumber)) {
			buildNumber = buildNumber.map(Number);
			if (Number.isNaN(buildNumber[0]) ||
				Number.isNaN(buildNumber[1]))
				throw new Error(`Build numbers [${buildNumber}] must conform to two numeric values in array, i.e. [2131,1231]`);
		} else if (buildNumber) {
			buildNumber = Number(buildNumber);
			if (Number.isNaN(buildNumber)) {
				throw new Error(`Build number ${buildNumber} must be numeric`);
			}
			buildNumber = [buildNumber, buildNumber];
		} else {
			// get build numbers
			let [ios, android] = [Number(this.getXMLWidgetAttributeText(configFile,
				"ios-CFBundleVersion")),
				Number(this.getXMLWidgetAttributeText(configFile, "android-versionCode"))];
			buildNumber = [ios + 1, android + 1];
			console.log(`OLD VERSIONS iOS: ${ios}, Android ${android}`);
			console.log(`NEW VERSIONS iOS: ${buildNumber[0]}, Android ${buildNumber[1]}`);
		}

		this.setXMLWidgetAttributeText(configFile, "ios-CFBundleVersion", buildNumber[0]);
		this.setXMLWidgetAttributeText(configFile, "android-versionCode", buildNumber[1]);
		this.writeToConfigXML(configFile);
		console.log(`Build numbers for env: '${env ? env : "default (root)"}' set to ${buildNumber[0] === buildNumber[1] ? buildNumber[0] : buildNumber}`);
	}

	/**
	 * @desc Sets the version and build numbers in the config.xml file of the given environment.
	 * @author Stacey Beard
	 * @date 2023-03-30
	 * @param {string|null} version Version number passed to setVersion().
	 * @param {string|null} build Build number(s) passed to setBuildNumbers().
	 * @param {string|null} env Environment to update; if null, it updates the file in the root directory.
	 */
	static setVersionAndBuild(version = null, build = null, env = null) {
		const initialDirectory = shelljs.pwd().toString();
		this.setVersion(version, env);
		shelljs.cd(initialDirectory);
		this.setBuildNumbers(build, env);
	}

	static getEnvironmentFolder(env = null) {
		return (env) ? `./env/${env}` : "./";
	}

	static setDirectory(env = null) {
		this.verifyOpalEnvironmentExists(env);
		const dir = this.getEnvironmentFolder(env);
		shelljs.cd(dir);
	}

	/**
	 * Reads the config.xml, converts it to a JSON object and returns it.
	 * Contract: Assumes the config.xml file exists in current directory.
	 * @returns {object} returns json object of config file.
	 */
	static getConfigXMLJSON() {
		if (fs.existsSync("./config.xml")) {
			return xmlJs.xml2js(fs.readFileSync("./config.xml").toString());
		}
		throw new Error("config.xml file not found");
	}

	/**
	 * @description Reads and returns the contents of opal.config.js (a JSON object) from the directory for
	 *              the given environment.
	 * @author Stacey Beard
	 * @date 2022-03-23
	 * @param {string|null} [env] - The name of the environment to use. If none is provided, the root folder is used.
	 * @returns {object} The JSON object provided in the file.
	 */
	static getOpalConfigJSON(env = null) {
		const path = env ? `./env/${env}/opal.config.js` : './opal.config.js';
		if (!fs.existsSync(path)) throw new Error(`File not found: ${path}`);
		return require(path);
	}

	static writeToConfigXML(configFile) {
		fs.writeFileSync("./config.xml", xmlJs.js2xml(configFile,
			{
				fullTagEmptyElement: false,
				indentCdata: true,
				spaces: 4,
			}));
	}

	/**
	 * Helper function to get directories
	 * @param source
	 * @returns {string[]}
	 */
	static getDirectories(source) {
		return fs.readdirSync(source, {withFileTypes: true})
			.filter(directory => directory.isDirectory())
			.map(directory => directory.name);
	}

	static getXMLWidgetAttributeText(xmlObject, attributeName) {
		if (xmlObject && attributeName) {
			return xmlObject.elements[0].attributes[String(attributeName)];
		}
		return {};
	}
	static capitalize(str){
		if(typeof str === "string"){
			str = str.charAt(0).toUpperCase() + str.slice(1);
		}
		return str;
	}
}
module.exports = OpalEnv;
