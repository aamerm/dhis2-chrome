define(["dataService", "angularMocks", "properties", "moment", "testData"], function(DataService, mocks, properties, moment, testData) {
    describe("dataService", function() {
        var httpBackend, http, dataSetStore, dataValuesStore;

        beforeEach(mocks.inject(function($injector, $q) {
            q = $q;
            httpBackend = $injector.get('$httpBackend');
            http = $injector.get('$http');

            Timecop.install();
            Timecop.freeze(new Date("2015-11-05T12:43:54.972Z"));
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should save datavalues to dhis", function() {
            var dataValues = [{
                "period": '2014W15',
                "orgUnit": 'company_0',
                "dataElement": "DE1",
                "categoryOptionCombo": "COC1",
                "value": "1",
            }, {
                "period": '2014W15',
                "orgUnit": 'company_0',
                "dataElement": "DE2",
                "categoryOptionCombo": "COC2",
                "value": "2",
            }];

            var expectedPayload = {
                "dataValues": dataValues
            };
            httpBackend.expectPOST(properties.dhis.url + "/api/dataValueSets", expectedPayload).respond(200, "ok");

            var dataService = new DataService(http);
            dataService.save(dataValues);

            httpBackend.flush();
        });


        it("should download all data for an org unit", function() {
            var today = moment().format("YYYY-MM-DD");
            var dataValues = [{
                "dataElement": "b9634a78271",
                "period": "2014W8",
                "orgUnit": "c484c99b86d",
                "categoryOptionCombo": "h48rgCOjDTg",
                "value": "12",
                "storedBy": "service.account",
                "followUp": false
            }];

            var dataValuesFromDhis = {
                "dataValues": dataValues
            };

            var startDate = "2015-10-28";
            var period = "2015W45";

            httpBackend.expectGET(properties.dhis.url + "/api/dataValueSets?children=true&dataSet=DS_OPD&dataSet=Vacc&orgUnit=company_0&period=" + period).respond(200, dataValuesFromDhis);

            var actualDataValues;
            var dataService = new DataService(http, q);
            dataService.downloadAllData('company_0', ["DS_OPD", "Vacc"], startDate).then(function(result) {
                actualDataValues = result;
            });

            httpBackend.flush();

            var expectedPayload = [{
                "dataElement": "b9634a78271",
                "period": "2014W08",
                "orgUnit": "c484c99b86d",
                "categoryOptionCombo": "h48rgCOjDTg",
                "value": "12",
                "storedBy": "service.account",
                "followUp": false
            }];
            expect(actualDataValues).toEqual(expectedPayload);
        });


    });
});
