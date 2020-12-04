
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
	getChartConfiguration(data, chartTitle, yAxisLabel, minNorm, maxNorm, fontsize){
		return this.#getChartConfiguration(data, chartTitle, yAxisLabel, fontsize, minNorm, maxNorm);
	}
	getDateFormat(language){
		return (language === "EN") ? '%a%e' : '%e%a';
	}
	getChartLanguageOptions(language){
		return {
			lang: this.#setChartLanguagePreferences(language),
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
				this.#$rootScope.chartSelectedDateRange = HcChartConfiguration.CHART_DATE_SELECTED_DEFAULT;
			} else {
				this.#$rootScope.chartSelectedDateRange = button.id;
			}
		}
	};
	/**
	 *
	 * @param {string} language
	 * @returns {{}}
	 */
	#setChartLanguagePreferences = (language) => {
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
			noData: this.#appParams.noDataAvailable[`noDataAvailable${lang}`],
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

	#getChartConfiguration=(data, chartTitle, yAxisLabel, fontSize, normalRangeMin, normalRangeMax) =>{
		const [ minValue, maxValue ] = (data.length>0)?this.#getDataLimits(data): [0,0];
		const minChart = Math.min(minValue, normalRangeMin)*0.95;
		const maxChart = Math.max(maxValue, normalRangeMax)*1.05;
		return {
			exporting: false,
			rangeSelector: {
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
					// align: "right", // This feature will be available after updating Highcharts.
					/* Computing the position of the range buttons depending on the text size.
					 * The best result was produced by 70 px for all font sizes. The if statements were left for
					 * future customization.
					 */
					x: 70,
					y: 10
				},
				// Disable the date box input (from <date> to <date>) which causes display problems.
				inputEnabled: false
			},
			navigator: {
				margin: 5,
			},
			chart: {
				// Explicitly tell the width and height of a chart
				width: $(window).width()-10,
				height: null
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
				// title: {
				//     text: 'Date',
				//     style: {
				//         fontSize: fontSize
				//     }
				// },
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
				max: maxChart*1.05,
				min: minChart*0.95,
				title: {
					align: 'high',
					text: yAxisLabel,
					style: {
						'text-anchor': 'start'
					},
					rotation: 0,
					y: -10,
					reserveSpace: false
				},
				opposite: false,
				// plotLines: [{
				//     color: 'rgba(246, 54, 92, 0.53)',
				//     value: normalRangeMax,
				//     dashStyle: 'Solid',
				//     width: 2
				// },{
				//     color: 'rgba(246, 54, 92, 0.53)',
				//     value: normalRangeMin,
				//     dashStyle: 'Solid',
				//     width: 2
				// }],
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
				tooltip: {
					valueDecimals: 2
				}
			}]
		};
	};
}
angular
	.module('MUHCApp')
	.service('HcChartLabsConfiguration', HcChartLabsConfiguration);

HcChartLabsConfiguration.$inject = ['$filter', '$rootScope', 'Params'];
