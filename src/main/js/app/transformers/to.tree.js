define(["lodash"], function(_) {
    var expandParents = function(selectedNode, allOrgUnits, limitToProject) {
        var currentNode = selectedNode;
        while ((currentNode.parent && !limitToProject) || (currentNode.parent && limitToProject && currentNode.level > 4)) {
            var parent = _.find(allOrgUnits, {
                "id": currentNode.parent.id
            });
            parent.collapsed = false;
            currentNode = parent;
        }
        currentNode.collapsed = false;
    };

    return function(orgUnits, selectedNodeId, limitToProject) {
        var groupedOrgUnits = _.groupBy(orgUnits, 'level');
        var sortedLevels = _.sortBy(_.keys(groupedOrgUnits));
        var selectedNode;
        var allOrgUnits = _.reduceRight(sortedLevels, function(everyOne, level) {
            var withChildren = function(parent) {
                var isLegitimateChild = function(item) {
                    return item.parent && item.parent.id === parent.id;
                };
                parent.children = _.sortBy(_.filter(everyOne, isLegitimateChild), 'name');
                parent.selected = false;
                parent.collapsed = true;
                return parent;
            };

            var setSelectedNode = function(node) {
                if (selectedNodeId && selectedNodeId === node.id) {
                    node.selected = true;
                    node.collapsed = false;
                    selectedNode = node;
                }
                return node;
            };

            var orgUnitsInThisLevel = groupedOrgUnits[level];
            var completeOrgUnits = _.map(orgUnitsInThisLevel, _.compose(setSelectedNode, withChildren));
            return everyOne.concat(completeOrgUnits);
        }, []);


        if (selectedNode) {
            expandParents(selectedNode, allOrgUnits, limitToProject);
        }

        var rootNodes = _.filter(allOrgUnits, function(u) {
            return u.level === parseInt(sortedLevels[0]);
        });

        return {
            "rootNodes": rootNodes,
            "selectedNode": selectedNode
        };
    };
});
