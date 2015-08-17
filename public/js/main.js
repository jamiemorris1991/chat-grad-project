(function() {
    var app = angular.module("ChatApp", ["ngMaterial"]);

    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("indigo")
            .accentPalette("red");
    });

    app.controller("ChatController", function($scope, $http) {
        $scope.loggedIn = false;
        $scope.chatWindow = false;
        $scope.currentChat = "";

        $http.get("/api/user").then(function(userResult) {
            $scope.loggedIn = true;
            $scope.user = userResult.data;
            $http.get("/api/users").then(function(result) {
                $scope.users = result.data;
            });
        }, function() {
            $http.get("/api/oauth/uri").then(function(result) {
                $scope.loginUri = result.data.uri;
            });
        });

        $scope.chatWindow = false;

        $scope.openChat = function(user) {
            var chatObj = {
                user: user,
                messages: []
            };
            $scope.chatWindow = true;
            $scope.currentChat = chatObj;
        };

    });
})();
