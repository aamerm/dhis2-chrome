define(["chromeUtils", "lodash"], function(chromeUtils, _) {
    return function($q, $scope, $location, $rootScope, $hustle, ngI18nResourceBundle, db, packagedDataImporter, sessionHelper, orgUnitRepository, systemSettingRepository) {
        $scope.projects = [];

        $scope.canChangeProject = function(hasUserLoggedIn, isCoordinationApprover) {
            return hasUserLoggedIn && isCoordinationApprover;
        };

        $scope.isActive = function(viewLocationRegex) {
            var re = new RegExp(viewLocationRegex);
            return re.test($location.path());
        };

        $scope.hasSelectedProject = function() {
            if (_.isUndefined($rootScope.currentUser.selectedProject))
                return false;

            return true;
        };

        $scope.getAllowedOrgUnits = function() {
            return _.pluck($rootScope.allowedOrgUnits, "name").toString();
        };

        var deregisterCurrentUserLocaleWatcher = $rootScope.$watch("currentUser.locale", function() {
            var getResourceBundle = function(locale, shouldFetchTranslations) {
                var fetchResourceBundleFromDb = function() {
                    var store = db.objectStore('translations');
                    var query = db.queryBuilder().$index('by_locale').$eq($rootScope.currentUser.locale).compile();
                    return store.each(query).then(function(translations) {
                        _.transform(translations, function(acc, translation) {
                            acc[translation.objectUid] = translation.value;
                        }, $rootScope.resourceBundle);
                    });
                };

                var getTranslationsForCurrentLocale = function() {
                    if (!$rootScope.currentUser.locale) $rootScope.currentUser.locale = "en";
                    fetchResourceBundleFromDb();
                };

                ngI18nResourceBundle.get({
                    "locale": locale
                }).then(function(data) {
                    $rootScope.resourceBundle = data.data;
                    if (shouldFetchTranslations) getTranslationsForCurrentLocale();
                });
            };

            return $rootScope.currentUser ? getResourceBundle($rootScope.currentUser.locale, true) : getResourceBundle("en", false);
        });

        var loadProjects = function() {
            if ($rootScope.currentUser && $rootScope.currentUser.organisationUnits) {
                $scope.projects = _.sortBy($rootScope.currentUser.organisationUnits, "name");
                if (!_.isEmpty($scope.projects) && $rootScope.currentUser.selectedProject) {
                    $scope.selectedProject = _.find($scope.projects, "id", $rootScope.currentUser.selectedProject.id);
                }
            }
        };

        var loadUserLineListModules = function() {
            if ($rootScope.currentUser && $rootScope.currentUser.selectedProject) {
                return orgUnitRepository.getAllModulesInOrgUnits($rootScope.currentUser.selectedProject.id).then(function(modules) {
                    $scope.allUserModules = _.map(modules, function(module) {
                        return {
                            "id": module.id,
                            "displayName": module.parent.name + ' - ' + module.name,
                            "isLineListService": _.any(module.attributeValues, {
                                "attribute": {
                                    "code": "isLineListService"
                                },
                                "value": "true"
                            })
                        };
                    });
                });
            }
        };

        $scope.logout = function() {
            sessionHelper.logout();
        };

        $scope.setSelectedProject = function(selectedProject) {
            $rootScope.currentUser.selectedProject = selectedProject;
            loadUserLineListModules();
            $rootScope.$emit('selectedProjectUpdated');
            sessionHelper.saveSessionState();
            $location.path("/dashboard");
        };

        var deregisterUserPreferencesListener = $rootScope.$on('userPreferencesUpdated', function() {
            loadProjects();
            loadUserLineListModules();
        });

        $scope.$on('$destroy', function() {
            deregisterUserPreferencesListener();
            deregisterCurrentUserLocaleWatcher();
        });

        var init = function() {

            var validateAndContinue = function(isProductKeySet) {
                if (!isProductKeySet) {
                    $location.path("/productKeyPage");
                } else {
                    chromeUtils.sendMessage("dbReady");
                    $location.path("/login");
                }
            };

            $scope.allUserLineListModules = [];
            packagedDataImporter.run()
                .then(systemSettingRepository.isProductKeySet)
                .then(validateAndContinue);
        };

        init();
    };
});
