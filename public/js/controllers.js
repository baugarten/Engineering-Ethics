'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
}

function IndexCtrl($scope, posts) {
  $scope.post = posts.currentPost();
  $scope.$on('currentChange', function(ev, newpost) {
    $scope.post = newpost;
  });
}


function VoteCtrl($scope, $http, posts) {
  $scope.unpublished = posts.voting();
  $scope.$on('unpublishedChange', function(ev, newvoting) {
    $scope.unpublished = newvoting;
  });

  $scope.vote = function(article, up) {
    // We don't really care if this succeeds or not...
    $http.post('/api/posts/' + article._id + '/vote', {
      up: up
    });
    article.votes += (up) ? 1 : -1;
  };
}

function SubmitCtrl($scope, $location, $http) {
  $scope.post = {};
  $scope.post.questions = [{}];
  $scope.submit = function(ev) {
    $http.post('/api/posts', $scope.post)
      .success(function(data, status, headers, config) {
        $location.path('/vote');
      });
  };  
  $scope.addQuestion = function() {
    $scope.post.questions.push({});
  };
  $scope.removeQuestion = function(index) {
    $scope.post.questions.splice(index, 1);
  };
}
