'use strict';

$(document).foundation();

/**
 * @ngdoc overview
 * @name topazApp
 * @description
 * # topazApp
 *
 * Main module of the application.
 */
angular
  .module('topazApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'facebook'
  ])
  .config(function ($routeProvider, FacebookProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/list', {
        templateUrl: 'views/list.html',
        controller: 'ListCtrl',
      })
      .when('/essay', {
        templateUrl: 'views/essay.html',
        controller: 'EssayCtrl'
      })
      .when('/detail', {
        templateUrl: 'views/detail.html',
        controller: 'DetailCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    FacebookProvider.init('1490452234541375');
  });
