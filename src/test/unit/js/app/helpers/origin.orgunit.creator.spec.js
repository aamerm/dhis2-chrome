define(["originOrgunitCreator", "angularMocks", "utils", "orgUnitRepository", "patientOriginRepository", "dhisId"],
    function(OriginOrgunitCreator, mocks, utils, OrgUnitRepository, PatientOriginRepository, dhisId) {
        describe("origin orgunit creator", function() {

            var scope, q, hustle, originOrgunitCreator, orgUnitRepository, patientOriginRepository;

            beforeEach(module('hustle'));
            beforeEach(mocks.inject(function($rootScope, $q, $hustle) {
                scope = $rootScope.$new();
                q = $q;
                hustle = $hustle;

                orgUnitRepository = new OrgUnitRepository();
                patientOriginRepository = new PatientOriginRepository();

                spyOn(orgUnitRepository, "get");
                spyOn(orgUnitRepository, "upsert").and.returnValue(utils.getPromise(q, {}));

                spyOn(patientOriginRepository, "get");

                originOrgunitCreator = new OriginOrgunitCreator(hustle, orgUnitRepository, patientOriginRepository);
            }));

            it("should create origin org units", function() {
                var module = {
                    "id": "mod1",
                    "name": "mod1",
                    "parent": {
                        "id": "opunit1"
                    }
                };

                var opunit = {
                    "id": "opunit1",
                    "name": "opunit1"
                };

                var patientOrigins = {
                    "origins": [{
                        "id": "o1",
                        "name": "o1"
                    }]
                };

                var originOrgUnits = [{
                    "name": 'o1',
                    "shortName": 'o1',
                    "displayName": 'o1',
                    "id": 'o1mod1',
                    "level": 7,
                    "openingDate": undefined,
                    "attributeValues": [{
                        "attribute": {
                            "code": 'Type',
                            "name": 'Type'
                        },
                        "value": 'Patient Origin'
                    }],
                    "parent": {
                        "id": 'mod1'
                    }
                }];

                spyOn(dhisId, "get").and.callFake(function(name) {
                    return name;
                });

                orgUnitRepository.get.and.returnValue(utils.getPromise(q, opunit));
                patientOriginRepository.get.and.returnValue(utils.getPromise(q, patientOrigins));

                originOrgunitCreator.create(module);
                scope.$apply();

                expect(orgUnitRepository.upsert).toHaveBeenCalledWith(originOrgUnits);
            });
        });
    });