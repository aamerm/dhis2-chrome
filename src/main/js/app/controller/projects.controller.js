define(["toTree"], function(toTree) {
    return function($scope, db, projectsService, $q) {
        $scope.organisationUnits = [];

        var reset = function() {
            $scope.openCreateForm = false;
        };

        var getAll = function(storeName) {
            var store = db.objectStore(storeName);
            return store.getAll();
        };

        var save = function(args) {
            var orgUnits = args[0];
            $scope.orgUnitLevelsMap = _.transform(args[1], function(result, orgUnit) {
                result[orgUnit.level] = orgUnit.name;
            }, {});
            $scope.organisationUnits = toTree(orgUnits);
        };

        var init = function() {
            reset();
            $q.all([getAll("organisationUnits"), getAll("organisationUnitLevels")]).then(save);
        };

        $scope.onOrgUnitSelect = function(orgUnit) {
            reset();
            $scope.orgUnit = orgUnit;
        };

        $scope.save = function(orgUnit) {
            var onSuccess = function() {
                $scope.saveSuccess = true;
            };

            var onError = function() {
                $scope.saveSuccess = false;
            };

            return projectsService.create(orgUnit).then(onSuccess, onError);
        };

        $scope.getNextLevel = function(orgUnit) {
            return orgUnit ? $scope.orgUnitLevelsMap[orgUnit.level + 1] : undefined;
        };

        $scope.canCreateChild = function(orgUnit) {
            return _.contains(["Country", "Project"], $scope.getNextLevel(orgUnit));
        };

        init();
    };
});