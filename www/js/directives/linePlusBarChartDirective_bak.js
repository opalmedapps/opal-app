angular.module('MUHCApp')
  .factory('d3', [function() {
    return d3;
  }])

  .factory('nv', [function() {
    return nv;
  }])

  .directive('linePlusBarChart', ['d3', 'nv', function(d3, nv) {
    return {
      restrict: 'E',
      scope: {
        // Bind the data to the directive scope.
        data: '=',
        // Allow the user to change the dimensions of the chart.
        height: '@',
        width: '@'
      },
      // The svg element is needed by D3.
      template: '<svg ng-attr-height="{{ height }}" ng-attr-width="{{ width }}"></svg>',
      link: function(scope, element) {
        var svg = element.find('svg'),
          chart;

        // This function is called when the data is changed.
        var update = function() {
          d3.select(svg[0])
            .datum(scope.data)
            .transition().duration(500)
            .call(chart);
        };

        // Render the chart every time the data changes.
        // The data is serialized in order to easily check for changes.
        scope.$watch(function() { return angular.toJson(scope.data); }, function() {
          // The chart may not have been initialized at this point so we need
          // to account for that.
          if (chart) {
            update();
          }
        });

        // The chart can not be rendered at once, since the chart
        // creation is asynchronous.
        scope.$on('chartinit', update);

        var maxRange = scope.data[0].values[0].y;

        nv.addGraph(function() {
          // This code is the same as the example before.
          chart = nv.models.lineChart();

          chart.xAxis
            .tickFormat(d3.format(',r'))
          ;
          chart.yAxis
            .tickFormat(d3.format('.02f'))
          ;


          nv.utils.windowResize(function() {
            chart.update()
          });
          chart.forceY([0, maxRange*1.25]);

          // Emit an event so we can know that the
          // chart has been initialized.
          scope.$emit('chartinit');

          return chart;
        });
      }
    }
  }]);
