angular.module('OpalApp').config(QProviderConfiguration);

QProviderConfiguration.$inject = ['$qProvider'];

/* @ngInject */
function QProviderConfiguration($qProvider) {
	$qProvider.errorOnUnhandledRejections(false);
}
