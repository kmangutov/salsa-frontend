'use strict';

/**
 * @ngdoc function
 * @name topazApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the topazApp
 */


angular.module('topazApp')
  .controller('MainCtrl', function ($scope, $location, Facebook, SalsaService) {    

    var loadFb = function() {

      var structure = {};
      var id;

      console.log("loadFb()");
      Facebook.api('/me', function(response) {
        id = response.id;
        structure['id'] = response.id;
        structure['name'] = response.name;

        Facebook.api('/me/posts', function(response) {
          var data = response.data;

          console.log(data);
          structure['posts'] = [];
          data.forEach(function(post) {
            if(post.message) {
              structure['posts'].push(post.message);
            }
          });

          Facebook.api('/me/picture?height=200&width=200', function(response) {
            console.log(response);
            structure['photo'] = response.data.url;

          
            console.log("data structure: " + JSON.stringify(structure));

            SalsaService.postFbData(structure, id).success(function(data) {
              $location.path("/essay");
            }).error(function(data) {
              console.log("error: " + data);
            });
  
          });

          //TODO: call to service
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
