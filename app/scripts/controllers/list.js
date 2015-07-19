'use strict';

/**
 * @ngdoc function
 * @name topazApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the topazApp
 */


angular.module('topazApp')
  .controller('ListCtrl', function ($scope, $location, Facebook, SalsaService) {    
    
      SalsaService.getMatchData().success(function(response) {
        console.log("GOT MATCH DATA: " + response);
      }).error(function(response) {
        console.log("error: " + response);
      });
  });
