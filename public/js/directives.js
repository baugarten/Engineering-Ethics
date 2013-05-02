'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('ngTooltip', function($timeout) {
    return function(scope, elm, attrs) {
      scope.$watch('post', function() {
        elm.find('span').tooltip();
      });
      scope.$watch('specialwords', function() {
        elm.find('span').tooltip();
      });
      /*$timeout(function() {
        $timeout(function() {
          elm.find('span').tooltip();
        });
      });*/
    };
  });
