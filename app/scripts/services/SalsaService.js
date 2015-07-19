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
    var baseUrl = 'http://localhost:3000/api';

    this.get = function(portfolio_id) {
      return $http.get(baseUrl + '/portfolio/' + portfolio_id + '/asset');
    }

    this.post = function(portfolio_id, user, symbol) {
      var data = {
        user: user,
        symbol: symbol
      };

      var url = baseUrl + '/portfolio/' + portfolio_id + '/asset';

      console.log('Post to ' + url + ' data: ' + JSON.stringify(data));

      return $http.post(url, data);
    }

    this.upvote = function(portfolio_id, up_data) {
      return $http.post(baseUrl + '/portfolio/' + portfolio_id + '/upvote', up_data);
    }

    this.downvote = function(portfolio_id, down_data) {
      return $http.post(baseUrl + '/portfolio/' + portfolio_id + '/downvote', down_data);
    }

  }]);