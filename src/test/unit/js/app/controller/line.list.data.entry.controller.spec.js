define(["lineListDataEntryController", "angularMocks", "utils", "moment", "programRepository", "programEventRepository"], function(LineListDataEntryController, mocks, utils, moment, ProgramRepository, ProgramEventRepository) {
    describe("lineListDataEntryController ", function() {

        var scope, q, hustle, programRepository, mockDB, mockStore;

        beforeEach(module('hustle'));
        beforeEach(mocks.inject(function($rootScope, $q, $hustle) {
            scope = $rootScope.$new();
            q = $q;
            hustle = $hustle;

            mockDB = utils.getMockDB($q);
            mockStore = mockDB.objectStore;

            scope.resourceBundle = {};
            scope.week = {
                "weekNumber": 44,
                "startOfWeek": "2014-10-27",
                "endOfWeek": "2014-11-02"
            };
            scope.currentModule = {
                'id': 'ae2a77b82a5'
            };

            programRepository = new ProgramRepository();
            programEventRepository = new ProgramEventRepository();
            spyOn(programEventRepository, "getEventsForPeriodAndOrgUnit").and.returnValue(utils.getPromise(q, ['event1', 'event2']));
        }));

        it("should load programs into scope on init", function() {
            var programAndStageData = {
                'id': 'p1'
            };
            spyOn(programRepository, "getProgramAndStages").and.returnValue(utils.getPromise(q, programAndStageData));

            scope.programsInCurrentModule = ['p1'];
            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(programRepository.getProgramAndStages).toHaveBeenCalledWith('p1');
            expect(scope.programs).toEqual([programAndStageData]);
        });

        it("should load all optionSets to scope on init", function() {
            var optionSets = [{
                'id': 'os1'
            }];
            mockStore.getAll.and.returnValue(utils.getPromise(q, optionSets));

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(scope.optionSets).toBe(optionSets);
        });

        it("should find optionSets for id", function() {
            var optionSets = [{
                'id': 'os1',
                'options': [{
                    'id': 'os1o1'
                }]
            }, {
                'id': 'os2',
                'options': [{
                    'id': 'os2o1',
                    'name': 'os2o1 name'
                }]
            }];

            mockStore.getAll.and.returnValue(utils.getPromise(q, optionSets));

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(scope.getOptionsFor('os2')).toEqual([{
                'id': 'os2o1',
                'name': 'os2o1 name',
                'displayName': 'os2o1 name'
            }]);
        });

        it("should translate options", function() {
            scope.resourceBundle = {
                'os1o1': 'os1o1 translated name'
            };

            mockStore.getAll.and.returnValue(utils.getPromise(q, [{
                'id': 'os1',
                'options': [{
                    'id': 'os1o1',
                    'name': 'os1o1 name'
                }]
            }]));

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(scope.getOptionsFor('os1')).toEqual([{
                'id': 'os1o1',
                'name': 'os1o1 name',
                'displayName': 'os1o1 translated name'
            }]);

        });

        it("should update dataValues with new program and stage if not present", function() {
            var dataValues = {};

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            scope.getDataValueNgModel(dataValues, 'p1', 'ps1');

            expect(dataValues).toEqual({
                'p1': {
                    'ps1': {}
                }
            });
        });

        it("should change dataValues", function() {
            var dataValues = {
                'p1': {
                    'ps1': {}
                }
            };

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            scope.getDataValueNgModel(dataValues, 'p1', 'ps2');

            expect(dataValues).toEqual({
                'p1': {
                    'ps1': {},
                    'ps2': {}
                }
            });
        });

        it("should get eventDates with default set to today", function() {
            var eventDates = {};

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            scope.getEventDateNgModel(eventDates, 'p1', 'ps1');

            expect(moment(eventDates.p1.ps1).isSame(moment(), 'days')).toBe(true);
        });

        it("should set min and max date for selected period", function() {

            scope.week = {
                "weekNumber": 46,
                "startOfWeek": "2014-11-10",
                "endOfWeek": "2014-11-16"
            };

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(moment(scope.minDateInCurrentPeriod).format("YYYY-MM-DD")).toEqual("2014-11-10");
            expect(moment(scope.maxDateInCurrentPeriod).format("YYYY-MM-DD")).toEqual("2014-11-16");
        });

        it("should save event details as draft", function() {

            spyOn(programEventRepository, "upsert").and.returnValue(utils.getPromise(q, {}));
            spyOn(hustle, "publish");

            scope.resourceBundle = {
                'eventSaveSuccess': 'Event saved successfully'
            };

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            scope.programs = [{
                'id': 'Prg1',
                'programStages': [{
                    'id': 'PrgStage1'
                }]
            }];

            scope.eventDates = {
                "Prg1": {
                    "PrgStage1": "2014-11-18T10:34:14.067Z"
                }
            };

            scope.dataValues = {
                "Prg1": {
                    "PrgStage1": {}
                }
            };

            scope.submit(true);
            scope.$apply();

            var actualPayloadInUpsertCall = programEventRepository.upsert.calls.first().args[0];

            expect(actualPayloadInUpsertCall.events[0].program).toEqual("Prg1");
            expect(actualPayloadInUpsertCall.events[0].programStage).toEqual("PrgStage1");
            expect(actualPayloadInUpsertCall.events[0].orgUnit).toEqual("ae2a77b82a5");
            expect(actualPayloadInUpsertCall.events[0].eventDate).toEqual("2014-11-18");
            expect(actualPayloadInUpsertCall.events[0].localStatus).toEqual("NEW");
            expect(actualPayloadInUpsertCall.events[0].dataValues).toEqual([]);

            expect(scope.resultMessageType).toEqual("success");
            expect(scope.resultMessage).toEqual("Event saved successfully");
            expect(hustle.publish).not.toHaveBeenCalled();
        });

        it("should submit event details", function() {
            spyOn(programEventRepository, "upsert").and.returnValue(utils.getPromise(q, {}));
            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, ""));

            scope.resourceBundle = {
                'eventSaveSuccess': 'Event saved successfully',
                'eventSubmitSuccess': 'Event submitted succesfully'
            };

            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            scope.programs = [{
                'id': 'Prg1',
                'programStages': [{
                    'id': 'PrgStage1'
                }]
            }];

            scope.eventDates = {
                "Prg1": {
                    "PrgStage1": "2014-11-18T10:34:14.067Z"
                }
            };

            scope.dataValues = {
                "Prg1": {
                    "PrgStage1": {}
                }
            };


            scope.submit(false);
            scope.$apply();

            var actualPayloadInUpsertCall = programEventRepository.upsert.calls.first().args[0];

            expect(actualPayloadInUpsertCall.events[0].program).toEqual("Prg1");

            expect(scope.resultMessageType).toEqual("success");
            expect(scope.resultMessage).toEqual("Event submitted succesfully");
            expect(hustle.publish).toHaveBeenCalled();
            expect(scope.allEvents).toEqual(['event1', 'event2']);
        });

        it("should load all events for org unit and period on init", function() {
            var lineListDataEntryController = new LineListDataEntryController(scope, q, hustle, mockDB.db, programRepository, programEventRepository);
            scope.$apply();

            expect(scope.allEvents).toEqual(['event1', 'event2']);
        });
    });
});