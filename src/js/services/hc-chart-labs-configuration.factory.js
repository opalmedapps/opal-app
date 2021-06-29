
class HcChartLabsConfiguration{
	static CHART_DATE_SELECTED_DEFAULT = 4;
	#$filter;
	// TODO: Refactor chart preferences out of $rootScope
	#$rootScope;
	// TODO: Refactor this, these are translations not parameters.
	#appParams;

	constructor($filter, $rootScope, params) {
		this.#$filter = $filter;
		this.#$rootScope = $rootScope;
		this.#appParams = params;

	}
	getChartConfiguration(data, hasNumericValues, chartTitle, yAxisLabel, minNorm, maxNorm, fontsize){
		return this.#getChartConfiguration(data, hasNumericValues, chartTitle, yAxisLabel, fontsize, minNorm, maxNorm);
	}
	getDateFormat(language){
		return (language === "EN") ? '%a%e' : '%e%a';
	}
	getChartLanguageOptions(language, hasNumericValues){
		return {
			lang: this.#setChartLanguagePreferences(language, hasNumericValues),
			xAxis: {
				events: {
					afterSetExtremes: this.#afterSetExtremes
				}
			},
			rangeSelector: {
				/* Button id attribute is used to remember which button was pressed. It must match the index of
				 * the button in the buttons array to work properly.
				 * -SB */
				buttons: this.#getCharTimeButtonConfiguration(language)
			}
		};
	}
	/**
	 * afterSetExtremes
	 * @author re-written by Stacey Beard
	 * @date 2019-01-17
	 * @desc Saves the user's choice of Date Range when selecting a button on the chart (1m, 3m, 6m, 1y, All).
	 *       This is done by giving each button an id number that matches its index in the buttons array, and
	 *       saving this id number in $rootScope memory (as chartSelectedDateRange). The variable
	 *       chartSelectedDateRange is associated back to the chart in the chart option "rangeSelector: selected:"
	 *       to select the right button when returning to a chart.
	 *       This event is triggered (through HighCharts) when the chart extremes change, including when a Date
	 *       Range button is pressed.
	 * @param e (event)
	 */
	#afterSetExtremes = (e) => {
		// Only process the event e if it contains a rangeSelectorButton.
		// Otherwise, it is not relevant to this function.
		if (e && e.rangeSelectorButton) {
			const button = e.rangeSelectorButton;
			if (button.id === undefined) {
				console.log("Error: range selector button with text '" + button.text
					+ "' was not given an id attribute and will not be saved in memory.");
				console.log("Setting range selector to default.");
				this.#$rootScope.chartSelectedDateRange = HcChartLabsConfiguration.CHART_DATE_SELECTED_DEFAULT;
			} else {
				this.#$rootScope.chartSelectedDateRange = button.id;
			}
		}
	};
	/**
	 * setChartLanguagePreferences
	 * @param {string} language
	 * @param {boolean} hasNumericValues Whether this chart has numeric values (if not, it will be blank)
	 * @returns {{}}
	 */
	#setChartLanguagePreferences = (language, hasNumericValues) => {
		const lang = this.#$filter("capitalize")(language.toLowerCase());
		return {
			months: this.#appParams.monthsArray[`monthsArray${lang}`],
			weekdays: this.#appParams.daysArray[`daysArray${lang}`],
			shortMonths: this.#appParams.monthsArray[`monthsShort${lang}`],
			decimalPoint: '.',
			downloadPNG: this.#appParams.download[`imageDownloadPng${lang}`],
			downloadJPEG: this.#appParams.download[`imageDownloadJpeg${lang}`],
			downloadPDF: this.#appParams.download[`downloadPdf${lang}`],
			downloadSVG: this.#appParams.download[`downloadSvg${lang}`],
			exportButtonTitle: this.#appParams.exportButtonTitle[`exportButtonTitle${lang}`],
			loading: this.#appParams.loadingMessage[`loadingMessage${lang}`],
			printChart: this.#appParams.printChart[`printChart${lang}`],
			resetZoom: this.#appParams.resetZoom[`resetZoomMessage${lang}`],
			resetZoomTitle: this.#appParams.resetZoom[`resetZoomMessageTitle${lang}`],
			thousandsSep: ' ',
			rangeSelectorFrom: this.#appParams.rangeSelector[`rangeSelectorFrom${lang}`],
			rangeSelectorTo: this.#appParams.rangeSelector[`rangeSelectorTo${lang}`],
			rangeSelectorZoom: '',
			noData: !hasNumericValues ? this.#appParams.noPlotNonNumeric[`noPlotNonNumeric${lang}`]
				: this.#appParams.noPlotGeneric[`noPlotGeneric${lang}`],
		};
	};
	#getCharTimeButtonConfiguration = (language) => {
		return [{
			id: 0,
			type: 'month',
			count: 1,
			text: '1m'
		}, {
			id: 1,
			type: 'month',
			count: 3,
			text: '3m'
		}, {
			id: 2,
			type: 'month',
			count: 6,
			text: '6m'
		}, {
			id: 3,
			type: 'year',
			count: 1,
			text: (language === "EN") ? '1y' : '1a'
		}, {
			id: 4,
			type: 'all',
			text: (language === "EN") ? 'All' : 'Tout'
		}];
	};
	#getDataLimits=(data)=>{
		return data.map(val=>val[1]).reduce( (currentLimit, val)=> {
			return [Math.min(currentLimit[0],val), Math.max(currentLimit[1],val)];
		}, [data[0][1], data[0][1]]);
	};

	/**
	 * @name configureYAxisBound
	 * @author Stacey Beard
	 * @date 2021-05-14
	 * @desc Returns a minimum or maximum value used to configure the chart's y-axis bounds.
	 * @param {number} dataValue Min or max y-value from the chart's data points
	 * @param {number} rangeValue Min or max y-value from the lab test's normal range
	 * @param {function} comparisonFunction Math.min or Math.max, used to pick between dataValue or rangeValue
	 * @param {number} scalingFactor A factor by which to scale the result (so that the y-axis leaves some space
	 *                               above and below the largest and smallest data points)
	 * @returns {number} The computed min or max y-axis bound
	 */
	#configureYAxisBound = (dataValue, rangeValue, comparisonFunction, scalingFactor) => {
		let bound;
		if (isNaN(dataValue) && isNaN(rangeValue)) bound = NaN;
		else if (isNaN(dataValue)) bound = rangeValue;
		else if (isNaN(rangeValue)) bound = dataValue;
		else bound = comparisonFunction(dataValue, rangeValue);
		bound *= scalingFactor;
		return bound;
	};

	#getChartConfiguration=(data, hasNumericValues, chartTitle, yAxisLabel, fontSize, normalRangeMin, normalRangeMax) =>{
		const [ minValue, maxValue ] = (data.length > 0) ? this.#getDataLimits(data) : [NaN, NaN];
		const minChart = this.#configureYAxisBound(minValue, normalRangeMin, Math.min, 0.95);
		const maxChart = this.#configureYAxisBound(maxValue, normalRangeMax, Math.max, 1.05);
		const smallFontSize = fontSize.replace('px', '') - 5 + "px";
		return {
			exporting: false,
			rangeSelector: {
				enabled: hasNumericValues,
				selected: this.#$rootScope.chartSelectedDateRange,
				buttonTheme: {
					width: 'auto',
					style: {
						fontSize: fontSize
					}
				},
				labelStyle: {
					height: fontSize,
					fontSize: fontSize
				},
				buttonPosition: {
					align: "right",
					x: -3,
					y: 0
				},
				// Disable the date box input (from <date> to <date>) which causes display problems.
				inputEnabled: false
			},
			navigator: {
				margin: 5,
			},
			chart: {
				width: $(window).innerWidth(),
				marginRight: 15,
				height: null,
			},
			xAxis: {
				type: 'datetime',
				dateTimeLabelFormats: { // don't display the dummy year
					month: '%e %b %y',
					year: '%e %b %y'
				},
				minTickInterval: 3600 * 24 * 30 * 1000,//time in milliseconds
				minRange: 3600 * 24 * 30 * 1000,
				ordinal: false, //this sets the fixed time formats
				labels: {
					y: 20,
					rotation: -35,
					align: 'right',
					style: {
						fontSize: fontSize,
						textOverflow: false
					}
				}
			},
			yAxis: {
				max: hasNumericValues ? maxChart : null,
				min: hasNumericValues ? minChart : null,
				title: {
					align: 'high',
					text: yAxisLabel,
					style: {
						fontSize: smallFontSize,
						'text-anchor': 'start'
					},
					rotation: 0,
					y: -20,
					reserveSpace: false
				},
				opposite: false,
				labels: {
					style: {
						fontSize: fontSize,
						textOverflow: "ellipsis"
					}
				}
			},
			plotOptions: {
				series: {
					fillOpacity: 0.1
				}
			},
			series: [{
				name: chartTitle,
				data: data,
				marker: {
					enabled: true,
					radius: 3
				},
				type: 'area',
				color: 'rgba(21, 148, 187, 0.65)',
				pointWidth: 100,
				dataGrouping: {
					enabled: false, // Prevents clusters of results from being averaged when they are close together
				},
			}],
			noData: {
				style: {
					fontSize: fontSize,
					// Set the width of the "noData" message to prevent overflow off the edges of the screen
					width: '200%',
				}
			},
			time: {
				useUTC: false, // Ensures that the dates on the chart correspond to the dates in the table view
			},
		};
	};
}
angular
	.module('MUHCApp')
	.service('HcChartLabsConfiguration', HcChartLabsConfiguration);

HcChartLabsConfiguration.$inject = ['$filter', '$rootScope', 'Params'];
