(function() {
    var app = angular.module("ChatApp", ["ngMaterial"]);

    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("indigo")
            .accentPalette("red");
    });

    app.controller("conversationController", function($scope, $http) {
        $scope.loggedIn = false;
        $scope.conversationWindow = false;
        $scope.currentConversation = "";
        $scope.inactiveUsers = [];
        $scope.conversations = [];
        $scope.messageBody = "";

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

        $scope.getConversations = function() {
            $http.get("/api/conversations").then(function (data) {
                data.data.forEach(function(conversation) {
                    var user = $scope.$getUserById(conversation.user);

                    var thisChat = $scope.activeChats.filter(function (conversation) {
                        return conversation.user === user;
                    });

                    if (thisChat.length === 0){
                        $scope.conversations.push({
                            user: $scope.$getUserById(conversation.user)
                        });
                    }
                });
            });
        };

        $scope.$getUserById = function (userId) {
            return $scope.users.filter(function (user) {
                return user.id === userId;
            })[0];
        };

        $scope.openConversation = function(user) {
            var conversationObj = {
                user: user,
                messages: []
            };
            $scope.conversationWindow = true;
            $scope.currentConversation = conversationObj;
            var userConversations = $scope.conversations.filter(function(currentconversation) {
                return currentconversation.user === user;
            }).length;
            if (userConversations !== 0) {
                $scope.conversations.push(currentConversation);
            } else {

            }
            //$scope.getConversation($scope.currentConversation.user.id);
        };

        $scope.getConversation = function (userId) {
            $http.get("/api/conversations/" + userId).then(function (result) {
               $scope.conversations.push(result.data);
            });
        };

        $scope.sendMessage = function(conversation) {
            var receiverID = conversation.user.id;
            var message = {
                sent: new Date().valueOf(),
                body: conversation.currentMessage,
                seen : false,
            };
            $http.post("api/conversations/" + receiverID, message);
            message.sender = $scope.user;
            conversation.messages.push(message);
            conversation.currentMessage = "";
            $scope.conversations.push(conversation);
        };

    });

    app.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $mdUtil, $log) {
        $scope.toggleLeft = buildToggler("left");
        $scope.toggleRight = buildToggler("right");
        /**
         * Build handler to open/close a SideNav; when animation finishes
         * report completion in console
         */
        function buildToggler(navID) {
            var debounceFn =  $mdUtil.debounce (function() {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            },200);
            return debounceFn;
        }
    });

    app.controller("LeftCtrl", function ($scope, $timeout, $mdSidenav, $log) {
        $scope.close = function () {
            $mdSidenav("left").close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
    });

    app.controller("DemoCtrl", function($mdDialog) {
        var self = this;
        self.hidden = false;
        self.openDialog = function($event, item) {
            // Show the dialog
            $mdDialog.show({
                clickOutsideToClose: true,
                controller: function($mdDialog) {
                    // Save the clicked item
                    this.item = item;
                    // Setup some handlers
                    this.close = function() {
                        $mdDialog.cancel();
                    };
                    this.submit = function() {
                        $mdDialog.hide();
                    };
                },
                controllerAs: "dialog",
                templateUrl: "dialog.html",
                targetEvent: $event
            });
        }
    });

})();
