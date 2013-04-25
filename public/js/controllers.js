'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
}

function IndexCtrl($scope, posts) {
  $scope.post = posts.currentPost();
  $scope.$on('currentChange', function(newpost) {
    $scope.post = newpost;
  });
}


function VoteCtrl($scope, posts) {
  $scope.unpublished = posts.voting();
  $scope.$on('unpublishedChange', function(ev, newvoting) {
    $scope.unpublished = newvoting;
  });
}

function SubmitCtrl($scope, $location, $http) {
  $scope.submit = function(ev) {
    $http.post('/api/posts', {
      url: $scope.url,
      description: $scope.description
    })
    .success(function(data, status, headers, config) {
      $location.path('/vote');
    });
    
  };  

}
