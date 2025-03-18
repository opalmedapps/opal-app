// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').config(QProviderConfiguration);

QProviderConfiguration.$inject = ['$qProvider'];

/* @ngInject */
function QProviderConfiguration($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}
