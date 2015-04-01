define(["patientOriginController", "angularMocks", "utils", "dhisId", "timecop", "orgUnitRepository", "patientOriginRepository", "datasetRepository", "originOrgunitCreator", "programRepository"], function(PatientOriginController, mocks, utils, dhisId, timecop, OrgUnitRepository, PatientOriginRepository, DatasetRepository, OriginOrgunitCreator, ProgramRepository) {
    describe("patientOriginController", function() {
        var scope, patientOriginController, q, patientOriginRepository, hustle, origins, orgUnitRepository, originOrgunitCreator, programRepository;

        beforeEach(module("hustle"));
        beforeEach(mocks.inject(function($rootScope, $q, $hustle) {
            scope = $rootScope.$new();
            q = $q;
            hustle = $hustle;
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));

            spyOn(dhisId, "get").and.callFake(function(name) {
                return name;
            });
            scope.orgUnit = {
                "name": "Project1",
                "id": "prj1"
            };

            var modules = [{
                "id": "mod1",
                "name": "mod1",
                "openingDate": "2014-12-12"
            }];

            var siblingOriginOrgUnits = [{
                "id": "originOU1",
                "name": "Unknown"
            }];

            patientOriginRepository = new PatientOriginRepository();
            spyOn(patientOriginRepository, "get").and.returnValue(utils.getPromise(q, {}));
            spyOn(patientOriginRepository, "upsert").and.returnValue(utils.getPromise(q, {}));

            orgUnitRepository = new OrgUnitRepository();
            spyOn(orgUnitRepository, "upsert").and.returnValue(utils.getPromise(q, {}));
            spyOn(orgUnitRepository, "getAllModulesInOrgUnits").and.returnValue(utils.getPromise(q, modules));
            spyOn(orgUnitRepository, "findAllByParent").and.returnValue(utils.getPromise(q, siblingOriginOrgUnits));

            datasetRepository = new DatasetRepository();
            spyOn(datasetRepository, "upsert").and.returnValue(utils.getPromise(q, {}));
            spyOn(datasetRepository, "getAllForOrgUnit").and.returnValue(utils.getPromise(q, {}));
            spyOn(datasetRepository, "associateOrgUnits").and.returnValue(utils.getPromise(q, {}));

            originOrgunitCreator = new OriginOrgunitCreator();
            spyOn(originOrgunitCreator, "create").and.returnValue(utils.getPromise(q, []));

            programRepository = new ProgramRepository();
            spyOn(programRepository, "getProgramForOrgUnit");
            spyOn(programRepository, "associateOrgUnits");

            origins = [{
                "id": "origin1",
                "name": "Origin1",
                "longitude": 100,
                "latitude": 80,
                "clientLastUpdated": "2014-05-30T12:43:54.972Z"
            }];

            Timecop.install();
            Timecop.freeze(new Date("2014-04-01T00:00:00.000Z"));
        }));

        afterEach(function() {
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should set patientOriginDetails on scope on initialization", function() {
            scope.orgUnit = {
                "id": "prj1"
            };
            patientOriginRepository.get.and.returnValue(utils.getPromise(q, {
                "orgUnit": "prj1",
                "origins": origins
            }));
            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);
            scope.$apply();

            expect(patientOriginRepository.get).toHaveBeenCalledWith("prj1");
        });

        it("should add patient origin if no origins are present", function() {
            patientOriginRepository.get.and.returnValue(utils.getPromise(q, {}));
            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);
            scope.patientOrigin = {
                "name": "Origin1",
                "longitude": 100,
                "latitude": 80
            };
            scope.$apply();

            scope.save();
            scope.$apply();

            var expectedPayload = {
                orgUnit: "prj1",
                origins: [{
                    "id": "Origin1",
                    "name": "Origin1",
                    "longitude": 100,
                    "latitude": 80,
                    clientLastUpdated: "2014-04-01T00:00:00.000Z",
                }]
            };
            expect(patientOriginRepository.upsert).toHaveBeenCalledWith(expectedPayload);
            expect(hustle.publish).toHaveBeenCalledWith({
                data: expectedPayload,
                type: "uploadPatientOriginDetails"
            }, "dataValues");
            expect(scope.saveFailure).toEqual(false);
        });

        it("should add new patient origins to existing patient origins", function() {
            patientOriginRepository.get.and.returnValue(utils.getPromise(q, {
                "orgUnit": "prj1",
                "origins": origins
            }));
            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);
            scope.patientOrigin = {
                "name": "Origin2",
                "longitude": 100,
                "latitude": 80
            };
            scope.$apply();

            scope.save();
            scope.$apply();

            var expectedPayload = {
                orgUnit: "prj1",
                origins: [{
                    "id": "origin1",
                    "name": "Origin1",
                    "longitude": 100,
                    "latitude": 80,
                    "clientLastUpdated": "2014-05-30T12:43:54.972Z"
                }, {
                    "id": "Origin2",
                    "name": "Origin2",
                    "longitude": 100,
                    "latitude": 80,
                    "clientLastUpdated": "2014-04-01T00:00:00.000Z",
                }]
            };
            expect(patientOriginRepository.upsert).toHaveBeenCalledWith(expectedPayload);
            expect(hustle.publish).toHaveBeenCalledWith({
                data: expectedPayload,
                type: "uploadPatientOriginDetails"
            }, "dataValues");
        });

        it("should create new orgunits under child modules on adding new patient origins", function() {
            var modules = [{
                "id": "p1",
                "name": "p1",
                "openingDate": "2014-02-02"
            }];

            patientOriginRepository.get.and.returnValue(utils.getPromise(q, {}));
            orgUnitRepository.getAllModulesInOrgUnits.and.returnValue(utils.getPromise(q, modules));

            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);

            var patientOrigin = {
                "name": "Origin1",
                "longitude": 100,
                "latitude": 80
            };

            scope.patientOrigin = patientOrigin;
            scope.orgUnit = {
                "id": "prj1"
            };

            scope.$apply();

            scope.save();
            scope.$apply();

            expect(orgUnitRepository.getAllModulesInOrgUnits).toHaveBeenCalledWith("prj1");
            expect(originOrgunitCreator.create.calls.count()).toEqual(modules.length);
            expect(originOrgunitCreator.create).toHaveBeenCalledWith(modules[0], patientOrigin);
        });

        it("should associate datasets and programs to the newly created origin org units", function() {
            scope.patientOrigin = {
                "name": "Origin1",
                "longitude": 100,
                "latitude": 80
            };

            var originOrgUnits = [{
                "id": "ou1",
                "name": "origin org unit"
            }];

            var datasets = [{
                "id": "ds1",
                "name": "ds1"
            }];

            var program = {
                "id": "p1",
                "name": "Program1"
            };

            originOrgunitCreator.create.and.returnValue(utils.getPromise(q, originOrgUnits));
            datasetRepository.getAllForOrgUnit.and.returnValue(utils.getPromise(q, datasets));
            programRepository.getProgramForOrgUnit.and.returnValue(utils.getPromise(q, program));

            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);
            scope.$apply();

            scope.save();
            scope.$apply();

            expect(datasetRepository.associateOrgUnits).toHaveBeenCalledWith(datasets, originOrgUnits);
            expect(programRepository.associateOrgUnits).toHaveBeenCalledWith(program, originOrgUnits);

            expect(hustle.publish.calls.count()).toEqual(4);

            expect(hustle.publish.calls.argsFor(1)).toEqual([{
                "data": originOrgUnits,
                "type": "upsertOrgUnit"
            }, "dataValues"]);

            expect(hustle.publish.calls.argsFor(2)).toEqual([{
                "data": ["ds1"],
                "type": "associateOrgUnitToDataset"
            }, "dataValues"]);

            expect(hustle.publish.calls.argsFor(3)).toEqual([{
                "data": [program],
                "type": "uploadProgram"
            }, "dataValues"]);
        });

        it("should take the user to the view page of the parent opUnit on clicking cancel", function() {
            scope.orgUnit = {
                "id": "parent",
                "name": "parent"
            };

            scope.$parent = {
                "closeNewForm": function() {}
            };

            spyOn(scope.$parent, "closeNewForm").and.callFake(function(parentOrgUnit) {
                return;
            });

            patientOriginController = new PatientOriginController(scope, hustle, q, patientOriginRepository, orgUnitRepository, datasetRepository, programRepository, originOrgunitCreator);

            scope.closeForm();

            expect(scope.$parent.closeNewForm).toHaveBeenCalledWith(scope.orgUnit);
        });
    });
});
