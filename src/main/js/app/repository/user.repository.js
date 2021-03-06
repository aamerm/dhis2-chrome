define(["lodash"], function(_) {
    return function(db) {
        this.upsert = function(user) {
            var dhisUser = _.cloneDeep(user);
            dhisUser.userCredentials = _.omit(dhisUser.userCredentials, "password");
            var store = db.objectStore("users");
            return store.upsert(dhisUser).then(function() {
                return user;
            });
        };

        this.getAllUsernames = function() {
            var store = db.objectStore("users");
            return store.getAll().then(function(users) {
                var userCredentials = _.pluck(users, "userCredentials");
                return _.pluck(userCredentials, "username");
            });
        };

        this.getAllProjectUsers = function(project) {
            var filterProjectUsers = function(allUsers) {
                return _.filter(allUsers, {
                    "organisationUnits": [{
                        'id': project.id
                    }]
                });
            };
            var store = db.objectStore("users");
            return store.getAll().then(filterProjectUsers);
        };
    };
});