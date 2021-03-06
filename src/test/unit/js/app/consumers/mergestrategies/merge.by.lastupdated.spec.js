define(["mergeByLastUpdated"], function(mergeByLastUpdated) {
    describe("merge by last updated", function() {
        var logger;
        beforeEach(function() {
            logger = {
                "info": jasmine.createSpy()
            };
        });

        it("should merge dhis and local lists correctly even when they are not in the same order", function() {

            var test1Data = {
                'id': 'test1',
                'name': 'test1',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var updatedTest2Data = {
                'id': 'test2',
                'name': 'New test2',
                'lastUpdated': '2015-01-02T13:00:00.000+0000',
            };

            var staleTest2Data = {
                'id': 'test2',
                'name': 'test2',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var updatedTest3Data = {
                'id': 'test3',
                'name': 'New test3',
                'clientLastUpdated': '2015-01-03T13:00:00.000+0000',
                'lastUpdated': '2015-01-02T13:00:00.000+0000',
            };

            var staleTest3Data = {
                'id': 'test3',
                'name': 'test3',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var newLocalTest4Data = {
                'id': 'test4',
                'name': 'test4',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var dataFromDhis = [test1Data, updatedTest2Data, staleTest3Data];
            var dataFromDB = [staleTest2Data, updatedTest3Data, test1Data, newLocalTest4Data];

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual([test1Data, updatedTest2Data, updatedTest3Data, newLocalTest4Data]);
        });

        it("should return dhis data if local data does not exist", function() {
            var dataFromDhis = [{
                'id': 'test1',
                'name': 'test2',
                'lastUpdated': '2015-01-02T10:00:00.000+0000',
            }];

            var dataFromDB;

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDhis);
        });

        it("should return dhis data if dhis data has been updated after local data was downloaded", function() {
            var dataFromDhis = [{
                'id': 'test1',
                'name': 'test2',
                'lastUpdated': '2015-01-02T10:00:00.000+0000',
            }];

            var dataFromDB = [{
                'id': 'test1',
                'name': 'test3',
                'lastUpdated': '2015-01-01T10:00:00.000+0000',
            }];

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDhis);
        });

        it("should return local data if local data has been updated after dhis", function() {
            var dataFromDhis = [{
                'id': 'test1',
                'name': 'test2',
                'lastUpdated': '2015-01-01T10:00:00.000+0000',
            }];

            var dataFromDB = [{
                'id': 'test1',
                'name': 'test3',
                'lastUpdated': '2015-01-02T10:00:00.000+0000',
                'clientLastUpdated': '2015-01-02T11:00:00.000+0000',
            }];

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDB);
        });

        it("should return local data even if dhis has been updated after download as long as local data timestamp is greater", function() {
            var dataFromDhis = [{
                'id': 'test1',
                'name': 'test2',
                'lastUpdated': '2015-01-02T10:00:00.000+0000',
            }];

            var dataFromDB = [{
                'id': 'test1',
                'name': 'test3',
                'lastUpdated': '2015-01-01T10:00:00.000+0000',
                'clientLastUpdated': '2015-01-02T11:00:00.000+0000',
            }];

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDB);
        });

        it("should return dhis data if dhis data has changed after download and after local data was updated", function() {
            var dataFromDhis = [{
                'id': 'test1',
                'name': 'test2',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            }];

            var dataFromDB = [{
                'id': 'test1',
                'name': 'test3',
                'lastUpdated': '2015-01-01T10:00:00.000+0000',
                'clientLastUpdated': '2015-01-02T11:00:00.000+0000',
            }];

            var actualData = mergeByLastUpdated(undefined, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDhis);
        });

        it("should use supplied equals predicate to determine which items to compare while deciding to merge", function() {

            var test1Data = {
                'code': 'test1',
                'name': 'test1',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var updatedTest2Data = {
                'code': 'test2',
                'name': 'New test2',
                'lastUpdated': '2015-01-02T13:00:00.000+0000',
            };

            var staleTest2Data = {
                'code': 'test2',
                'name': 'test2',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var updatedTest3Data = {
                'code': 'test3',
                'name': 'New test3',
                'lastUpdated': '2015-01-02T13:00:00.000+0000',
                'clientLastUpdated': '2015-01-02T13:00:00.000+0000'
            };

            var staleTest3Data = {
                'code': 'test3',
                'name': 'test3',
                'lastUpdated': '2015-01-02T12:00:00.000+0000',
            };

            var equalsPred = function(item1, item2) {
                return item1.code === item2.code;
            };

            var dataFromDhis = [test1Data, updatedTest2Data, staleTest3Data];
            var dataFromDB = [staleTest2Data, updatedTest3Data, test1Data];

            var actualData = mergeByLastUpdated(equalsPred, undefined, undefined, dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual([test1Data, updatedTest2Data, updatedTest3Data]);
        });

        it("should compare based on custom timestamp fields and local copy wins", function() {
            var eq = function(item1, item2) {
                return item1.key === item2.key;
            };

            var dataFromDhis = [{
                key: "key",
                "value": {
                    'id': 'test1',
                    'name': 'test2',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000',
                }
            }];

            var dataFromDB = [{
                key: "key",
                "value": {
                    'id': 'test1',
                    'name': 'test3',
                    'lastUpdated': '2014-12-02T10:00:00.000+0000',
                    'clientLastUpdated': '2015-01-02T11:00:00.000+0000',
                }
            }];

            var actualData = mergeByLastUpdated(eq, "value.lastUpdated", "value.clientLastUpdated", dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDB);
        });

        it("should compare based on custom timestamp fields and dhis copy wins", function() {

            var eq = function(item1, item2) {
                return item1.key === item2.key;
            };

            var dataFromDhis = [{
                key: "key",
                value: {
                    'id': 'test1',
                    'name': 'test2',
                    'lastUpdated': '2015-01-02T10:00:00.000+0000',
                }
            }];

            var dataFromDB = [{
                key: "key",
                "value": {
                    'id': 'test1',
                    'name': 'test3',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000',
                }
            }];

            var actualData = mergeByLastUpdated(eq, "value.lastUpdated", "value.lastUpdated", dataFromDhis, dataFromDB, logger);
            expect(actualData).toEqual(dataFromDhis);
        });


    });
});