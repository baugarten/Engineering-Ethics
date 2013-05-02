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
        $rootScope.$broadcast('currentChange', self.currentPost());
      });
    $http({method: 'GET', url: '/api/posts/unpublished'})
      .success(function(data, status, headers, config) {
        self.unpublished = data;
        $rootScope.$broadcast('unpublishedChange', self.unpublished);
        if (!self.current || !self.current._id) {
          var post = self.currentPost();

          $rootScope.$broadcast('currentChange', post);
        }
      });
      
    this.currentPost = function() {
      return (this.current && this.current._id && this.current) || 
             (this.unpublished && this.unpublished.length > 0 && this.unpublished[0]) || 
             {};
    };
    this.voting = function() {
      return this.unpublished;
    };
  })
  .service('knowledge', function($rootScope, $http) {
    var self = this;
    $http({method: 'GET', url: '/api/categories' })
      .success(function(data, status, headers, config) {
        self.categories = {};
        data.forEach(function(category) {
          self.categories[category.name] = category.items;
        });
        $rootScope.$broadcast('knowledgeChange', self.categories);
      });
    this.get = function() {
      return self.categories;
    };
  });
