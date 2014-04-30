define(["toTree", "lodash", "md5", "moment", "properties"], function(toTree, _, md5, moment, properties) {
    return function($scope, db, $q, $location, $timeout, $anchorScroll) {
        var templateUrlMap = {
            'Company': 'templates/partials/company-form.html',
            'Operational Center': 'templates/partials/oc-form.html',
            'Country': 'templates/partials/country-form.html',
            'Project': 'templates/partials/project-form.html',
            'Module': 'templates/partials/module-form.html',
            'Operation Unit': 'templates/partials/op-unit-form.html'
        };

        $scope.organisationUnits = [];

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
            var selectedNodeId = $location.hash()[0];
            $q.all([getAll("organisationUnits"), getAll("organisationUnitLevels")]).then(_.curry(transformToTree)(selectedNodeId));
        };

        var scrollToTop = function() {
            $location.hash();
            $anchorScroll();
        };

        $scope.getOrgUnitType = function(orgUnit) {
            if (!_.isEmpty(orgUnit)) {
                return _.find(orgUnit.attributeValues, {
                    "attribute": {
                        "id": "a1fa2777924"
                    }
                }).value;
            }
        };

        $scope.onOrgUnitSelect = function(orgUnit) {
            $scope.orgUnit = orgUnit;
            $scope.openInViewMode($scope.getOrgUnitType(orgUnit));
            scrollToTop();
        };

        $scope.openInEditMode = function(type) {
            $scope.templateUrl = templateUrlMap[type] + '?' + moment().format("X");
            $scope.isEditMode = true;
        };

        $scope.openInViewMode = function(type) {
            $scope.templateUrl = templateUrlMap[type] + '?' + moment().format("X");
            $scope.isEditMode = false;
        };

        init();
    };
});