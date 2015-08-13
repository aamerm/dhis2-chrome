define(["orgUnitRepository", "utils", "angularMocks", "timecop", "lodash"], function(OrgUnitRepository, utils, mocks, timecop, _) {
    describe("Org Unit Repository specs", function() {
        var mockOrgStore, mockDb, orgUnitRepository, q, orgUnits, scope, company, country, project, opUnit, module, originOU;
        var getAttr = function(key, value) {
            return {
                "attribute": {
                    "code": key
                },
                "value": value
            };
        };

        beforeEach(mocks.inject(function($q, $rootScope) {
            q = $q;
            scope = $rootScope.$new();

            company = {
                "id": "ocp",
                "name": "OCP",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Company"
                }]
            };

            country = {
                "id": "country",
                "name": "country",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Country"
                }],
                "parent": {
                    "id": "ocp"
                }
            };

            project = {
                "id": "project",
                "name": "project",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Project"
                }, {
                    "attribute": {
                        "code": "projCode"
                    },
                    "value": "PRJ001"
                }],
                "parent": {
                    "id": "country"
                }
            };

            opUnit = {
                "id": "opUnit",
                "name": "opUnit",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Operation Unit"
                }],
                "parent": {
                    "id": "project"
                },
                "children": [{
                    "id": "module",
                    "name": "module"
                }]
            };

            module = {
                "id": "module",
                "name": "module",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Module"
                }],
                "parent": {
                    "id": "opUnit"
                },
                "children": [{
                    "id": "Unknown",
                    "name": "Unknown"
                }]
            };

            originOU = {
                "id": "Unknown",
                "name": "Unknown",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Patient Origin"
                }],
                "parent": {
                    "id": "module"
                }
            };

            orgUnits = [company, country, project, opUnit, module, originOU];

            mockDb = utils.getMockDB(q, module, _.clone(orgUnits, true), [module]);
            mockOrgStore = mockDb.objectStore;

            Timecop.install();
            Timecop.freeze(new Date("2014-05-30T12:43:54.972Z"));

            orgUnitRepository = new OrgUnitRepository(mockDb.db, q);
        }));

        afterEach(function() {
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should upsert org units with clientlastupdated and parentId field when data is changed locally", function() {
            var orgUnit = [{
                "id": "org_0",
                "level": 1,
                "lastUpdated": "2014-05-30T12:43:54.972Z",
                "parent": {
                    "id": "p1"
                }
            }];

            var expectedUpsertPayload = [{
                "id": "org_0",
                "level": 1,
                "lastUpdated": "2014-05-30T12:43:54.972Z",
                "clientLastUpdated": "2014-05-30T12:43:54.972Z",
                "parent": {
                    "id": "p1"
                },
                "parentId": "p1"
            }];

            orgUnitRepository.upsert(orgUnit).then(function(data) {
                expect(data).toEqual(expectedUpsertPayload);
            });

            scope.$apply();

            expect(mockOrgStore.upsert).toHaveBeenCalledWith(expectedUpsertPayload);
        });

        it("should upsert org units with only the parentId field when data is changed on dhis", function() {
            var orgUnit = [{
                "id": "org_0",
                "level": 1,
                "lastUpdated": "2014-05-30T12:43:54.972Z",
                "parent": {
                    "id": "p1"
                }
            }];

            var expectedUpsertPayload = [{
                "id": "org_0",
                "level": 1,
                "parent": {
                    "id": "p1"
                },
                "parentId": "p1",
                "lastUpdated": "2014-05-30T12:43:54.972Z"
            }];

            orgUnitRepository.upsertDhisDownloadedData(orgUnit).then(function(data) {
                expect(data).toEqual(expectedUpsertPayload);
            });

            scope.$apply();

            expect(mockOrgStore.upsert).toHaveBeenCalledWith(expectedUpsertPayload);
        });

        it("should get all org units", function() {
            var actualOrgUnits;

            orgUnitRepository.getAll().then(function(results) {
                actualOrgUnits = results;
            });

            scope.$apply();

            expect(mockOrgStore.getAll).toHaveBeenCalled();
            expect(actualOrgUnits).toEqual(orgUnits);
        });

        it("should get orgUnit by id", function() {
            var projectId = "proj1";
            var orgUnit = orgUnitRepository.get(projectId);
            scope.$apply();

            expect(mockOrgStore.find).toHaveBeenCalledWith(projectId);
        });

        it("should find all orgunits by ids", function() {
            var projectIds = ["proj1", "proj2"];
            var orgUnit = orgUnitRepository.findAll(projectIds);
            scope.$apply();

            expect(mockOrgStore.each).toHaveBeenCalled();
            expect(mockOrgStore.each.calls.argsFor(0)[0].inList).toEqual(projectIds);
        });

        it("should find all org units by parent ids", function() {
            var actualOrgUnits;
            var expectedOrgUnits = [module];
            orgUnitRepository.findAllByParent(["project"]).then(function(orgUnits) {
                actualOrgUnits = orgUnits;
            });

            scope.$apply();
            expect(actualOrgUnits).toEqual(expectedOrgUnits);
        });

        it("should get all attributes of parent project and opUnit", function() {
            var actualAttributes;
            var expectedAttributes = [{
                "attribute": {
                    "code": "isNewDataModel"
                },
                "value": "true"
            }, {
                "attribute": {
                    "code": "Type"
                },
                "value": "Operation Unit"
            }, {
                "attribute": {
                    "code": "isNewDataModel"
                },
                "value": "true"
            }, {
                "attribute": {
                    "code": "Type"
                },
                "value": "Project"
            }, {
                "attribute": {
                    "code": "projCode"
                },
                "value": "PRJ001"
            }];

            orgUnitRepository.getProjectAndOpUnitAttributes(module.id).then(function(data) {
                actualAttributes = data;
            });

            scope.$apply();
            expect(actualAttributes).toEqual(expectedAttributes);
        });

        it("should get all projects", function() {
            var expectedProject = _.cloneDeep(project);

            orgUnitRepository.getAllProjects().then(function(data) {
                expect(data.length).toEqual(1);
                expect(data[0]).toEqual(expectedProject);
            });

            scope.$apply();
        });

        it("should get parent project", function() {
            mockOrgStore.find.and.callFake(function(id) {
                if (id === "module")
                    return utils.getPromise(q, module);
                if (id === "opUnit")
                    return utils.getPromise(q, opUnit);
                if (id === "project")
                    return utils.getPromise(q, project);
                return utils.getPromise(q, {});
            });

            var actualProject;
            orgUnitRepository.getParentProject(module.id).then(function(data) {
                actualProject = data;
            });

            scope.$apply();
            expect(actualProject).toEqual(project);
        });

        it("should get all modules which are children of the given org units", function() {
            var actualModules;
            module1 = {
                "id": "module1",
                "name": "module1",
                "attributeValues": [{
                    "attribute": {
                        "code": "isNewDataModel"
                    },
                    "value": "true"
                }, {
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Module"
                }],
                "parent": {
                    "id": "opUnit123"
                },
                "children": [{
                    "id": "Unknown",
                    "name": "Unknown"
                }]
            };

            mockOrgStore.each.and.callFake(function(query) {
                if (query.inList[0] === "opUnit" && query.inList[1] === "module1")
                    return utils.getPromise(q, [opUnit, module1]);
                if (query.inList.length === 1 && query.inList[0] === "opUnit")
                    return utils.getPromise(q, [module]);
            });

            orgUnitRepository.getAllModulesInOrgUnits(["opUnit", "module1"]).then(function(data) {
                actualModules = data;
            });

            scope.$apply();

            expect(actualModules).toEqual([module, module1]);
        });

        it("should get child org unit names", function() {
            var orgUnitNames;
            orgUnitRepository.getChildOrgUnitNames(opUnit).then(function(data) {
                orgUnitNames = data;
            });

            scope.$apply();

            expect(orgUnitNames).toEqual(["module"]);
        });

        it("should get all active origins by name", function() {
            var origins;

            mockOrgStore.each.and.callFake(function(query) {
                if (query.inList[0] === "module")
                    return utils.getPromise(q, [originOU]);
                if (query.inList[0] === "opUnit")
                    return utils.getPromise(q, [module]);

            });

            orgUnitRepository.getAllOriginsByName(opUnit, "Unknown", true).then(function(data) {
                origins = data;
            });

            scope.$apply();

            expect(origins).toEqual([originOU]);
        });

        describe("getAllOperationUnits", function() {
            it("should find all operation units using level", function() {
                var mockStore = mockDb.objectStore;
                var orgUnitlevels = [{ "name": "Operation Unit" }, { "name": "Module" }];
                var operationUnits = [opUnit];
                mockStore.getAll.and.returnValue(utils.getPromise(q, orgUnitlevels));
                mockStore.each.and.returnValue(utils.getPromise(q, operationUnits));

                var actualOpUnits;
                orgUnitRepository.getAllOperationUnits().then(function(dbResult) {
                    actualOpUnits = dbResult;
                });

                scope.$apply();
                expect(actualOpUnits).toEqual(operationUnits);
            });
        });
    });
});
