// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   diagnosesService.js
 * Description  :   Service that store and manages the patient diagnosis information.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   02 Mar 2017
 */



var myApp=angular.module('OpalApp');
/**
*@ngdoc service
*@requires $filter
*@description Service stores and manages patient diagnoses
**/
myApp.service('Diagnoses', ['$filter', 'LocalStorage', function($filter, LocalStorage) {
  /**
     *@ngdoc property
    *@description Diagnoses main service array
    **/
    var diagnoses=[];
    /**
     *@ngdoc property
    *@description Local storage representation of diagnoses
    **/
    var diagnosesToLocalStorage=[];
    function searchAndDeleteDiagnoses(diag)
    {
      for (var i = 0; i < diag.length; i++) {
        for (var j = 0; j < diagnoses.length; j++) {
          if(diag[i].DiagnosisSerNum == diagnoses[j].DiagnosisSerNum)
          {
            diagnoses.splice(j, 1);
            diagnosesToLocalStorage.splice(j,1);
          }
        }
      }
    }

    function addDiagnosis(diag)
    {
      if(typeof diag=='undefined') return ;
      var temp=angular.copy(diag);
      diagnosesToLocalStorage.concat(temp);
      LocalStorage.WriteToLocalStorage('Diagnosis', temp);
      for (var i = 0; i < diag.length; i++) {
        diag[i].CreationDate=$filter('formatDate')(diag[i].CreationDate);
        diagnoses.push(diag[i]);
      }
      diagnoses=$filter('orderBy')(diagnoses, '-CreationDate');
    }
    return{
       /**
      *@ngdoc method
      *@name setDiagnoses
      *@param {Array} diag diagnoses array that contains all the patient diagnoses
      *@description Setter method for patient diagnoses
      **/
      setDiagnoses:function(diag)
      {
        diagnoses=[];
        diagnosesToLocalStorage=[];
        addDiagnosis(diag);
      },
       /**
      *@ngdoc method
      *@name updateDiagnoses
      *@param {Array} diag Finds diagnosis to update or adds new diagnosis if not found
      *@description Updates the diagnoses array with the new information contained in the diag parameter
      **/
      updateDiagnoses:function(diag)
      {
        searchAndDeleteDiagnoses(diag);
        addDiagnosis(diag);
      },
        /**
      *@ngdoc method
      *@name getDiagnoses
      *@description Getter for the diagnoses array
      *@returns {Array} Returns diagnoses array.
      **/
      getDiagnoses:function()
      {
        return diagnoses;
      },
      /**
    *@ngdoc method
    *@name clearDiagnoses
    *@description Clears the service of any saved state, function used by the {@link OpalApp.controller:LogoutController LogoutController}
    **/
      clearDiagnoses:function()
      {
          diagnoses=[];
          diagnosesToLocalStorage=[];
      }
    };
}]);
