define(["downloadEventDataConsumer", "angularMocks", "properties", "utils", "eventService", "programEventRepository", "userPreferenceRepository"],
    function(DownloadEventDataConsumer, mocks, properties, utils, EventService, ProgramEventRepository, UserPreferenceRepository) {
        describe("download event data consumer", function() {
            var eventService, downloadEventDataConsumer, programEventRepository, userPreferenceRepository;
            beforeEach(mocks.inject(function($q, $rootScope) {
                q = $q;
                scope = $rootScope.$new();

                userPreferenceRepository = new UserPreferenceRepository();
                spyOn(userPreferenceRepository, "getOriginOrgUnitIds").and.returnValue(utils.getPromise(q, ["origin1"]));
                eventService = new EventService();
                programEventRepository = new ProgramEventRepository();
                downloadEventDataConsumer = new DownloadEventDataConsumer(eventService, programEventRepository, userPreferenceRepository, q);
            }));

            it("should download events from dhis and save them to indexeddb", function() {
                var dhisEventList = {
                    'events': [{
                        'event': 'e1',
                        'eventDate': '2015-06-28T18:30:00.000Z'
                    }]
                };

                spyOn(programEventRepository, "isDataPresent").and.returnValue(utils.getPromise(q, true));
                spyOn(eventService, "getRecentEvents").and.returnValue(utils.getPromise(q, dhisEventList));
                spyOn(programEventRepository, "getEventsFromPeriod").and.returnValue(utils.getPromise(q, []));
                spyOn(programEventRepository, "delete").and.returnValue(utils.getPromise(q, []));
                spyOn(programEventRepository, "upsert");

                var message = {
                    "data": {
                        "type": "downloadEventData",
                        "data": []
                    }
                };

                downloadEventDataConsumer.run(message);
                scope.$apply();

                var expectedEventPayload = [{
                    'event': 'e1',
                    'eventDate': '2015-06-28T18:30:00.000Z'
                }];

                expect(eventService.getRecentEvents.calls.count()).toEqual(1);

                expect(eventService.getRecentEvents).toHaveBeenCalledWith(jasmine.any(String), 'origin1');
                expect(programEventRepository.upsert).toHaveBeenCalledWith(expectedEventPayload);
            });

            it("should download events from dhis for spceified origin ids and save them to indexeddb", function() {
                var dhisEventList = {
                    'events': [{
                        'event': 'e1',
                        'eventDate': '2015-06-28T18:30:00.000Z'
                    }]
                };

                spyOn(programEventRepository, "isDataPresent").and.returnValue(utils.getPromise(q, true));
                spyOn(eventService, "getRecentEvents").and.returnValue(utils.getPromise(q, dhisEventList));
                spyOn(programEventRepository, "getEventsFromPeriod").and.returnValue(utils.getPromise(q, []));
                spyOn(programEventRepository, "delete").and.returnValue(utils.getPromise(q, []));
                spyOn(programEventRepository, "upsert");

                var message = {
                    "data": {
                        "type": "downloadEventData",
                        "data": [{
                            orgUnit: 'o1',
                            eventId: 'e1'
                        }]
                    }
                };

                downloadEventDataConsumer.run(message);
                scope.$apply();

                var expectedEventPayload = [{
                    'event': 'e1',
                    'eventDate': '2015-06-28T18:30:00.000Z'
                }];

                expect(eventService.getRecentEvents.calls.count()).toEqual(1);
                expect(eventService.getRecentEvents).toHaveBeenCalledWith(jasmine.any(String), 'o1');
                expect(programEventRepository.upsert).toHaveBeenCalledWith(expectedEventPayload);
            });

            it("should merge dhisEvents with existing indexeddb events, clear events where necessary, and save to indexeddb", function() {
                var dhisEventPresentInIndexedDB = {
                    'event': 'e2',
                    'eventDate': '2014-09-28'
                };

                var dhisEventList = {
                    'events': [dhisEventPresentInIndexedDB]
                };

                var dbEventNotPresentInDHIS = {
                    'event': 'e3',
                    'eventDate': '2014-09-28'
                };

                var dbEventPresentInDHIS = {
                    'event': 'e2',
                    'eventDate': '2014-09-27'
                };

                var dbEventList = [dbEventPresentInDHIS, dbEventNotPresentInDHIS];

                spyOn(programEventRepository, "isDataPresent").and.returnValue(utils.getPromise(q, true));
                spyOn(eventService, "getRecentEvents").and.returnValue(utils.getPromise(q, dhisEventList));
                spyOn(programEventRepository, "getEventsFromPeriod").and.returnValue(utils.getPromise(q, dbEventList));
                spyOn(programEventRepository, "delete");
                spyOn(programEventRepository, "upsert");

                var message = {
                    "data": {
                        "type": "downloadEventData",
                        "data": []
                    }
                };

                downloadEventDataConsumer.run(message);
                scope.$apply();

                var upsertPayload = [dhisEventPresentInIndexedDB];

                expect(programEventRepository.upsert).toHaveBeenCalledWith(upsertPayload);
                expect(programEventRepository.delete).toHaveBeenCalledWith([dbEventNotPresentInDHIS.event]);
            });

        });
    });