define([], function() {
    return function($hustle, $q, $scope, orgUnitRepository, orgUnitGroupRepository) {
        this.createOrgUnitGroups = function(orgUnits, isUpdateProject) {
            var orgUnitGroups;
            var getOrgUnitGroups = function() {
                return orgUnitGroupRepository.getAll().then(function(data) {
                    orgUnitGroups = data;
                });
            };

            var identifyGroupsToModify = function() {
                var getNewGroupAssociations = function() {
                    var findGroupByAttrValue = function(attribute) {
                        var attrValue = attribute.attribute.code === "hospitalUnitCode" ? "Unit Code - " + attribute.value : attribute.value;
                        return _.find(orgUnitGroups, "name", attrValue);
                    };

                    return orgUnitRepository.getProjectAndOpUnitAttributes(orgUnits[0].id).then(function(attributeValues) {
                        return _.transform(attributeValues, function(acc, attr) {
                            var group = findGroupByAttrValue(attr);
                            if (group) acc.push(group);
                        }, []);
                    });
                };

                var getExistingGroupAssociations = function() {
                    return $q.when(_.transform(orgUnitGroups, function(acc, group) {
                        if (!_.isEmpty(_.intersectionBy(group.organisationUnits, orgUnits, "id"))) acc.push(group);
                    }, []));
                };

                return $q.all([getNewGroupAssociations(), getExistingGroupAssociations()]).then(function(data) {
                    var newGroupAssociations = data[0];
                    var existingGroupAssociations = data[1];

                    var oldGroups = _.differenceBy(existingGroupAssociations, newGroupAssociations, "id");
                    var newGroups = _.differenceBy(newGroupAssociations, existingGroupAssociations, "id");

                    return {
                        "oldGroups": oldGroups,
                        "newGroups": newGroups
                    };
                });
            };

            var modifyGroups = function(groupsToModify) {
                var removeOrgUnits = function(orgUnitGroups) {
                    return _.map(orgUnitGroups, function(group) {
                        group.organisationUnits = _.differenceBy(group.organisationUnits, orgUnits, "id");
                        return group;
                    });
                };

                var addOrgUnits = function(orgUnitGroups) {
                    var orgUnitsToAdd = _.map(orgUnits, function(orgUnit) {
                        return {
                            'id': orgUnit.id,
                            'name': orgUnit.name
                        };
                    });

                    return _.map(orgUnitGroups, function(group) {
                        group.organisationUnits = group.organisationUnits ? group.organisationUnits : [];
                        group.organisationUnits = group.organisationUnits.concat(orgUnitsToAdd);
                        return group;
                    });
                };

                return removeOrgUnits(groupsToModify.oldGroups).concat(addOrgUnits(groupsToModify.newGroups));
            };

            var upsertOrgUnitGroups = function(orgUnitGroups) {
                return orgUnitGroupRepository.upsert(orgUnitGroups).then(function() {
                    return $hustle.publish({
                        "data": orgUnitGroups,
                        "type": "upsertOrgUnitGroups",
                        "locale": $scope.currentUser.locale,
                        "desc": $scope.resourceBundle.upsertOrgUnitGroupsDesc
                    }, "dataValues");
                });
            };

            return getOrgUnitGroups()
                .then(identifyGroupsToModify)
                .then(modifyGroups)
                .then(upsertOrgUnitGroups);
        };

        this.getOrgUnitsToAssociateForUpdate = function(orgunits) {
            var getBooleanAttributeValue = function(attributeValues, attributeCode) {
                var attr = _.find(attributeValues, {
                    "attribute": {
                        "code": attributeCode
                    }
                });

                return attr && attr.value === 'true';
            };

            var isLinelistService = function(orgUnit) {
                return getBooleanAttributeValue(orgUnit.attributeValues, "isLineListService");
            };

            var orgUnitsToAssociate = [];

            _.forEach(orgunits, function(orgunit) {
                if (isLinelistService(orgunit))
                    orgUnitsToAssociate.push(orgunit.children);
                else
                    orgUnitsToAssociate.push(orgunit);

            });
            return _.flatten(orgUnitsToAssociate);
        };
    };
});
