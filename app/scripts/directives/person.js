


angular.module('topazApp')
  .directive('person', function () {
    return {
      restrict: 'E',
      templateUrl: "views/directive-person.html",
      scope: {
        id: '@'
      },
      controller: function($scope) {
        $scope.name = "Kirill";
        $scope.pictureUrl = "https://scontent-lax1-1.xx.fbcdn.net/hphotos-xfp1/v/t1.0-9/1607113_491012347714488_7875067251027324117_n.jpg?oh=28d7fd64ad76d919a75ee7a2994892f8&oe=564D2002";

      }
    };
  });    
