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

        $scope.messageBody = "";

        $http.get("/api/user").then(function(userResult) {
            $scope.loggedIn = true;
            $scope.user = userResult.data;
            $http.get("/api/users").then(function(result) {
                $scope.users = result.data;
            });
            $http.get("/api/conversations").then(function(result) {
                $scope.conversations = result.data;
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
        $scope.sendMessage = function(user, message) {
            var message = $scope.messageBody;
            var converstationID = user.id;
            $http.post("api/conversations/" + converstationID, {
                sent: new Date.valueOf(),
                body: message,
                seen : false,
                to: converstationID,
            }).then(function(result) {

            });

        };

    });
})();
