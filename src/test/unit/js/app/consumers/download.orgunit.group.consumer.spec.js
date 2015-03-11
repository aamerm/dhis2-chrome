define(["downloadOrgUnitGroupConsumer", "utils", "angularMocks", "orgUnitGroupService", "orgUnitGroupRepository", "timecop", "mergeBy"], function(DownloadOrgUnitGroupConsumer, utils, mocks, OrgUnitGroupService, OrgUnitGroupRepository, timecop, MergeBy) {
    describe("downloadOrgUnitGroupConsumer", function() {
        var downloadOrgUnitGroupConsumer, payload, orgUnitGroupService, orgUnitGroupRepository, q, scope, changeLogRepository, mergeBy;

        beforeEach(mocks.inject(function($q, $rootScope, $log) {
            q = $q;
            scope = $rootScope.$new();

            payload = [{
                "id": "a35778ed565",
                "name": "Most-at-risk Population",
                "organisationUnits": [{
                    "id": "a119bd25ace",
                    "name": "Out-patient General"
                }, {
                    "id": "a0c51512f88",
                    "name": "OBGYN"
                }, {
                    "id": "a43bd484a05",
                    "name": "Laboratory"
                }],
                "lastUpdated": "2014-10-23T09:01:12.020+0000",
                "shortName": "Most-at-risk Population"
            }];

            orgUnitGroupService = new OrgUnitGroupService();
            orgUnitGroupRepository = new OrgUnitGroupRepository();
            mergeBy = new MergeBy($log);

            spyOn(orgUnitGroupRepository, "upsert");
            spyOn(orgUnitGroupRepository, "upsertDhisDownloadedData");

            changeLogRepository = {
                "get": jasmine.createSpy("get").and.returnValue(utils.getPromise(q, "2014-10-24T09:01:12.020+0000")),
                "upsert": jasmine.createSpy("upsert")
            };

            Timecop.install();
            Timecop.freeze(new Date("2014-05-30T12:43:54.972Z"));
        }));

        afterEach(function() {
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should over write local data with dhis data for upsertOrgUnitGroups message", function() {
            var localCopy = payload;
            var message = {
                "data": {
                    "data": payload,
                    "type": "upsertOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = [{
                "id": "a35778ed565",
                "name": "Most-at-risk Population",
                "organisationUnits": [{
                    "id": "a119bd25ace",
                    "name": "Out-patient General"
                }, {
                    "id": "a0c51512f88",
                    "name": "OBGYN"
                }, {
                    "id": "a43bd484a05",
                    "name": "Laboratory"
                }],
                "lastUpdated": "2014-10-28T09:01:12.020+0000",
                "shortName": "Most-at-risk Population"
            }];

            spyOn(orgUnitGroupService, 'get').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, [localCopy[0]]));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);

            downloadOrgUnitGroupConsumer.run(message);
            scope.$apply();

            expect(orgUnitGroupService.get).toHaveBeenCalledWith(["a35778ed565"]);
            expect(orgUnitGroupService.getAll).toHaveBeenCalledWith("2014-10-24T09:01:12.020+0000");
            expect(orgUnitGroupRepository.findAll).toHaveBeenCalledWith(["a35778ed565"]);
            expect(orgUnitGroupService.upsert).not.toHaveBeenCalled();
            expect(orgUnitGroupRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(orgUnitFromDHIS);
        });

        it("should ignore dhis data for upsertOrgUnitGroups message", function() {
            var localCopy = payload;
            var message = {
                "data": {
                    "data": payload,
                    "type": "upsertOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = [{
                "id": "a35778ed565",
                "name": "Most-at-risk Population",
                "organisationUnits": [{
                    "id": "a119bd25ace",
                    "name": "Out-patient General"
                }, {
                    "id": "a0c51512f88",
                    "name": "OBGYN"
                }, {
                    "id": "a43bd484a05",
                    "name": "Laboratory"
                }],
                "lastUpdated": "2014-09-28T09:01:12.020+0000",
                "shortName": "Most-at-risk Population"
            }];

            spyOn(orgUnitGroupService, 'get').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, [localCopy[0]]));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);

            downloadOrgUnitGroupConsumer.run(message);
            scope.$apply();

            expect(orgUnitGroupService.get).toHaveBeenCalledWith(["a35778ed565"]);
            expect(orgUnitGroupService.getAll).toHaveBeenCalledWith("2014-10-24T09:01:12.020+0000");
            expect(orgUnitGroupRepository.findAll).toHaveBeenCalledWith(["a35778ed565"]);
            expect(orgUnitGroupService.upsert).not.toHaveBeenCalled();
            expect(orgUnitGroupRepository.upsert).not.toHaveBeenCalled();
        });

        it("should overwrite local data with dhis data for downloadOrgUnitGroups message", function() {
            var localCopy = payload;
            var message = {
                "data": {
                    "data": [],
                    "type": "downloadOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = [{
                "id": "a35778ed565",
                "name": "Most-at-risk Population",
                "organisationUnits": [{
                    "id": "a119bd25ace",
                    "name": "Out-patient General"
                }, {
                    "id": "a0c51512f88",
                    "name": "OBGYN"
                }, {
                    "id": "a43bd484a05",
                    "name": "Laboratory"
                }],
                "lastUpdated": "2014-10-28T09:01:12.020+0000",
                "shortName": "Most-at-risk Population"
            }];

            spyOn(orgUnitGroupService, 'get').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, [localCopy[0]]));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);

            downloadOrgUnitGroupConsumer.run(message);
            scope.$apply();

            expect(orgUnitGroupService.upsert).not.toHaveBeenCalled();
            expect(orgUnitGroupRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(orgUnitFromDHIS);
        });

        it("should ignore dhis data for downloadOrgUnitGroups message", function() {
            var localCopy = payload;
            var message = {
                "data": {
                    "data": [],
                    "type": "downloadOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = {
                "data": {
                    "organisationUnitGroups": [{
                        "id": "a35778ed565",
                        "name": "Most-at-risk Population",
                        "organisationUnits": [{
                            "id": "a119bd25ace",
                            "name": "Out-patient General"
                        }, {
                            "id": "a0c51512f88",
                            "name": "OBGYN"
                        }, {
                            "id": "a43bd484a05",
                            "name": "Laboratory"
                        }],
                        "lastUpdated": "2014-09-28T09:01:12.020+0000",
                        "shortName": "Most-at-risk Population"
                    }]
                }
            };

            spyOn(orgUnitGroupService, 'get').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, [localCopy[0]]));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);

            downloadOrgUnitGroupConsumer.run(message);
            scope.$apply();

            expect(orgUnitGroupService.upsert).not.toHaveBeenCalled();
            expect(orgUnitGroupRepository.upsert).not.toHaveBeenCalled();
        });

        it("should upsert lastUpdated time in change log", function() {
            var message = {
                "data": {
                    "data": [],
                    "type": "downloadOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = {
                "data": {
                    "organisationUnitGroups": []
                }
            };

            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, []));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);
            downloadOrgUnitGroupConsumer.run(message);

            scope.$apply();

            expect(changeLogRepository.upsert).toHaveBeenCalledWith("orgUnitGroups", "2014-05-30T12:43:54.972Z");
        });

        it("should upsert new org unit groups from dhis to local db", function() {
            var message = {
                "data": {
                    "data": [],
                    "type": "downloadOrgUnitGroups"
                }
            };

            var orgUnitFromDHIS = [{
                "id": "a35778ed565",
                "name": "Most-at-risk Population",
                "organisationUnits": [{
                    "id": "a119bd25ace",
                    "name": "Out-patient General"
                }, {
                    "id": "a0c51512f88",
                    "name": "OBGYN"
                }, {
                    "id": "a43bd484a05",
                    "name": "Laboratory"
                }],
                "lastUpdated": "2014-10-28T09:01:12.020+0000",
                "shortName": "Most-at-risk Population"
            }];

            spyOn(orgUnitGroupService, 'get').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'getAll').and.returnValue(utils.getPromise(q, orgUnitFromDHIS));
            spyOn(orgUnitGroupService, 'upsert');
            spyOn(orgUnitGroupRepository, 'findAll').and.returnValue(utils.getPromise(q, []));

            downloadOrgUnitGroupConsumer = new DownloadOrgUnitGroupConsumer(orgUnitGroupService, orgUnitGroupRepository, changeLogRepository, q, mergeBy);

            downloadOrgUnitGroupConsumer.run(message);
            scope.$apply();

            expect(orgUnitGroupService.upsert).not.toHaveBeenCalled();
            expect(orgUnitGroupRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(orgUnitFromDHIS);
        });
    });
});
