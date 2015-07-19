'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the frontendApp
 */
angular.module('topazApp')
  .service('SalsaService', ['$http', function ($http) {
    var baseUrl = 'http://localhost:3000';
    var myId;

    this.postFbData = function(data, id) {
      var url = baseUrl + "/fb";
      myId = id;
      return $http.post(url, data);
    }

    this.postEssayData = function(data) {
      var url = baseUrl + "/reddit";
      data['id'] = myId;
      return $http.post(url, data);
    }

    this.getMatchData = function() {
      var url = baseUrl + "/match";
      return $http.get(url);
    }

  }]);