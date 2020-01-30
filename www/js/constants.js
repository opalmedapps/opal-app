(function() {
    'use strict'

    var app = angular.module('MUHCApp');

    app.value('Params', {
        /** Multi-institutional hospital name **/
        hospitalList: {
            'MUHC': {
                acronym: 'MUHC',
                fullName: 'MUHC_FULL',
            },
            'CHUM': {
                acronym: 'CHUM_ACRONYM',
                fullName: 'CHUM_FULL',
            },
            'HMR': {
                acronym: 'HMR_ACRONYM',
                fullName: 'HMR_FULL',
            },
            'SMHC': {
                acronym: 'SMHC_ACRONYM',
                fullName: 'SMHC_FULL',
            },
            'CHU_SJ': {
                acronym: 'CHU_SJ_ACRONYM',
                fullName: 'CHU_SJ_FULL',
            },
            'Cite-de-la-sante': {
                acronym: 'CITE_ACRONYM',
                fullName: 'CITE_FULL',
            },
            'RI-MUHC':{
                acronym: 'RI_MUHC_ACRONYM',
                fullName: 'RI_MUHC_FULL',
            }
        }

    });
}) ();


