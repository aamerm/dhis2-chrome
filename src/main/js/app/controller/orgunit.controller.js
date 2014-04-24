define(["toTree", "lodash", "md5", "moment"], function(toTree, _, md5, moment) {
    return function($scope, db, projectsService, $q, $location, $timeout, $anchorScroll) {
        var templateUrlMap = {
            'Company': 'templates/partials/project-form.html',
            'Operational Center': 'templates/partials/project-form.html',
            'Country': 'templates/partials/project-form.html',
            'Project': 'templates/partials/create-project.html',
            'Module': 'templates/partials/module-form.html',
            'Operation Unit': 'templates/partials/op-unit-form.html'
        };

        $scope.organisationUnits = [];

        $scope.maxDate = new Date();

        $scope.reset = function() {
            $scope.newOrgUnit = {
                'openingDate': new Date()
            };
            $scope.saveFailure = $scope.saveSuccess = false;
            $scope.openCreateForm = false;
        };

        var getAll = function(storeName) {
            var store = db.objectStore(storeName);
            return store.getAll();
        };

        var selectCurrentNode = function(transformedOrgUnits) {
            if (!transformedOrgUnits.selectedNode)
                return;

            $scope.state = {
                "currentNode": transformedOrgUnits.selectedNode
            };
            $scope.onOrgUnitSelect(transformedOrgUnits.selectedNode);
            $scope.saveSuccess = true;
            $timeout(function() {
                $scope.saveSuccess = false;
            }, 3000);
        };

        var transformToTree = function(nodeToBeSelected, args) {
            var orgUnits = args[0];
            $scope.orgUnitLevelsMap = _.transform(args[1], function(result, orgUnit) {
                result[orgUnit.level] = orgUnit.name;
            }, {});
            var transformedOrgUnits = toTree(orgUnits, nodeToBeSelected);
            $scope.organisationUnits = transformedOrgUnits.rootNodes;
            selectCurrentNode(transformedOrgUnits);
        };

        var init = function() {
            $scope.reset();
            var selectedNodeId = $location.hash();
            $q.all([getAll("organisationUnits"), getAll("organisationUnitLevels")]).then(_.curry(transformToTree)(selectedNodeId));
        };

        var scrollToTop = function() {
            $location.hash();
            $anchorScroll();
        };

        $scope.onOrgUnitSelect = function(orgUnit) {
            $scope.reset();
            $scope.orgUnit = orgUnit;
            $scope.setTemplateUrl(orgUnit, false);
            scrollToTop();
        };

        $scope.getLevel = function(orgUnit, depth) {
            depth = depth || 0;
            var level = orgUnit ? $scope.orgUnitLevelsMap[orgUnit.level + depth] : undefined;
            return level ? level.split("/")[0].trim() : undefined;
        };

        $scope.canCreateChild = function(orgUnit) {
            return _.contains(["Country", "Project", "Operation Unit", "Module"], $scope.getLevel(orgUnit, 1));
        };

        $scope.canCreateMulitpleChildType = function(orgUnit) {
            return $scope.canCreateChild(orgUnit) && $scope.getLevel(orgUnit) === 'Project';
        };

        $scope.setTemplateUrl = function(orgUnit, isEditMode, depth) {
            depth = depth || 0;
            var level = $scope.getLevel(orgUnit, depth);
            $scope.templateUrl = templateUrlMap[level];
            $scope.isEditMode = isEditMode;
        };

        init();
    };
});