define(["metadataService", "properties", "angularMocks", "moment"], function(MetadataService, properties, mocks, moment) {
    describe("Metadata service", function() {
        var httpBackend, http, metadataService;

        beforeEach(inject(function($injector) {
            httpBackend = $injector.get('$httpBackend');
            http = $injector.get('$http');
            metadataService = new MetadataService(http);
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it("should get all metadata from local file if syncing for the first time", function() {
            var lastWeek = moment().subtract(1, 'weeks').toISOString();

            var metadataInFile = {
                "users": [],
                "created": lastWeek
            };

            httpBackend.expectGET("/data/metadata.json").respond(200, metadataInFile);

            var actualMetadata;
            metadataService.loadMetadataFromFile().then(function(data) {
                actualMetadata = data;
            });

            httpBackend.flush();
            expect(actualMetadata).toEqual(metadataInFile);
        });

        it("should not get metadata from local file if import has already happened before", function() {
            var lastWeek = moment().subtract(1, 'weeks').toISOString();
            var lastUpdated = moment().subtract(1, 'days').toISOString();

            var metadataInFile = {
                "users": [],
                "created": lastWeek
            };

            httpBackend.expectGET("/data/metadata.json").respond(200, metadataInFile);

            var actualMetadata;
            metadataService.loadMetadataFromFile(lastUpdated).then(function(data) {
                actualMetadata = data;
            });

            httpBackend.flush();
            expect(actualMetadata).toBeUndefined();
        });

        it("should get metadata from DHIS based on last updated date specified", function() {
            var today = moment().toISOString();
            var lastUpdated = moment().subtract(1, 'days').toISOString();

            var metadata = {
                "users": [],
                "created": today
            };

            var filterString = "attributes=false&dataApprovalLevels=false&userRoles=false&userGroups=false&options=false" +
                "&dashboardItems=false&dashboards=false&dataElementGroupSets=false&indicators=false&indicatorTypes=false" +
                "&organisationUnits=false&organisationUnitGroups=false&sqlViews=false&charts=false" +
                "&reportTables=false&dataSets=false&eventReports=false&eventCharts=false&programs=false&programStages=false&programStageSections=false" +
                "&trackedEntities=false";
            httpBackend.expectGET(properties.dhis.url + "/api/metadata.json?" + filterString + "&lastUpdated=" + lastUpdated).respond(200, metadata);

            var actualMetadata;
            metadataService.getMetadata(lastUpdated).then(function(data) {
                actualMetadata = data;
            });

            httpBackend.flush();
            expect(actualMetadata).toEqual(metadata);
        });

        it("should get all metadata from DHIS if syncing for the first time", function() {
            var today = moment().toISOString();

            var metadata = {
                "users": [],
                "created": today
            };

            var filterString = "attributes=false&dataApprovalLevels=false&userRoles=false&userGroups=false&options=false" +
                "&dashboardItems=false&dashboards=false&dataElementGroupSets=false&indicators=false&indicatorTypes=false" +
                "&organisationUnits=false&organisationUnitGroups=false&sqlViews=false&charts=false" +
                "&reportTables=false&dataSets=false&eventReports=false&eventCharts=false&programs=false&programStages=false&programStageSections=false" +
                "&trackedEntities=false";
            httpBackend.expectGET(properties.dhis.url + "/api/metadata.json?" + filterString).respond(200, metadata);

            var actualMetadata;
            metadataService.getMetadata().then(function(data) {
                actualMetadata = data;
            });

            httpBackend.flush();
            expect(actualMetadata).toEqual(metadata);
        });
    });
});