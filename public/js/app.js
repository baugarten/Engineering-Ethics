'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index', controller: IndexCtrl});
    $routeProvider.when('/vote', {templateUrl: 'partials/vote', controller: VoteCtrl});
    $routeProvider.when('/submit', {templateUrl: 'partials/submit', controller: SubmitCtrl});
    $routeProvider.when('/knowledgebase', {templateUrl: 'partials/knowledge', controller: KnowledgeCtrl});
    $routeProvider.otherwise({redirectTo: '/'});
    $locationProvider.html5Mode(true);
  }]);
