'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  service('posts', function($rootScope, $http) {
    var self = this;
    $http({method: 'GET', url: '/api/posts/current'})
      .success(function(data, status, headers, config) {
        self.current = data;
        $rootScope.$broadcast('currentChange', self.current);
      });
    $http({method: 'GET', url: '/api/posts/unpublished'})
      .success(function(data, status, headers, config) {
        self.unpublished = data;
        $rootScope.$broadcast('unpublishedChange', self.unpublished);
      });
      
    this.currentPost = function() {
      return this.current || {};
    };
    this.voting = function() {
      return this.unpublished;
    };
  });
