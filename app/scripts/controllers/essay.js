'use strict';

/**
 * @ngdoc function
 * @name topazApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the topazApp
 */


angular.module('topazApp')
  .controller('EssayCtrl', function ($scope, $location, Facebook) {    
    $scope.submitEssay = function() {
      var text = $scope.essay;
      $scope.essay = text + " " + text;

      $location.path("/list");

      //TODO: call to service
    }
  });
