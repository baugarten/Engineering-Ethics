'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
}

function IndexCtrl($scope, posts, $http) {
  $scope.post = posts.currentPost();
  $scope.frameworks = {
    'All': 2348399,
    'Utilitarian': 2351696,
    'Deontological': 2351699,
    'Feminist': 2351700,
    'Virtue': 2351697,
    'Chaos': 2351698
  };
  $scope.currentFramework = 'All';
  $scope.showing = $scope.frameworks[$scope.currentFramework];
  $scope.newcomment = {
    methodology: $scope.currentFramework,
    parent: $scope.post
  };
  $scope.$on('currentChange', function(ev, newpost) {
  if (!$scope.post || ($scope.newcomment.parent._id === $scope.post._id)) {
      $scope.newcomment.parent = newpost;
    }
    $scope.post = newpost;
  });

  $scope.toggleFramework = function(framework) {
    if (framework in $scope.frameworks) {
      $scope.currentFramework = framework;
      $scope.showing = $scope.frameworks[framework];
    }
  };
  $scope.showComment = function(meth) {
    if ($scope.currentFramework === 'All') return true;
    return meth.methodology && (meth.methodology.toLowerCase() === $scope.currentFramework.toLowerCase());
  };
  $scope.addComment = function() {
    $http.post('/api/posts/' + $scope.post._id + '/comment', $scope.newcomment)
      .success(function(data, status, headers, config) {
        $scope.post.comments = data.comments;
        $scope.newcomment = {
          methodology: $scope.currentFramework,
          parent: $scope.post
        };
      });
  };
  $scope.$watch('currentFramework', function(newval) {
    $scope.newcomment.methodology = newval;
  });
  $scope.reply = function(comment, show) {
    if (show) {
      $scope.replycomment = comment;
      $scope.newcomment.parent = comment;
    } else {
      $scope.replycomment = undefined;
      $scope.newcomment.parent = $scope.post;
    }
  };
  $scope.expand = function(comment, expand) {
    comment.expanded = expand;
    if (expand && comment.comments.length > 0 && 'string' === typeof comment.comments[0]) {
      $http.get('/api/comments/' + comment._id)
        .success(function(data, status, headers, config) {
          $scope.post.comments[$scope.post.comments.indexOf(comment)] = data;
          data.expanded = true;
        });
    }
  };
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

function KnowledgeCtrl($scope, $http) {
  $scope.knowledgebase = {}; //knowledgebase.get();
  $scope.toggleCategory = function(show) {
    $scope.shownewcategory = show;
    if (!$scope.newcategory) {
      $scope.newcategory = {};
    }
  };
  $scope.submit = function() {
    alert("Hello");
    $http.post('/api/categories')
      .success(function(data, status, headers, config) {
        $scope.knowledgebase[data.name] = data.terms;
      });
  };
}
