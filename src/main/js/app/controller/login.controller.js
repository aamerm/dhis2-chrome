define(["md5"], function(md5) {
    return function($scope, $rootScope, $location, db, $q, userPreferenceRepository) {
        var getUser = function() {
            var userStore = db.objectStore("users");
            return userStore.find($scope.username.toLowerCase());
        };

        var getUserCredentials = function() {
            var userCredentialsStore = db.objectStore("localUserCredentials");
            var username = $scope.username.toLowerCase() === "admin" ? "admin" : "project_user";
            return userCredentialsStore.find(username);
        };

        var setLocale = function() {
            return userPreferenceRepository.get($rootScope.currentUser.userCredentials.username).then(function(data) {
                $rootScope.currentUser.locale = data ? data.locale : "en";
            });
        };

        var saveUserPreferences = function() {
            var userPreferences = {
                'username': $rootScope.currentUser.userCredentials.username,
                'locale': $scope.currentUser.locale,
                'orgUnits': $scope.currentUser.organisationUnits
            };
            userPreferenceRepository.save(userPreferences);
        };

        var authenticateOrPromptUserForPassword = function(data) {
            var user = data[0];
            var userCredentials = data[1];

            $scope.invalidCredentials = true;
            $scope.disabledCredentials = false;

            if (user && user.userCredentials.disabled) {
                $scope.disabledCredentials = true;
                $scope.invalidCredentials = false;
            } else if (user && md5($scope.password) === userCredentials.password) {
                $scope.invalidCredentials = false;
                $rootScope.isLoggedIn = true;
                $rootScope.currentUser = user;
                setLocale().then(saveUserPreferences);
                $location.path("/dashboard");
            }
        };


        $scope.login = function() {
            $q.all([getUser(), getUserCredentials()]).then(authenticateOrPromptUserForPassword);
        };
    };
});