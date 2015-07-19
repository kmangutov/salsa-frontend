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

    var loadFb = function() {

      var structure = {};

      console.log("loadFb()");
      Facebook.api('/me', function(response) {
        structure['id'] = response.id;
        structure['name'] = response.name;

        Facebook.api('/me/posts', function(response) {
          var data = response.data;

          console.log(data);
          structure['posts'] = [];
          data.forEach(function(post) {
            console.log("###" + post.message);
            if(post.message) {
              structure['posts'].push(post.message);
            }
          });

          console.log("data structure: " + JSON.stringify(structure));
        });
      });
    }

    $scope.IntentLogin = function() {
      Facebook.login(function(response) {
        $scope.status = JSON.stringify(response);


        if(response.status == "connected") {
          $scope.accessToken = response.authResponse.accessToken;
          
          loadFb(Facebook);
          /*Facebook.api('/me/posts', function(response) {
            $scope.status = JSON.stringify(response);
            console.log(response);
          });*/


        } 
      });
    }

    $scope.IntentLogout = function() {
      Facebook.logout(function(response) {
        $scope.status = JSON.stringify(response);
      });
    }
  });
