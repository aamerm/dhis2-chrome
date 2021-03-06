define(['reportsController', 'dataEntryController', 'mainController', 'orgUnitContoller', 'loginController', 'opUnitController', 'aggregateModuleController',
        'lineListModuleController', 'projectController', 'countryController', 'confirmDialogController', 'projectUserController',
        'aggregateDataEntryController', 'lineListDataEntryController', 'patientOriginController', 'productKeyController',
        'lineListSummaryController', 'dataApprovalController', 'dataEntryApprovalDashboardController', 'lineListOfflineApprovalController', 'appCloneController', 'downloadDataController', 'notificationDialogController', 'selectLanguageController',
        'referralLocationsController', 'notificationsController', 'selectProjectPreferenceController'
    ],
    function(reportsController, dataEntryController, mainController, orgUnitContoller, loginController, opUnitController, aggregateModuleController,
        lineListModuleController, projectController, countryController, confirmDialogController, projectUserController,
        aggregateDataEntryController, lineListDataEntryController, patientOriginController, productKeyController,
        lineListSummaryController, dataApprovalController, dataEntryApprovalDashboardController, lineListOfflineApprovalController, appCloneController, downloadDataController, notificationDialogController, selectLanguageController,
        referralLocationsController, notificationsController, selectProjectPreferenceController) {

        var init = function(app) {
            app.controller('reportsController', ['$scope', '$q', '$routeParams', 'datasetRepository', 'orgUnitRepository', 'chartRepository', 'pivotTableRepository', reportsController]);
            app.controller('dataEntryApprovalDashboardController', ['$scope', '$hustle', '$q', '$rootScope', '$modal', '$timeout', '$location', 'orgUnitRepository', 'approvalDataRepository', 'dataRepository', 'programEventRepository', dataEntryApprovalDashboardController]);
            app.controller('dataEntryController', ['$scope', '$routeParams', '$q', '$location', '$rootScope', 'orgUnitRepository', dataEntryController]);
            app.controller('aggregateDataEntryController', ['$scope', '$routeParams', '$q', '$hustle', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', '$timeout', 'dataRepository', 'excludedDataElementsRepository', 'approvalDataRepository', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'referralLocationsRepository', aggregateDataEntryController]);
            app.controller('dataApprovalController', ['$scope', '$routeParams', '$q', '$hustle', 'dataRepository', 'excludedDataElementsRepository', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', 'approvalDataRepository', '$timeout', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'referralLocationsRepository', dataApprovalController]);
            app.controller('lineListDataEntryController', ['$scope', '$rootScope', '$routeParams', '$location', '$anchorScroll', 'programEventRepository', 'optionSetRepository', 'orgUnitRepository', 'excludedDataElementsRepository', 'programRepository', lineListDataEntryController]);
            app.controller('lineListSummaryController', ['$scope', '$q', '$hustle', '$modal', '$window', '$timeout', '$location', '$anchorScroll', '$routeParams', 'programRepository', 'programEventRepository', 'excludedDataElementsRepository', 'orgUnitRepository', 'approvalDataRepository', 'referralLocationsRepository', lineListSummaryController]);
            app.controller('orgUnitContoller', ['$scope', '$q', '$location', '$timeout', '$anchorScroll', '$rootScope', 'orgUnitRepository', orgUnitContoller]);
            app.controller('opUnitController', ['$scope', '$q', '$hustle', 'orgUnitRepository', 'orgUnitGroupHelper', '$indexedDB', '$location', '$modal', 'patientOriginRepository', 'orgUnitGroupSetRepository', opUnitController]);
            app.controller('aggregateModuleController', ['$scope', '$hustle', 'orgUnitRepository', 'datasetRepository', 'systemSettingRepository', 'excludedDataElementsRepository', '$indexedDB', '$location', '$q', '$modal', 'orgUnitGroupHelper', 'originOrgunitCreator', aggregateModuleController]);
            app.controller('lineListModuleController', ['$scope', '$hustle', 'orgUnitRepository', 'excludedDataElementsRepository', '$q', '$modal', 'programRepository', 'orgUnitGroupHelper', 'datasetRepository', 'originOrgunitCreator', lineListModuleController]);
            app.controller('projectController', ['$scope', '$rootScope', '$hustle', 'orgUnitRepository', '$q', 'orgUnitGroupHelper', 'approvalDataRepository', 'orgUnitGroupSetRepository', projectController]);
            app.controller('mainController', ['$q', '$scope', '$location', '$rootScope', '$hustle', '$timeout', 'ngI18nResourceBundle', '$indexedDB', 'packagedDataImporter', 'sessionHelper', 'orgUnitRepository', 'systemSettingRepository', 'dhisMonitor', mainController]);
            app.controller('loginController', ['$rootScope', '$scope', '$location', '$indexedDB', '$q', 'sessionHelper', '$hustle', 'userPreferenceRepository', 'orgUnitRepository', 'systemSettingRepository', loginController]);
            app.controller('countryController', ['$scope', '$hustle', 'orgUnitRepository', '$q', '$location', '$timeout', '$anchorScroll', countryController]);
            app.controller('confirmDialogController', ['$scope', '$modalInstance', confirmDialogController]);
            app.controller('notificationDialogController', ['$scope', '$modalInstance', notificationDialogController]);
            app.controller('projectUserController', ['$scope', '$hustle', '$timeout', '$modal', 'userRepository', projectUserController]);
            app.controller('patientOriginController', ['$scope', '$hustle', '$q', 'patientOriginRepository', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'originOrgunitCreator', 'orgUnitGroupHelper', patientOriginController]);
            app.controller('productKeyController', ['$scope', '$location', '$rootScope', 'packagedDataImporter', 'sessionHelper', 'systemSettingRepository', productKeyController]);
            app.controller('lineListOfflineApprovalController', ['$scope', '$q', 'programEventRepository', 'orgUnitRepository', 'programRepository', 'optionSetRepository', 'datasetRepository', 'referralLocationsRepository', lineListOfflineApprovalController]);
            app.controller('appCloneController', ['$scope', '$modal', '$timeout', 'indexeddbUtils', 'filesystemService', 'sessionHelper', '$location', '$rootScope', appCloneController]);
            app.controller('downloadDataController', ['$scope', '$hustle', '$q', '$rootScope', '$timeout', downloadDataController]);
            app.controller('selectLanguageController', ['$scope', '$rootScope', '$indexedDB', 'ngI18nResourceBundle', selectLanguageController]);
            app.controller('referralLocationsController', ['$scope', '$hustle', '$modal', 'referralLocationsRepository', referralLocationsController]);
            app.controller('notificationsController', ['$scope', '$q', '$rootScope', 'userPreferenceRepository', 'chartRepository', 'orgUnitRepository', notificationsController]);
            app.controller('selectProjectPreferenceController', ['$rootScope', '$scope', '$hustle', '$location', 'orgUnitRepository', 'userPreferenceRepository', 'systemSettingRepository', selectProjectPreferenceController]);
        };
        return {
            init: init
        };
    });
