(function() {
    var app = angular.module("ChatApp", ["ngMaterial"]);

    app.controller("ChatController", function($scope, $http) {
        $scope.loggedIn = false;

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
            }
        );

        $scope.openDialog = function(event) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title('Chat Window')
                    .content('This will Be a chat Dialog')
                    .ariaLabel('Secondary click demo')
                    .ok('Neat!')
                    .targetEvent(event)
            );
        };


    });
})();
