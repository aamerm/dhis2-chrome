define(["dataEntryController", "testData", "angularMocks", "lodash", "utils"], function(DataEntryController, testData, mocks, _, utils) {
    describe("dataEntryController ", function() {
        var scope, db, mockStore, q;

        beforeEach(mocks.inject(function($rootScope, $q) {
            q = $q;
            db = {
                objectStore: function() {}
            };
            mockStore = function(data) {
                var getAll = function() {
                    return utils.getPromise(q, data);
                };

                return {
                    getAll: getAll
                };
            };

            spyOn(db, 'objectStore').and.callFake(function(storeName) {
                return mockStore(testData[storeName]);
            });
            scope = $rootScope.$new();
        }));

        it("should return the sum of the list ", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            var list = ["1", "2", "3", "4"];
            expect(scope.sum(list)).toBe(10);
        });

        it("should return the sum of valid values ", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            var list = ["1", "2", undefined, "4"];

            expect(scope.sum(list)).toBe(7);
        });

        it("should return the sum of valid expressions ", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            var list = ["1+3", "2", "3", "4"];

            expect(scope.sum(list)).toBe(13);
        });

        it("should return the sum of the map ", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            var list = {
                a: "1",
                b: "2",
                c: "3",
                d: "4"
            };
            expect(scope.sum(list)).toBe(10);
        });

        it("should group sections based on datasets", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();

            var dataSetKeys = _.keys(scope.groupedSections);
            expect(dataSetKeys.length).toBe(2);
            expect(dataSetKeys).toContain("DS_OPD");
            expect(dataSetKeys).toContain("Vacc");

            expect(scope.groupedSections.DS_OPD.length).toBe(2);
            expect(scope.groupedSections.Vacc.length).toBe(1);
        });

        it("should group set headers on sections", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();

            var section1 = scope.groupedSections.DS_OPD[0];
            expect(section1.headers).toEqual([
                ["Resident", "Migrant"],
                ["LessThan5", "GreaterThan5", "LessThan5", "GreaterThan5", ]
            ]);

            expect(section1.categoryOptionComboIds).toEqual([1, 2, 3, 4]);
            var section2 = scope.groupedSections.Vacc[0];
            expect(section2.headers).toEqual([
                ["LessThan5", "GreaterThan5"]
            ]);
            expect(section2.categoryOptionComboIds).toEqual([1, 2]);
        });

        it("should get dataelements associated with sections", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();

            var opdSections = scope.groupedSections.DS_OPD;

            var dataElements = opdSections[0].dataElements;
            expect(dataElements.length).toBe(2);
            expect(dataElements[0].id).toContain("DE1");
            expect(dataElements[1].id).toContain("DE2");

            dataElements = opdSections[1].dataElements;
            expect(dataElements.length).toBe(1);
            expect(dataElements[0].id).toContain("DE1");
        });

        it("should enrich dataelements with categories", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();

            var opdSections = scope.groupedSections.DS_OPD;
            var dataElements = opdSections[0].dataElements;
            var categories = dataElements[0].categories;

            expect(categories.length).toBe(2);
        });


        it("should return the data set name given the id", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();
            var datasetId = "DS_OPD";
            expect(scope.getDataSetName(datasetId)).toEqual("OPD");
        });

        it("should initialize section values", function() {
            var dataEntryController = new DataEntryController(scope, q, db);
            scope.$apply();

            expect(_.keys(scope.sectionValues).length).toBe(testData.sections.length);
            _.each(testData.sections, function(testDataSection) {
                expect(_.keys(scope.sectionValues[testDataSection.id]).length).toBe(testDataSection.dataElements.length);
            });
        });

    });
});