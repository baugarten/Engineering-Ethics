'use strict';

/* Controllers */

function AppCtrl($scope, $http) {
}

function IndexCtrl($scope, posts, $http, knowledge) {
  $scope.post = posts.currentPost();
  $scope.specialwords = [];
  var knowledgebase = knowledge.get();
  Object.keys(knowledgebase || {}).forEach(function(category) {
    $scope.specialwords = $scope.specialwords.concat(knowledgebase[category]);
  });
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
    $scope.updateComments();
  });
  $scope.$on('knowledgeChange', function(ev, knowledge) {
    $scope.specialwords = [];
    Object.keys(knowledge).forEach(function(category) {
      $scope.specialwords = $scope.specialwords.concat(knowledge[category]);
    });
    $scope.updateComments();
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
  $scope.$watch('post', $scope.updateComments);
  $scope.updateComments = function() {
    console.log("Update", $scope.post && $scope.post.comments && $scope.post.comments.length, $scope.specialwords.length);
    if ($scope.post.comments) {
      $scope.post.comments.forEach(function(comment) {
        console.log($scope.specialwords);
        $scope.specialwords.forEach(function(word) {
          comment.body = comment.body.replace(new RegExp(word.name, 'ig'), "<span data-toggle='tooltip' title='" + word.definition + "'>" + word.name + "</span>");
        });
      });
    }
  };
  $scope.$on('$viewContentLoaded', function() {
    $('.body span').tooltip(); 
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

function KnowledgeCtrl($scope, $http, knowledge) {
  $scope.knowledgebase = knowledge.get();
  $scope.toggleCategory = function(show) {
    $scope.shownewcategory = show;
    if (!$scope.newcategory) {
      $scope.newcategory = {};
    }
  };
  $scope.submit = function() {
    $http.post('/api/categories', $scope.newcategory)
      .success(function(data, status, headers, config) {
        $scope.knowledgebase[data.name] = data.terms;
      });
  };
  $scope.$on('knowledgeChange', function(ev, knowledge) {
    $scope.knowledgebase = knowledge;
  });
  $scope.addItem = function(category) {
    $scope.shownewitem = category;
    $scope.newitem = {
      category: category
    };
  };
  $scope.hideItem = function(category) {
    $scope.shownewitem = false;
  };
  $scope.submitNewItem = function() {
    var category = $scope.newitem.category;
    $http.post('/api/categories/item', $scope.newitem)
      .success(function(data, status, headers, config) {
        $scope.knowledgebase[category] = data.items;
        $scope.newitem = false;
      });
  };
}
