// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').config(ImageSanitation);

ImageSanitation.$inject = [ '$compileProvider' ];
/* @ngInject */
function ImageSanitation($compileProvider){
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|app):|data:image\//);
}
