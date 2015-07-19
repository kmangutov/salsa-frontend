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

    this.getPeople = function() {
      var url = baseUrl + "/people";
      return $http.get(url);
    }

    this.getPerson = function(id) {
      var url = baseUrl + "/people/" + id;
      return $http.get(url);
    }

    this.getCompare = function(idA, idB) {
      var url = baseUrl + "/compare";
      var data = {
        a: idA,
        b: idB
      };
      return $http.get(url, data);
    }

  }]);