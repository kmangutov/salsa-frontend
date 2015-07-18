'use strict';

/**
 * @ngdoc function
 * @name topazApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the topazApp
 */
angular.module('topazApp')
  .controller('MainCtrl', function ($scope, Facebook) {
    
    $scope.IntentLogin = function() {
      Facebook.login(function(response) {
        $scope.status = JSON.stringify(response);


        if(response.status == "connected") {
          $scope.accessToken = response.authResponse.accessToken;
          Facebook.api('/me/posts', function(response) {
            $scope.status = JSON.stringify(response);
            console.log(response);
          });


        } 
      });
    }

    $scope.IntentLogout = function() {
      Facebook.logout(function(response) {
        $scope.status = JSON.stringify(response);
      });
    }
  });
