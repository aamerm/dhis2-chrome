define(["dataValuesConsumer", "orgUnitConsumer", "dispatcher", "consumerRegistry"], function(dataValuesConsumer, orgUnitConsumer, dispatcher, consumerRegistry) {
    var init = function(app) {
        app.service("dataValuesConsumer", ["dataService", "dataRepository", "dataSetRepository", "userPreferenceRepository", "$q", "approvalService", dataValuesConsumer]);
        app.service("orgUnitConsumer", ["orgUnitService", orgUnitConsumer]);
        app.service("dispatcher", ["$q", "dataValuesConsumer", "orgUnitConsumer", dispatcher]);
        app.service("consumerRegistry", ["$hustle", "$q", "dispatcher", consumerRegistry]);
    };
    return {
        init: init
    };
});