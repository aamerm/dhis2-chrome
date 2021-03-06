define(["lodash", "dhisId", "moment", "orgUnitMapper"], function(_, dhisId, moment, orgUnitMapper) {
    return function($scope, $q, $hustle, orgUnitRepository, orgUnitGroupHelper, db, $location, $modal, patientOriginRepository, orgUnitGroupSetRepository) {
        $scope.isDisabled = false;
        $scope.showOpUnitCode = false;
        $scope.opUnit = {
            'openingDate': moment().format("YYYY-MM-DD")
        };
        $scope.showEditOriginForm = false;
        $scope.opUnitTypes = [{
            "name": "Hospital"
        }, {
            "name": "Health Center"
        }, {
            "name": "Community"
        }, {
            "name": "Epidemic Isolation Unit"
        }, {
            "name": "Mobile Clinic"
        }];

        var saveToDhis = function(data, desc) {
            return $hustle.publish({
                "data": data,
                "type": "upsertOrgUnit",
                "locale": $scope.currentUser.locale,
                "desc": $scope.resourceBundle.upsertOrgUnitDesc + data[0].name
            }, "dataValues");
        };

        var exitForm = function(orgUnitToLoadOnExit) {
            if ($scope.$parent.closeNewForm)
                $scope.$parent.closeNewForm(orgUnitToLoadOnExit, "savedOpUnit");
        };

        var onError = function() {
            $scope.saveFailure = true;
        };

        var getAttributeValues = function(opUnitType, hospitalUnitCode) {
            var type = opUnitType.name || opUnitType.title;
            hospitalUnitCode = type === "Hospital" ? hospitalUnitCode : {
                "name": ""
            };
            return [{
                "created": moment().toISOString(),
                "lastUpdated": moment().toISOString(),
                "attribute": {
                    "code": "opUnitType"
                },
                "value": opUnitType.title || opUnitType.name
            }, {
                "created": moment().toISOString(),
                "lastUpdated": moment().toISOString(),
                "attribute": {
                    "code": "Type"
                },
                "value": "Operation Unit"
            }, {
                "created": moment().toISOString(),
                "lastUpdated": moment().toISOString(),
                "attribute": {
                    "code": "hospitalUnitCode"
                },
                "value": hospitalUnitCode.title || hospitalUnitCode.name
            }, {
                "created": moment().toISOString(),
                "lastUpdated": moment().toISOString(),
                "attribute": {
                    "code": "isNewDataModel"
                },
                "value": "true"
            }];
        };

        var publishMessage = function(data, action, desc) {
            return $hustle.publish({
                "data": data,
                "type": action,
                "locale": $scope.currentUser.locale,
                "desc": desc
            }, "dataValues");
        };

        var deregisterOpunitTypeWatcher = $scope.$watch("opUnit.type", function() {
            if (_.isEmpty($scope.opUnit.type))
                return;

            var opUnitCode = $scope.opUnit.type.title || $scope.opUnit.type.name;
            if (opUnitCode === "Hospital")
                $scope.showOpUnitCode = true;
            else
                $scope.showOpUnitCode = false;
        });

        $scope.save = function(opUnit) {
            var parent = $scope.orgUnit;

            opUnit = _.merge(opUnit, {
                'id': dhisId.get(opUnit.name + parent.id),
                'shortName': opUnit.name,
                'level': parseInt(parent.level) + 1,
                'parent': _.pick(parent, "name", "id"),
                "attributeValues": getAttributeValues(opUnit.type, opUnit.hospitalUnitCode)
            });

            if (!_.isUndefined(opUnit.longitude) && !_.isUndefined(opUnit.latitude)) {
                opUnit.coordinates = "[" + opUnit.longitude + "," + opUnit.latitude + "]";
                opUnit.featureType = "POINT";
            }

            opUnit = _.omit(opUnit, ['type', 'hospitalUnitCode', 'latitude', 'longitude']);

            var patientOriginPayload = {
                "orgUnit": opUnit.id,
                "origins": [{
                    "name": "Not Specified",
                    "id": dhisId.get(opUnit.id + "Not Specified"),
                    "isDisabled": false,
                    "clientLastUpdated": moment().toISOString()
                }]
            };

            $scope.loading = true;
            return patientOriginRepository.upsert(patientOriginPayload)
                .then(_.partial(publishMessage, patientOriginPayload.orgUnit, "uploadPatientOriginDetails", $scope.resourceBundle.uploadPatientOriginDetailsDesc + _.pluck(patientOriginPayload.origins, "name")))
                .then(_.partial(orgUnitRepository.upsert, opUnit))
                .then(saveToDhis)
                .then(_.partial(exitForm, opUnit))
                .catch(onError)
                .finally(function() {
                    $scope.loading = false;
                });
        };

        $scope.update = function(opUnit) {
            opUnit = _.merge(opUnit, {
                'id': $scope.orgUnit.id,
                'shortName': opUnit.name,
                'level': $scope.orgUnit.level,
                'parent': _.pick($scope.orgUnit.parent, "name", "id"),
                "attributeValues": getAttributeValues(opUnit.type, opUnit.hospitalUnitCode)
            });

            if (!_.isUndefined(opUnit.longitude) && !_.isUndefined(opUnit.latitude)) {
                opUnit.coordinates = "[" + opUnit.longitude + "," + opUnit.latitude + "]";
                opUnit.featureType = "POINT";
            }

            opUnit = _.omit(opUnit, ['type', 'hospitalUnitCode', 'latitude', 'longitude']);

            var getModulesInOpUnit = function() {
                return orgUnitRepository.getAllModulesInOrgUnits($scope.orgUnit.id);
            };

            var createOrgUnitGroups = function(modules) {
                if (_.isEmpty(modules))
                    return;

                var partitionedModules = _.partition(modules, function(module) {
                    return _.any(module.attributeValues, {
                        "attribute": {
                            "code": "isLineListService"
                        },
                        "value": "true"
                    });
                });

                var aggregateModules = partitionedModules[1];
                var lineListModules = partitionedModules[0];

                if (_.isEmpty(lineListModules)) {
                    return orgUnitGroupHelper.createOrgUnitGroups(aggregateModules, true).then(function() {
                        return modules;
                    });
                }

                return orgUnitRepository.findAllByParent(_.pluck(lineListModules, "id")).then(function(originGroups) {
                    return orgUnitGroupHelper.createOrgUnitGroups(aggregateModules.concat(originGroups), true).then(function() {
                        return modules;
                    });
                });
            };

            $scope.loading = true;
            return orgUnitRepository.upsert(opUnit)
                .then(saveToDhis)
                .then(getModulesInOpUnit)
                .then(createOrgUnitGroups)
                .then(_.partial(exitForm, opUnit))
                .catch(onError)
                .finally(function() {
                    $scope.loading = false;
                });
        };

        $scope.editPatientOrigin = function(origin) {
            $scope.patientOrigin = origin;
            $scope.showEditOriginForm = true;
            $scope.formTemplateUrl = "templates/partials/patient-origin-form.html" + '?' + moment().format("X");
        };

        var setBooleanAttributeValue = function(attributeValues, attributeCode) {
            var attr = _.remove(attributeValues, {
                "attribute": {
                    "code": attributeCode
                }
            });
            if (_.isEmpty(attr)) {
                attr.push({
                    "attribute": {
                        "code": "isDisabled"
                    },
                    "value": 'false'
                });
            }

            attr[0].value = attr[0].value === 'true' ? 'false' : 'true';
            attributeValues.push(attr[0]);
            return attributeValues;
        };

        var toggle = function(originToEnableDisable) {
            _.map($scope.originDetails, function(origin) {
                if (origin.id === originToEnableDisable.id)
                    origin.isDisabled = !origin.isDisabled;
                return origin;
            });

            var originsToUpsert = [];
            var updatedPatientOrigin;

            var getOriginsToUpsertAndToggleState = function() {
                return orgUnitRepository.getAllOriginsByName($scope.orgUnit, originToEnableDisable.name, false).then(function(origins) {
                    return _.map(origins, function(originToEdit) {
                        originToEdit.attributeValues = setBooleanAttributeValue(originToEdit.attributeValues, "isDisabled");
                        originsToUpsert.push(originToEdit);
                    });
                });
            };

            var getSystemSettingsAndToggleState = function() {
                return patientOriginRepository.get($scope.orgUnit.id).then(function(patientOrigin) {
                    var originToUpdate = _.remove(patientOrigin.origins, function(origin) {
                        return origin.id == originToEnableDisable.id;
                    })[0];
                    originToUpdate.isDisabled = !originToUpdate.isDisabled;
                    patientOrigin.origins.push(originToUpdate);
                    updatedPatientOrigin = patientOrigin;
                });
            };

            var publishUpdateMessages = function() {
                patientOriginRepository.upsert(updatedPatientOrigin).then(function() {
                    publishMessage(updatedPatientOrigin.orgUnit, "uploadPatientOriginDetails", $scope.resourceBundle.uploadPatientOriginDetailsDesc + _.pluck(updatedPatientOrigin.origins, "name"));
                });
                orgUnitRepository.upsert(originsToUpsert).then(function() {
                    publishMessage(originsToUpsert, "upsertOrgUnit", $scope.resourceBundle.upsertOrgUnitDesc + _.uniq(_.pluck(originsToUpsert, "name")));
                });
            };

            getOriginsToUpsertAndToggleState()
                .then(getSystemSettingsAndToggleState)
                .then(publishUpdateMessages);
        };

        $scope.toggleOriginDisabledState = function(originToEnableDisable) {
            var confirmationMessage = originToEnableDisable.isDisabled === true ? $scope.resourceBundle.enableOriginConfirmationMessage : $scope.resourceBundle.disableOriginConfirmationMessage;
            var modalMessages = {
                "confirmationMessage": confirmationMessage
            };
            showModal(function() {
                toggle(originToEnableDisable);
            }, modalMessages);
        };

        $scope.closeForm = function() {
            $scope.$parent.closeNewForm($scope.orgUnit);
        };

        var disableOpunit = function(orgUnit) {
            return orgUnitRepository.getAllModulesInOrgUnits([orgUnit.id]).then(function(orgUnitsToDisable) {
                orgUnitsToDisable.push(orgUnit);
                var payload = orgUnitMapper.disable(orgUnitsToDisable);
                $scope.isDisabled = true;

                return $q.all([orgUnitRepository.upsert(payload), saveToDhis(orgUnitsToDisable)]).then(function() {
                    if ($scope.$parent.closeNewForm) $scope.$parent.closeNewForm(orgUnit.parent, "disabledOpUnit");
                });
            });
        };

        var showModal = function(okCallback, message) {
            $scope.modalMessages = message;
            var modalInstance = $modal.open({
                templateUrl: 'templates/confirm-dialog.html',
                controller: 'confirmDialogController',
                scope: $scope
            });

            modalInstance.result.then(okCallback);
        };

        $scope.areCoordinatesCompulsory = function() {
            return (!_.isEmpty($scope.opUnit.latitude) || !_.isEmpty($scope.opUnit.longitude) ||
                $scope.form.longitude.$invalid || $scope.form.latitude.$invalid);
        };

        $scope.disable = function(orgUnit) {
            var modalMessages = {
                "confirmationMessage": $scope.resourceBundle.disableOrgUnitConfirmationMessage
            };
            showModal(function() {
                disableOpunit(orgUnit);
            }, modalMessages);
        };

        var setOriginDetails = function(originDetails) {
            if (!_.isEmpty(originDetails)) {
                $scope.originDetails = _.reject(originDetails.origins, function(origin) {
                    return _.isUndefined(origin.longitude) && _.isUndefined(origin.latitude);
                });
            }
        };

        $scope.$on('$destroy', function() {
            deregisterOpunitTypeWatcher();
        });

        var init = function() {
            orgUnitGroupSetRepository.getAll().then(function(data) {
                var hospitalUnitCodes = _.find(data, {
                    "code": "hospital_unit_code"
                }).organisationUnitGroups;

                $scope.hospitalUnitCodes = _.map(hospitalUnitCodes, function(hospitalUnitCode) {
                    hospitalUnitCode.name = hospitalUnitCode.name.replace('Unit Code - ', '');
                    return hospitalUnitCode;
                });

                $scope.hospitalUnitCodes = _.sortBy($scope.hospitalUnitCodes, 'name');

                if (!$scope.isNewMode) {
                    var coordinates = $scope.orgUnit.coordinates;
                    coordinates = coordinates ? coordinates.substr(1, coordinates.length - 2).split(",") : coordinates;
                    var selectedHospitalUnitCode = _.find($scope.orgUnit.attributeValues, {
                        "attribute": {
                            "code": "hospitalUnitCode"
                        }
                    }).value;
                    var selectedOpUnitType = _.find($scope.orgUnit.attributeValues, {
                        "attribute": {
                            "code": "opUnitType"
                        }
                    }).value;
                    $scope.opUnit = {
                        'name': $scope.orgUnit.name,
                        'openingDate': $scope.orgUnit.openingDate,
                        'type': _.find($scope.opUnitTypes, {
                            "name": selectedOpUnitType
                        }),
                        'hospitalUnitCode': _.find($scope.hospitalUnitCodes, {
                            "name": selectedHospitalUnitCode
                        })
                    };

                    if (coordinates) {
                        $scope.opUnit.longitude = parseFloat(coordinates[0]);
                        $scope.opUnit.latitude = parseFloat(coordinates[1]);
                    }

                    var isDisabled = _.find($scope.orgUnit.attributeValues, {
                        "attribute": {
                            "code": "isDisabled"
                        }
                    });

                    $scope.isDisabled = isDisabled && isDisabled.value === "true" ? true : false;
                    patientOriginRepository.get($scope.orgUnit.id).then(setOriginDetails);
                }

                var parentId = $scope.isNewMode ? $scope.orgUnit.id : $scope.orgUnit.parent.id;
                orgUnitRepository.getChildOrgUnitNames(parentId).then(function(data) {
                    $scope.allOpunitNames = data;
                });
            });

        };

        init();
    };
});
