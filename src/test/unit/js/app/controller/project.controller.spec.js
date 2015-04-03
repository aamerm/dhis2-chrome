define(["projectController", "angularMocks", "utils", "lodash", "moment", "orgUnitMapper", "timecop", "orgUnitGroupHelper", "properties", "approvalDataRepository"], function(ProjectController, mocks, utils, _, moment, orgUnitMapper, timecop, OrgUnitGroupHelper, properties, ApprovalDataRepository) {
    describe("project controller tests", function() {
        var scope, timeout, q, location, anchorScroll, userRepository, parent, fakeModal, orgUnitRepo, hustle, rootScope, approvalDataRepository;

        beforeEach(module('hustle'));
        beforeEach(mocks.inject(function($rootScope, $q, $hustle, $timeout, $location) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            hustle = $hustle;
            q = $q;
            timeout = $timeout;
            location = $location;
            orgUnitGroupHelper = new OrgUnitGroupHelper();

            orgUnitRepo = utils.getMockRepo(q);
            orgUnitRepo.getChildOrgUnitNames = jasmine.createSpy("getChildOrgUnitNames").and.returnValue(utils.getPromise(q, []));
            orgUnitRepo.getAllModulesInOrgUnits = jasmine.createSpy("getAllModulesInOrgUnits").and.returnValue(utils.getPromise(q, []));

            approvalDataRepository = new ApprovalDataRepository();

            userRepository = {
                "upsert": function() {
                    return utils.getPromise(q, [{}]);
                },
                "getAllProjectUsers": function() {
                    return utils.getPromise(q, [{}]);
                }
            };

            parent = {
                "id": "parent",
                "name": "parent",
                "children": []
            };

            scope.isNewMode = true;
            scope.orgUnit = {
                id: "blah"
            };

            scope.resourceBundle = {
                "upsertOrgUnitDesc": "upsert org unit ",
                "updateUserDesc": "update user ",
                "uploadApprovalDataDesc": "approve data at coordination level for ",
                "uploadCompletionDataDesc": "approve data at project level for "
            };

            scope.currentUser = {
                "locale": "en"
            };

            fakeModal = {
                close: function() {
                    this.result.confirmCallBack();
                },
                dismiss: function(type) {
                    this.result.cancelCallback(type);
                },
                open: function(object) {}
            };

            anchorScroll = jasmine.createSpy();

            Timecop.install();
            Timecop.freeze(new Date("2014-05-30T12:43:54.972Z"));

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal, orgUnitGroupHelper, approvalDataRepository);
        }));

        afterEach(function() {
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should save project in dhis", function(done) {
            var newOrgUnit = {};
            var expectedNewOrgUnit = {
                "id": "blah",
                "name": "blah"
            };
            spyOn(orgUnitMapper, "mapToProjectForDhis").and.returnValue(expectedNewOrgUnit);
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
            spyOn(location, 'hash');
            rootScope.$on('resetProjects', function() {
                expect(orgUnitMapper.mapToProjectForDhis).toHaveBeenCalledWith(newOrgUnit, parent);
                expect(orgUnitRepo.upsert).toHaveBeenCalledWith(expectedNewOrgUnit);
                expect(hustle.publish).toHaveBeenCalledWith({
                    data: expectedNewOrgUnit,
                    type: "upsertOrgUnit",
                    locale: "en",
                    desc: "upsert org unit blah"
                }, "dataValues");

                done();
            });
            scope.save(newOrgUnit, parent);
            scope.$apply();
            rootScope.$apply();
        });

        it("should display error if saving organization unit fails", function() {
            spyOn(hustle, "publish").and.returnValue(utils.getRejectedPromise(q, {}));

            scope.save({}, parent);
            scope.$apply();

            expect(scope.saveFailure).toEqual(true);
        });

        it("should update project", function() {
            var expectedNewOrgUnit = {
                "id": "blah",
                "name": "blah"
            };

            spyOn(orgUnitMapper, "mapToExistingProject").and.returnValue(expectedNewOrgUnit);
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
            spyOn(location, 'hash');
            spyOn(orgUnitGroupHelper, "createOrgUnitGroups").and.returnValue(utils.getPromise(q, {}));

            scope.update({}, {});
            scope.$apply();

            expect(orgUnitRepo.upsert).toHaveBeenCalledWith(expectedNewOrgUnit);
            expect(hustle.publish).toHaveBeenCalledWith({
                data: expectedNewOrgUnit,
                type: "upsertOrgUnit",
                locale: "en",
                desc: "upsert org unit blah"
            }, "dataValues");
        });

        it("should approve existing data for project if autoApprove is set to true", function() {
            var orgUnit = {
                "id": "blah"
            };
            var newOrgUnit = {
                "id": "blah",
                "autoApprove": "true"
            };

            var modules = [{
                "id": "mod1",
                "name": "mod1"
            }, {
                "id": "mod2",
                "name": "mod2"
            }, {
                "id": "mod3",
                "name": "mod3"
            }];

            var expectedPeriodAndOrgUnits = [{
                "period": '2014W21',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W20',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W19',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W18',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W17',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W16',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W15',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W14',
                "orgUnit": 'mod1'
            }, {
                "period": '2014W21',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W20',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W19',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W18',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W17',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W16',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W15',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W14',
                "orgUnit": 'mod2'
            }, {
                "period": '2014W21',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W20',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W19',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W18',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W17',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W16',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W15',
                "orgUnit": 'mod3'
            }, {
                "period": '2014W14',
                "orgUnit": 'mod3'
            }];

            spyOn(approvalDataRepository, "markAsApproved").and.returnValue(utils.getPromise(q, {}));
            spyOn(orgUnitMapper, "mapToExistingProject").and.returnValue(newOrgUnit);
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
            spyOn(location, 'hash');
            spyOn(orgUnitGroupHelper, "createOrgUnitGroups").and.returnValue(utils.getPromise(q, {}));
            orgUnitRepo.getAllModulesInOrgUnits = jasmine.createSpy("getAllModulesInOrgUnits").and.returnValue(utils.getPromise(q, modules));

            scope.update(newOrgUnit, orgUnit);
            scope.$apply();

            expect(approvalDataRepository.markAsApproved).toHaveBeenCalledWith(expectedPeriodAndOrgUnits, "admin");
            expect(hustle.publish).toHaveBeenCalledWith({
                "data": expectedPeriodAndOrgUnits,
                "type": "uploadCompletionData",
                "locale": "en",
                "desc": "approve data at project level for 2014W21,2014W20,2014W19,2014W18,2014W17,2014W16,2014W15,2014W14"
            }, "dataValues");
            expect(hustle.publish).toHaveBeenCalledWith({
                "data": expectedPeriodAndOrgUnits,
                "type": "uploadApprovalData",
                "locale": "en",
                "desc": "approve data at coordination level for 2014W21,2014W20,2014W19,2014W18,2014W17,2014W16,2014W15,2014W14"
            }, "dataValues");
        });

        it("should display error if updating organization unit fails", function() {
            spyOn(hustle, "publish").and.returnValue(utils.getRejectedPromise(q, {}));
            spyOn(orgUnitGroupHelper, "createOrgUnitGroups").and.returnValue(utils.getPromise(q, {}));

            scope.update({}, parent);
            scope.$apply();

            expect(scope.saveFailure).toEqual(true);
        });

        it("should reset form", function() {
            scope.newOrgUnit = {
                'id': '123',
                'openingDate': moment().add(-7, 'days').toDate(),
                'endDate': moment().add(7, 'days').toDate(),
            };
            scope.saveFailure = true;

            scope.reset();
            scope.$apply();

            expect(scope.newOrgUnit).toEqual({
                openingDate: moment().toDate(),
                autoApprove: 'false'
            });
            expect(scope.saveFailure).toEqual(false);
        });

        it("should open the opening date datepicker", function() {
            var event = {
                preventDefault: function() {},
                stopPropagation: function() {}
            };
            spyOn(event, 'preventDefault');
            spyOn(event, 'stopPropagation');

            scope.openOpeningDate(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(scope.openingDate).toBe(true);
            expect(scope.endDate).toBe(false);
        });

        it("should open the end date datepicker", function() {
            var event = {
                preventDefault: function() {},
                stopPropagation: function() {}
            };
            spyOn(event, 'preventDefault');
            spyOn(event, 'stopPropagation');

            scope.openEndDate(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(scope.openingDate).toBe(false);
            expect(scope.endDate).toBe(true);
        });

        it("should show project details when in view mode", function() {
            scope.newOrgUnit = {};
            scope.orgUnit = {
                "name": "anyname",
                "openingDate": "2010-01-01",
                'level': 3,
                "attributeValues": [{
                    "attribute": {
                        "code": "prjCon",
                        "name": "Context",
                        "id": "Gy8V8WeGgYs"
                    },
                    "value": "val2"
                }, {
                    "attribute": {
                        "code": "prjLoc",
                        "name": "Location",
                        "id": "CaQPMk01JB8"
                    },
                    "value": "val3"
                }, {
                    "attribute": {
                        "code": "prjEndDate",
                        "name": "End date",
                        "id": "ZbUuOnEmVs5"
                    },
                    "value": "2011-01-01"
                }, {
                    "attribute": {
                        "code": "prjPopType",
                        "name": "Type of population",
                        "id": "Byx9QE6IvXB"
                    },
                    "value": "val6"
                }, {
                    "attribute": {
                        "code": "projCode",
                        "name": "Project Code",
                        "id": "fa5e00d5cd2"
                    },
                    "value": "RU118"
                }, {
                    attribute: {
                        code: 'reasonForIntervention',
                        name: 'Reason For Intervention',
                        id: 'e7af7f29053'
                    },
                    value: 'Armed Conflict'
                }, {
                    attribute: {
                        code: 'modeOfOperation',
                        name: 'Mode Of Operation',
                        id: 'a048b89d331'
                    },
                    value: 'Direct Operation'
                }, {
                    attribute: {
                        code: 'modelOfManagement',
                        name: 'Model Of Management',
                        id: 'd2c3e7993f6'
                    },
                    value: 'Collaboration'
                }, {
                    'attribute': {
                        'code': 'autoApprove',
                        'name': 'Auto Approve',
                        'id': 'e65afaec61d'
                    },
                    'value': 'true'
                }]
            };
            var expectedNewOrgUnit = {
                'name': scope.orgUnit.name,
                'openingDate': moment("2010-01-01").toDate(),
                'context': "val2",
                'location': "val3",
                'endDate': moment("2011-01-01").toDate(),
                'populationType': "val6",
                'projectCode': 'RU118',
                'reasonForIntervention': 'Armed Conflict',
                'modeOfOperation': 'Direct Operation',
                'modelOfManagement': 'Collaboration',
                'autoApprove': 'true'
            };

            scope.isNewMode = false;

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal, orgUnitGroupHelper);

            expect(scope.newOrgUnit).toEqual(expectedNewOrgUnit);
        });

        it('should set project users in view mode', function() {
            scope.orgUnit = {
                "name": "anyname",
                "parent": {
                    "id": "someId"
                }
            };
            scope.isNewMode = false;
            var users = [{
                'userCredentials': {
                    'username': 'foobar',
                    'userRoles': [{
                        "name": 'Data Entry User',
                        "id": 'Role1Id'
                    }, {
                        "name": 'Project Level Approver',
                        "id": 'Role2Id'
                    }]
                }
            }, {
                'userCredentials': {
                    'username': 'blah',
                    'userRoles': [{
                        "name": 'Data Entry User',
                        "id": 'Role1Id'
                    }, {
                        "name": 'Coordination Level Approver',
                        "id": 'Role3Id'
                    }]
                }
            }];

            var expectedUsers = [{
                'roles': 'Data Entry User, Project Level Approver',
                'userCredentials': {
                    'username': 'foobar',
                    'userRoles': [{
                        "name": 'Data Entry User',
                        "id": 'Role1Id'
                    }, {
                        "name": 'Project Level Approver',
                        "id": 'Role2Id',
                    }]
                }
            }, {
                'roles': 'Data Entry User, Coordination Level Approver',
                'userCredentials': {
                    'username': 'blah',
                    'userRoles': [{
                        "name": 'Data Entry User',
                        "id": 'Role1Id'
                    }, {
                        "name": 'Coordination Level Approver',
                        "id": 'Role3Id'
                    }]
                }
            }];
            spyOn(userRepository, "getAllProjectUsers").and.returnValue(utils.getPromise(q, users));

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal, orgUnitGroupHelper);
            scope.$apply();

            expect(scope.projectUsers).toEqual(expectedUsers);
        });

        it("should set user project as currently selected project", function() {
            scope.orgUnit = {
                "name": "anyname",
            };
            scope.currentUser = {
                "id": "msfadmin"
            };
            scope.setUserProject();

            expect(scope.currentUser.organisationUnits[0]).toEqual(scope.orgUnit);
        });

        it("should not toggle user's disabled state if confirmation cancelled", function() {
            spyOn(fakeModal, 'open').and.returnValue({
                result: utils.getRejectedPromise(q, {})
            });
            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal);
            var user = {
                id: '123',
                name: "blah blah",
                userCredentials: {
                    disabled: false
                }
            };
            scope.toggleUserDisabledState(user, true);
            scope.$apply();

            expect(scope.userStateSuccessfullyToggled).toBe(false);
        });

        it("should toggle user's disabled state if confirmed", function() {
            spyOn(fakeModal, 'open').and.returnValue({
                result: utils.getPromise(q, {})
            });

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal);

            var user = {
                id: '123',
                name: "blah blah",
                userCredentials: {
                    disabled: false
                }
            };

            var expectedUser = {
                id: '123',
                name: "blah blah",
                userCredentials: {
                    disabled: true
                }
            };

            var expectedMessage = {
                data: user,
                type: 'updateUser',
                locale: 'en',
                desc: 'update user blah blah'
            };
            spyOn(userRepository, "upsert").and.returnValue(utils.getPromise(q, user));
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
            scope.toggleUserDisabledState(user);
            scope.$apply();

            expect(scope.userStateSuccessfullyToggled).toBe(true);
            expect(userRepository.upsert).toHaveBeenCalledWith(expectedUser);
            expect(hustle.publish).toHaveBeenCalledWith(expectedMessage, "dataValues");
        });

        it("should get all existing project codes while preparing new form", function() {
            var project1 = {
                "id": "Kabul1",
                "name": "Kabul-AF101",
                "attributeValues": [{
                    "attribute": {
                        "code": "projCode"
                    },
                    "value": "AF101"
                }]
            };

            orgUnitRepo.getChildOrgUnitNames.and.returnValue(utils.getPromise(q, [project1]));

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal, orgUnitGroupHelper);
            scope.$apply();

            expect(scope.existingProjectCodes).toEqual(["AF101"]);
        });

        it("should take the user to the view page of the parent country on clicking cancel", function() {
            var parentOrgUnit = {
                'id': 'parent',
                'name': 'parent'
            };

            scope.$parent = {
                "closeNewForm": function() {}
            };

            spyOn(scope.$parent, "closeNewForm").and.callFake(function(parentOrgUnit) {
                return;
            });

            projectController = new ProjectController(scope, rootScope, hustle, orgUnitRepo, q, location, timeout, anchorScroll, userRepository, fakeModal, orgUnitGroupHelper);

            scope.closeForm(parentOrgUnit);

            expect(scope.$parent.closeNewForm).toHaveBeenCalledWith(parentOrgUnit);
        });

        it("should update org unit groups on updating project", function() {
            var modules = [{
                "name": "OBGYN",
                "parent": {
                    "id": "a5dc7e2aa0e"
                },
                "active": true,
                "shortName": "OBGYN",
                "id": "a72ec34b863",
                "children": [{
                    "id": "child1",
                    "name": "child1"
                }, {
                    "id": "child2",
                    "name": "child2"
                }],
                "attributeValues": [{
                    "attribute": {
                        "code": "Type",
                    },
                    "value": "Module"
                }, {
                    "attribute": {
                        "code": "isLineListService",
                    },
                    "value": "true"
                }]
            }];

            var orgunitsToAssociate = [{
                "id": "child1",
                "name": "child1"
            }, {
                "id": "child2",
                "name": "child2"
            }];

            var orgUnit = {
                "id": "blah"
            };
            var newOrgUnit = {
                "id": "blah",
                "autoApprove": true,
                "children": [{
                    "id": "op1"
                }]
            };


            spyOn(approvalDataRepository, "markAsApproved").and.returnValue(utils.getPromise(q, {}));
            spyOn(orgUnitMapper, "mapToExistingProject").and.returnValue(newOrgUnit);
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
            spyOn(location, 'hash');
            orgUnitRepo.getAllModulesInOrgUnits = jasmine.createSpy("getAllModulesInOrgUnits").and.returnValue(utils.getPromise(q, modules));
            spyOn(orgUnitGroupHelper, "getOrgUnitsToAssociateForUpdate").and.returnValue(orgunitsToAssociate);
            spyOn(orgUnitGroupHelper, "createOrgUnitGroups").and.returnValue(utils.getPromise(q, {}));


            scope.update(newOrgUnit, orgUnit);
            scope.$apply();

            expect(orgUnitGroupHelper.createOrgUnitGroups).toHaveBeenCalledWith(orgunitsToAssociate, true);


        });
    });

});
