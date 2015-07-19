'use strict';

/**
 * @ngdoc function
 * @name topazApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the topazApp
 */


angular.module('topazApp')
  .controller('EssayCtrl', function ($scope, $location, Facebook, SalsaService) {    
    $scope.submitEssay = function() {
      var text = $scope.essay;

      var data = {
        name: text
      };
      SalsaService.postRedditData(data).success(function(response) {
        $location.path("/list");
      }).error(function(response) {
        console.log("error: " + response);
      });

      //TODO: call to service
    }
  });
