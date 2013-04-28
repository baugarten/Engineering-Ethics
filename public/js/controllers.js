'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
}

function IndexCtrl($scope, posts) {
  $scope.post = posts.currentPost();
  $scope.frameworks = {
    'All': 2348399,
    'Utilitarian': 2351696,
    'Deontological': 2351699,
    'Feminist': 2351700,
    'Virtue': 2351697,
    'Chaos': 2351698
  };
  $scope.showing = $scope.frameworks['All'];
  $scope.$on('currentChange', function(ev, newpost) {
    $scope.post = newpost;
  });

  $scope.toggleFramework = function(framework) {
    $scope.showing = $scope.frameworks[framework];
    loadDisqus($scope.showing);
  };
}

function loadDisqus(category) {
  var shortname = 'etike',
      disqus_category_id = category;
  (function() {
      var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
      dsq.src = '//' + shortname + '.disqus.com/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
  })();

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
