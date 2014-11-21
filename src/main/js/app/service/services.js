define(["metadataService", "dataService", "orgUnitService", "userService", "approvalService", "datasetService", "systemSettingService", "programService", "eventService"],
    function(metadataService, dataService, orgUnitService, userService, approvalService, datasetService, systemSettingService, programService, eventService) {
        var init = function(app) {
            app.service('metadataService', ['$http', '$indexedDB', '$q', metadataService]);
            app.service('dataService', ['$http', '$q', dataService]);
            app.service('orgUnitService', ['$http', '$indexedDB', orgUnitService]);
            app.service('datasetService', ['$http', datasetService]);
            app.service('systemSettingService', ['$http', systemSettingService]);
            app.service('userService', ['$http', '$indexedDB', userService]);
            app.service('approvalService', ['$http', '$indexedDB', '$q', approvalService]);
            app.service('programService', ['$http', programService]);
            app.service('eventService', ['$http', '$q', eventService]);
        };
        return {
            init: init
        };
    });