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
	#labsChartConfigurationFactory;
	#$timeout;
	#$filter;
	#browser;
	#profileSelector;
	#updateUI;


	/**
	 * Class constructor for controller
	 * @param {PatientTestResults} patientTestResults
	 * @param {UserPreferences} userPreferences
	 * @param {HcChartLabsConfiguration} hcChartLabsConfiguration
	 * @param {Navigator} navigator
	 * @param {$filter} $filter Angular filter
	 * @param {$timeout} $timeout Angular module
	 * @param {Browser} browser Browser service
	 * @param {ProfileSelector} profileSelector profile selector service
	 * @param {UpdateUI} updateUI update UI service
	 */
	constructor(patientTestResults, userPreferences, hcChartLabsConfiguration,
		navigator, $filter, $timeout, browser, profileSelector, updateUI) {
		this.#patientTestResults = patientTestResults;
		this.#language = userPreferences.getLanguage();
		this.#fontSize = userPreferences.getFontSize();
		this.#navigator = navigator.getNavigator();
		this.#$timeout = $timeout;
		this.#$filter = $filter;
		this.#labsChartConfigurationFactory = hcChartLabsConfiguration;
		this.#browser = browser;
		this.#profileSelector = profileSelector;
		this.#updateUI = updateUI;
		this.#initialize(this.#navigator.getCurrentPage().options);
	}

	/**
	 * Displays disclaimer modal for out-of-app links 
	 */
	showAboutTestAlert() {
		// TODO(dherre3) Centralize modals of this kind, create factory to manage all modals.
		disclaimerModal.show();
	}

	showLabDelayInfo() {
		this.#navigator.pushPage('./views/personal/test-results/test-results-info-labdelay.html');
	}

	/**
	 * Routing to EducationalMaterialURL for the test type
	 */
	goToUrl() {
		let url = this.test[`educationalMaterialURL_${this.#language}`];
		this.#browser.openInternal(url);
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
		// Non-numeric tests are not plotted (no data or axis label)
		const data = (test.hasNumericValues) ?
			test.results.map((testResult) => [testResult.collectedDateTime,
			testResult.testValue]) : [];
		const yAxisLabel = test.hasNumericValues ? test.unitWithBrackets : "";

		Highcharts.setOptions(this.#labsChartConfigurationFactory.getChartLanguageOptions(this.#language,
			test.hasNumericValues));
		Highcharts.dateFormat(this.#labsChartConfigurationFactory.getDateFormat(this.#language));
		this.chartOptions = this.#labsChartConfigurationFactory.getChartConfiguration(data,
			test.hasNumericValues,
			this.#$filter("translate")("RESULT"),
			yAxisLabel,
			test.normalRangeMin,
			test.normalRangeMax,
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

				// Updates testDates array in the patient-test-results service and in the patient-test-results view.
				// Since both arrays share the same reference, updating one will automatically update the other.
				// Once the arrays are updated, the UI will also be automatically updated (bolding on "By Date" tab).
				// NOTE: this.#updateUI.updateTimestamps('PatientTestDates', 0) will not work because it creates
				// an array with a new reference (e.g., setTestDates function in the service), so the array in the view
				// won't be automatically updated.
				// NOTE: default UpdateUI update call (e.g., PatientTestResults.updateTestDates) will return
				// only updated records that will result in incorrect readStatuses (the query in the listener
				// needs to aggregate the read statuses on all the testDates labs, not just on the updated ones).
				// To reload all testDates records from listener and update the existing array in the patient-test-results
				// service, set lastUpdated to 1 (e.g., updateTimestamps('PatientTestDates', 1)).
				this.#updateUI.updateTimestamps('PatientTestDates', 1);
				this.#updateUI.getData('PatientTestDates');

				let nonInterpretableDelay = this.#profileSelector.getActiveProfile().non_interpretable_lab_result_delay;
				let interpretableDelay = this.#profileSelector.getActiveProfile().interpretable_lab_result_delay;
				
				this.labDelay = this.test.interpretationRecommended ? nonInterpretableDelay : interpretableDelay;
				
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
	'Navigator', '$filter', '$timeout', 'Browser', 'ProfileSelector', 'UpdateUI'];
