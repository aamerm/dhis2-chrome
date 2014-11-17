define(["dataRepository", "dataSetRepository", "userPreferenceRepository", "orgUnitRepository", "systemSettingRepository", "userRepository", "approvalDataRepository", "programRepository", "programEventRepository"],
    function(dataRepository, dataSetRepository, userPreferenceRepository, orgUnitRepository, systemSettingRepository, userRepository, approvalDataRepository, programRepository, programEventRepository) {
        var init = function(app) {
            app.service('dataRepository', ['$indexedDB', dataRepository]);
            app.service('approvalDataRepository', ['$indexedDB', approvalDataRepository]);
            app.service('dataSetRepository', ['$indexedDB', dataSetRepository]);
            app.service('systemSettingRepository', ['$indexedDB', systemSettingRepository]);
            app.service('userPreferenceRepository', ['$indexedDB', userPreferenceRepository]);
            app.service('orgUnitRepository', ['$indexedDB', orgUnitRepository]);
            app.service('userRepository', ['$indexedDB', userRepository]);
            app.service('programRepository', ['$indexedDB', '$q', programRepository]);
            app.service('programEventRepository', ['$indexedDB', programEventRepository]);
        };
        return {
            init: init
        };
    });