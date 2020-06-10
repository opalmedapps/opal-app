import Highcharts from 'highcharts/highstock';
import addMore from "highcharts/highcharts-more";
import addDrilldown from "highcharts/modules/drilldown";
import addNoData from "highcharts/modules/no-data-to-display";
import addOfflineExporting from "highcharts/modules/offline-exporting";
import addExporting from "highcharts/modules/exporting";

addMore(Highcharts);
addDrilldown(Highcharts);
addNoData(Highcharts);
addOfflineExporting(Highcharts);
addExporting(Highcharts);

class PatientTestResultsByTypeController {
	/**
	 * @type {string}
	 */
	#language;
	/**
	 * @type {string}
	 */
	#fontSize;
	/**
	 * @type {TestType}
	 */
	test = {};
	/**
	 * Loading variable to toggle loading in the view
	 * @type {boolean}
	 */
	loading = true;
	/**
	 * HcChart configuration object
	 * @type {*}
	 */
	chartOptions = {};
	/**
	 * Variable to control whether to show the table view or the chart view
	 */
	showChart = true;

	#patientTestResults;
	#navigator;
	#appConstants;
	#labsChartConfigurationFactory;
	#$timeout;
	#$filter;

	/**
	 * Class constructor for controller
	 * @param {PatientTestResults} patientTestResults
	 * @param {UserPreferences} userPreferences
	 * @param {HcChartLabsConfiguration} hcChartLabsConfiguration
	 * @param {NavigatorParameters} navigatorParameters
	 * @param {Constants} constants
	 * @param {$filter} $filter Angular filter
	 * @param {$timeout} $timeout Angular module
	 * @param {$rootScope} $rootScope Angular module
	 */
	constructor(patientTestResults, userPreferences, hcChartLabsConfiguration,
		navigatorParameters, constants, $filter, $timeout) {
		this.#patientTestResults = patientTestResults;
		this.#language = userPreferences.getLanguage();
		this.#fontSize = userPreferences.getFontSize();
		this.#navigator = navigatorParameters.getNavigator();
		this.#appConstants = constants;
		this.#$timeout = $timeout;
		this.#$filter = $filter;
		this.#labsChartConfigurationFactory = hcChartLabsConfiguration;
		this.#initialize(this.#navigator.getCurrentPage().options);
	}

	/**
	 * Displays disclaimer modal for out-of-app links 
	 */
	showAboutTestAlert() {
		// TODO(dherre3) Centralize modals of this kind, create factory to manage all modals.
		disclaimerModal.show();
	}
	/**
	 * Routing to EducationalMaterialURL for the test type
	 */
	goToUrl() {
		let url = this.test[`educationalMaterialURL_${this.#language}`];
		if (this.#appConstants.app) {
			cordova.InAppBrowser.open(url, '_blank', 'location=yes');
		} else {
			window.open(url);
		}
	}
	/**
	 * Returns the test name in the preferred patient language
	 * @returns {TestType} Returns test name to display in the view
	 */
	getTestName(test) {
		return test[`name_${this.#language}`];
	}
	////////////////////////////////////////////////////

	/**
	 * Initializes the controller, takes the testTypeSerNum (ExpressionSerNum) for the TestType from the
	 * navigator parameters, shows error upon failure
	 * @param {number} testTypeSerNum
	 */
	#initialize = ({ testTypeSerNum }) => {
		if (!testTypeSerNum) this.#handlerServerError(
			`No test type provided to initialize ${PatientTestResultsByTypeController.toString()}`);
		this.#patientTestResults.getTestResultsByType(testTypeSerNum)
			.then((results) => {
				this.#updateView(results);
			}).catch(this.#handlerServerError);
	};

	/**
	 * Configures the timeline results chart
	 */
	#configureChart = (test) => {
		const data = (test.hasNumericValues) ?
			test.results.map((testResult) => [testResult.collectedDateTime,
			testResult.testValue]) : [];
		Highcharts.setOptions(this.#labsChartConfigurationFactory.getChartLanguageOptions(this.#language));
		Highcharts.dateFormat(this.#labsChartConfigurationFactory.getDateFormat(this.#language));
		this.chartOptions = this.#labsChartConfigurationFactory.getChartConfiguration(data,
			this.#$filter("translate")("RESULT"),
			`(${test.unitDescription})`, test.normalRangeMin, test.normalRangeMax,
			this.#getAppFontSizeInPixels());
	};

	/**
	 * Updates the user view with the new server information for the TestType
	 * @param {TestType} testType contains TestType results. 
	 */
	#updateView = (results = null) => {
		this.#$timeout(() => {
			this.loading = false;
			if (results) {
				this.test = results;
				this.showChart = results.hasNumericValues;
				this.#configureChart(this.test);
			}
		});
	}
	/**
	 * Handles a response error from the server. Displays server error alert
	 * At the time, Opal does not have a logging mechanism for errors.
	 */
	#handlerServerError = (error) => {
		// TODO(dherre3) Add logging of error here
		this.loading = false;
		ons.notification.alert({
			//message: 'Server problem: could not fetch data, try again later',
			message: this.#$filter('translate')("SERVERERRORALERT"),
			modifier: (ons.platform.isAndroid()) ? 'material' : null
		});
	};

	/**
	 * Returns style declaration for the global fontSize of the app in pixels 
	 * @returns {CSSStyleDeclaration} returns style declaration for the global fontSize of the app in pixels
	 */
	#getAppFontSizeInPixels = () => {
		// TODO(dherre3) This should be managed by JavaScript in the user account service
		const elem = document.querySelector(`.fontDesc${this.#$filter("capitalize")(this.#fontSize)}`);
		return getComputedStyle(elem).fontSize;
	};
}

angular
	.module('MUHCApp')
	.controller('PatientTestResultsByTypeController', PatientTestResultsByTypeController);

PatientTestResultsByTypeController.$inject = ['PatientTestResults', 'UserPreferences', 'HcChartLabsConfiguration',
	'NavigatorParameters', 'Constants', '$filter', '$timeout'];