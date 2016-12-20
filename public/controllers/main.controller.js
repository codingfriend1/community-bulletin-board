window.app.controller("main", ['$scope', 'helpers', '$timeout', function($scope, helpers, $timeout) {


    $scope.filterOptions = [
      "popularity",
      "title",
      "date created"
    ];

    $scope.isLoggedIn = false;
    $scope.currentUser = "";
    $scope.filterBy = "date created";
    $scope.asc = "false";

    $scope.fetchArticles = function() {
      var asc = $scope.asc === "true"? "1": "-1";
      var chosenFilter = { "createdAt": asc };

      switch ($scope.filterBy) {
        case "popularity":
          chosenFilter = { "votes": asc };
          break;
        case "title":
          chosenFilter = { "title": asc };
          break;
        case "date created":
          chosenFilter = { "createdAt": asc };
          break;
        default:
      }

      var query = { "$sort": chosenFilter,  };

      if($scope.findTag) {
        query = Object.assign({ "$sort": chosenFilter,  }, { tags: {text: $scope.findTag } })
      }

      api.articles.find(query).then(function(response) {
        $timeout(function() {
          $scope.articles = response;
        });

      });
    };

    $scope.fetchArticles();

    // Check if the user is logged in
    window.feathers.authenticate().then((response) => {
      $timeout(function() {
        $scope.currentUser = response.data.email;
        $scope.isLoggedIn = true;
      });
    }).catch((err) => {
      $timeout(function() {
        $scope.isLoggedIn = false;
        $scope.currentUser = "";
      });
    });

    $scope.creationResponse = "";
    $scope.responseClass = "";
    $scope.email = "";
    $scope.password = "";
    $scope.tags = [{text: "Personal"}];

    var MESSAGE_TIME = 3 * 1000;

    // Removes server response message after a given amount of time
    function resetResponse() {
      $timeout(function() {
        $scope.creationResponse = "";
        $scope.responseClass = "";
        $scope.authenticateResponse = "";
        $scope.authenticateResponseClass = "";
      }, MESSAGE_TIME);
    }

    // Checks that a password and email are set
    function validateEmailAndPassword() {
      if(!$scope.email || !$scope.password) {
        $timeout(function() {
          $scope.authenticateResponse = "Please enter an email and password";
          $scope.authenticateResponseClass = "alert-info";
          resetResponse();
        });
        return false;
      }

      return true;
    }

    $scope.createArticle = function() {

      if(!$scope.title || !$scope.text) {
        $timeout(function() {
          $scope.creationResponse = "Please enter a title and body.";
          $scope.responseClass = "alert-warning";
          resetResponse();
        });
        return false;
      }

      $scope.url = '/' + helpers.convertUrlToTitle($scope.title);

      api.articles.create({
        title: $scope.title,
        body: $scope.text,
        url: $scope.url,
        tags: $scope.tags
      }).then(function(response) {

        $timeout(function() {
          console.log('Successfully created a new blog article', response);
          $scope.creationResponse = "Article successfully created";
          $scope.responseClass = "alert-success";
          resetResponse();

          $scope.title = "";
          $scope.text = ""
          $scope.url = "";
          $scope.tags = "";
          $scope.articles.push(response);
        });

      }).catch((err) => {
        $timeout(function() {
          console.log("Failed to create a new article", err);
          $scope.creationResponse = "Sorry, but the article couldn't be created. " + err.message;
          $scope.responseClass = "alert-danger";
          resetResponse();
        });
      });
    }

    $scope.deleteArticle = function(article) {
      var answer = window.confirm("Are you sure you want to delete this article?");
      if(answer) {
        article.editMode = false;
        feathers.service('articles').remove(article._id).then(function(response) {
          $timeout(function() {
            toastr.success("Successfully deleted the article.");
            $scope.articles.splice($scope.articles.indexOf(article), 1);
          });
        }, function(err) {
          toastr.error("Could not delete the article. " + err.message);
        });
      }
    };

    $scope.editArticle = function(article) {
      article.original = angular.copy(article);
      article.editMode = true;
      article.editTags = angular.copy(article.tags);
    };

    $scope.saveEdits = function(article) {
      api.articles.updateOne(article._id, {title: article.title, body: article.body, tags: article.editTags}).then(function(response) {
        toastr.success('Article was successfully updated.');
        $timeout(function() {
          article.editMode = false;
          article.original = undefined;
          article.tags = angular.copy(article.editTags);
          article.editTags = undefined
        });

      }, function(err) {
        toastr.error(err.message);
        article = article.original;
        article.editMode = false;
        article.editTags = undefined;
      });
    };

    $scope.cancelEdits = function(article) {
      article.editMode = false;
      var index = $scope.articles.indexOf(article);
      if(index !== -1) {
        $scope.articles[index] = article.original;
        article.editTags = undefined;
      }
    };

    $scope.login = function() {

      if(!validateEmailAndPassword()) {
        return false;
      }

      window.feathers.authenticate({
        type: 'local',
        email: $scope.email,
        password: $scope.password
      }).then(function(response) {
        console.log('Successfully signed in', response);
        $timeout(function() {
          $scope.authenticateResponse = "You are logged in";
          $scope.authenticateResponseClass = "alert-success";
          $scope.currentUser = response.data.email;
          $scope.isLoggedIn = true;
        });
      }).catch((err) => {
        $timeout(function() {
          console.log("Failed to login", err);
          $scope.authenticateResponse = "Sorry, but you could not login. " + err.message;
          $scope.authenticateResponseClass = "alert-danger";
          resetResponse();
        });
      });
    };

    $scope.signup = function() {

      if(!validateEmailAndPassword()) {
        return false;
      }

      window.feathers.service("users").create({
        email: $scope.email,
        password: $scope.password
      }).then(function(response) {
        window.feathers.authenticate({
          type: 'local',
          email: $scope.email,
          password: $scope.password
        }).then(function(response) {
          $timeout(function() {
            console.log('Successfully created an account', response);
            $scope.authenticateResponse = "You are successfully signed in";
            $scope.authenticateResponseClass = "alert-success";
            $scope.isLoggedIn = true;
            $scope.currentUser = response.data.email;
          });
        }).catch((err) => {
          toastr.warning("There was an error logging you in.");
        });
      }).catch((err) => {
        toastr.error("Sorry, but you could not signup. " + err.message);
      });
    };

    $scope.logout = function() {
      window.feathers.logout().then(function(response) {
        $timeout(function() {
          $scope.isLoggedIn = false;
          $scope.currentUser = "";
          resetResponse();
        });
      });
    };

    $scope.upvote = function(article) {
      api.articles.updateOne(article._id, { $inc: {"votes": 1 } }).then(function(response) {
        $timeout(function() {
          article.votes++;
        });
      }, function(err) {
        toastr.warning(err.message);
      });
    };

    $scope.downvote = function(article) {
      api.articles.updateOne(article._id, { $inc: {"votes": -1 } }).then(function(response) {
        $timeout(function() {
          article.votes--;
        });
      }, function(err) {
        toastr.warning(err.message);
      });
    };
}]);
