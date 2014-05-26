define(['dashboardController', 'dataEntryController', 'mainController', 'orgUnitContoller', 'loginController', 'opUnitController', 'moduleController', 'projectController', 'countryController', 'confirmDialogController',
        'projectUserController', 'dataSetRepository', "userPreferenceRepository"
    ],
    function(dashboardController, dataEntryController, mainController, orgUnitContoller, loginController, opUnitController, moduleController, projectController, countryController, confirmDialogController,
        projectUserController, dataSetRepository, userPreferenceRepository) {
        var init = function(app) {
            app.controller('dashboardController', ['$scope', '$q', 'dataSetRepository', 'dataRepository', 'dataService', '$rootScope', dashboardController]);
            app.controller('dataEntryController', ['$scope', '$q', '$hustle', '$indexedDB', 'dataRepository', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', 'approvalService', dataEntryController]);
            app.controller('orgUnitContoller', ['$scope', '$indexedDB', '$q', '$location', '$timeout', '$anchorScroll', orgUnitContoller]);
            app.controller('opUnitController', ['$scope', 'orgUnitService', '$indexedDB', '$location', opUnitController]);
            app.controller('moduleController', ['$scope', 'orgUnitService', '$indexedDB', '$location', '$q', moduleController]);
            app.controller('projectController', ['$scope', 'orgUnitService', '$q', '$location', '$timeout', '$anchorScroll', 'userService', '$modal', projectController]);
            app.controller('mainController', ['$scope', '$rootScope', 'ngI18nResourceBundle', '$indexedDB', 'userPreferenceRepository', mainController]);
            app.controller('loginController', ['$scope', '$rootScope', '$location', '$indexedDB', '$q', 'userPreferenceRepository', loginController]);
            app.controller('countryController', ['$scope', 'orgUnitService', '$q', '$location', '$timeout', '$anchorScroll', countryController]);
            app.controller('confirmDialogController', ['$scope', '$modalInstance', confirmDialogController]);
            app.controller('projectUserController', ['$scope', 'userService', projectUserController]);
        };
        return {
            init: init
        };
    });