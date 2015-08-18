var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

module.exports = function(port, db, githubAuthoriser) {
    var app = express();

    app.use(express.static("public"));
    app.use(cookieParser());
    app.use(bodyParser.json());

    var users = db.collection("users");
    var conversations = db.collection("conversations-jamiemorris1991");
    var sessions = {};

    app.get("/oauth", function(req, res) {
        githubAuthoriser.authorise(req, function(githubUser, token) {
            if (githubUser) {
                users.findOne({
                    _id: githubUser.login
                }, function(err, user) {
                    if (!user) {
                        // TODO: Wait for this operation to complete
                        users.insertOne({
                            _id: githubUser.login,
                            name: githubUser.name,
                            avatarUrl: githubUser.avatar_url
                        });
                    }
                    sessions[token] = {
                        user: githubUser.login
                    };
                    res.cookie("sessionToken", token);
                    res.header("Location", "/");
                    res.sendStatus(302);
                });
            }
            else {
                res.sendStatus(400);
            }

        });
    });

    app.get("/api/oauth/uri", function(req, res) {
        res.json({
            uri: githubAuthoriser.oAuthUri
        });
    });

    app.use(function(req, res, next) {
        if (req.cookies.sessionToken) {
            req.session = sessions[req.cookies.sessionToken];
            if (req.session) {
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/api/user", function(req, res) {
        users.findOne({
            _id: req.session.user
        }, function(err, user) {
            if (!err) {
                res.json(user);
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/users", function(req, res) {
        users.find().toArray(function(err, docs) {
            if (!err) {
                res.json(docs.map(function(user) {
                    return {
                        id: user._id,
                        name: user.name,
                        avatarUrl: user.avatarUrl
                    };
                }));
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/conversations", function (req, res) {
        conversations.find({
            between: req.session.user
        }).toArray(function(err, docs) {
            if (!err) {
                res.json(docs.map(function(conversation) {
                    return {
                        user: conversation.user,
                        lastMessage: conversation.lastMessage,
                        anyUnseen: conversation.anyUnseen
                    };
                }));
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/conversations/:user", function(req, res) {
        var theirId = req.params.user;
        var myId = req.session.user;

        conversations.find({
            between: {
                $all: [theirId, myId]
            }
        }).toArray(function(err, docs) {
            if (!err) {
                docs = docs.sort({sent: -1});
                res.json(docs.map(function(message) {
                    return {
                        from: message.between[0],
                        sent: message.sent,
                        body: message.body,
                        seen: message.seen || false
                    };
                }));
            }else {
                res.status(500);
            }
        });
    });

    app.post ("/api/conversations/:user", function(req, res) {
        conversations.insert({
            sent: req.params.date,
            body : req.params.body,
            seen: false,
        });
        res.sendStatus(201);
    });

    return app.listen(port);
};
