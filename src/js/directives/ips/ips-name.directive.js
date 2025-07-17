// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// Based on: https://github.com/jddamore/IPSviewer/blob/main/src/lib/components/resource-templates/Patient.svelte

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('ipsName', IPSName);

    IPSName.$inject = [];

    function IPSName() {
        return {
            restrict: 'E',
            scope: {
                "resource": "=",
            },
            template: `<ips-panel-inner>
                           <ips-badge ng-if="resource.use">{{resource.use}}</ips-badge>
                           <ips-badge ng-if="resource.period">{{namePeriod}}</ips-badge>
                           {{patientName}}
                       </ips-panel-inner>`,

            link: function(scope) {
                let name = scope.resource;

                // Construct the name for display
                // If name.text is available, use it; "Systems that operate across cultures should generally rely on the text form for presentation and use the parts for index/search functionality."
                // See: https://build.fhir.org/datatypes.html#HumanName
                if (name.text) scope.patientName = name.text;
                else {
                    let nameList = []
                        .concat(name.prefix)
                        .concat(name.given)
                        .concat(name.family)
                        .concat(name.suffix)
                    scope.patientName = nameList.join(' ');
                }

                scope.namePeriod = `${name.period?.start || '??'} – ${name.period?.end || '??'}`;
            }
        }
    }
})();
