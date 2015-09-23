/*global Date:true*/
define(["orgUnitContoller", "angularMocks", "utils", "lodash", "orgUnitRepository"], function(OrgUnitController, mocks, utils, _, OrgUnitRepository) {
    describe("org unit controller", function() {
        var q, db, scope, mockOrgStore, mockOrgUnitLevelStore, allOrgUnits,
            orgUnitContoller, parent, location, today, _Date, todayStr, timeout, anchorScroll, expectedOrgUnitTree, child, orgUnitRepository, rootScope;
        var getOrgUnit = function(id, name, level, parent) {
            return {
                'id': id,
                'name': name,
                'level': level,
                'parent': parent,
                'attributeValues': [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "country"
                }]
            };
        };

        var orgUnitLevels = [{
            'level': 1,
            'name': 'Company'
        }, {
            'level': 2,
            'name': 'Operational Center'
        }, {
            'level': 3,
            'name': 'Country'
        }, {
            'level': 4,
            'name': 'Project'
        }, {
            'level': 5,
            'name': 'Operation Unit / Module'
        }, {
            'level': 6,
            'name': 'Module'
        }];

        beforeEach(mocks.inject(function($rootScope, $q, $location, $timeout, $anchorScroll) {
            child = {
                'id': 2,
                'name': 'ocp',
                'level': 2,
                'parent': {
                    id: 1
                },
                'children': [],
                'collapsed': true,
                'selected': false,
                'attributeValues': [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "country"
                }]
            };

            expectedOrgUnitTree = [{
                'id': 1,
                'name': 'msf',
                'level': 1,
                'parent': null,
                'children': [child],
                'collapsed': true,
                'selected': false,
                'attributeValues': [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "country"
                }]
            }];
            rootScope = $rootScope;
            q = $q;
            allOrgUnits = [getOrgUnit(1, 'msf', 1, null), getOrgUnit(2, 'ocp', 2, {
                id: 1
            })];
            scope = rootScope.$new();
            location = $location;
            timeout = $timeout;
            mockOrgStore = {
                getAll: function() {},
                upsert: function() {}
            };
            mockOrgUnitLevelStore = {
                getAll: function() {}
            };
            orgUnitRepository = new OrgUnitRepository();
            spyOn(orgUnitRepository, "getAll").and.returnValue(utils.getPromise(q, allOrgUnits));
            var stores = {
                "organisationUnits": mockOrgStore,
                "organisationUnitLevels": mockOrgUnitLevelStore
            };
            db = {
                objectStore: function(store) {
                    return stores[store];
                }
            };

            rootScope.currentUser = {
                "firstName": "test1",
                "lastName": "test1last",
                "locale": "en",
                "userCredentials": {
                    "username": "dataentryuser",
                    "userRoles": [{
                        "id": "hxNB8lleCsl",
                        "name": 'Superuser'
                    }, {
                        "id": "hxNB8lleCsl",
                        "name": 'blah'
                    }]
                },
                "organisationUnits": [{
                    id: "proj_1",
                    "name": "MISSIONS EXPLOS"
                }, {
                    id: "test1",
                    "name": "MISSIONS EXPLOS123"
                }, {
                    id: "test2",
                    "name": "MISSIONS EXPLOS345"
                }]
            };

            spyOn(mockOrgUnitLevelStore, 'getAll').and.returnValue(utils.getPromise(q, orgUnitLevels));
            _Date = Date;
            todayStr = "2014-04-01";
            today = new Date(todayStr);
            Date = function() {
                return today;
            };

            parent = {
                'level': 1,
                'name': 'Name1',
                'id': 'Id1'
            };
            anchorScroll = jasmine.createSpy();
            orgUnitContoller = new OrgUnitController(scope, db, q, location, timeout, anchorScroll, rootScope, orgUnitRepository);
        }));

        afterEach(function() {
            Date = _Date;
        });

        it("should fetch and display all organisation units", function() {
            spyOn(scope, 'onOrgUnitSelect');
            scope.$apply();

            expect(orgUnitRepository.getAll).toHaveBeenCalled();
            expect(scope.organisationUnits).toEqual(expectedOrgUnitTree);
            expect(scope.onOrgUnitSelect).not.toHaveBeenCalled();
            expect(scope.state).toEqual(undefined);
        });

        it("should fetch and select the newly created organization unit", function() {
            spyOn(location, 'hash').and.returnValue([2, 1]);
            orgUnitContoller = new OrgUnitController(scope, db, q, location, timeout, anchorScroll, rootScope, orgUnitRepository);
            spyOn(scope, 'onOrgUnitSelect');
            var child = {
                id: 2,
                name: 'ocp',
                level: 2,
                parent: {
                    id: 1
                },
                'attributeValues': [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "country"
                }],
                children: [],
                selected: true,
                collapsed: false
            };

            scope.$apply();

            expect(scope.onOrgUnitSelect).toHaveBeenCalledWith(child);
            expect(scope.state).toEqual({
                currentNode: child
            });
            expect(scope.saveSuccess).toEqual(true);
        });

        it("should display a timed message after creating a organization unit", function() {
            spyOn(location, 'hash').and.returnValue([1, 2]);
            orgUnitContoller = new OrgUnitController(scope, db, q, location, timeout, anchorScroll, rootScope, orgUnitRepository);
            spyOn(scope, 'onOrgUnitSelect');

            scope.$apply();

            expect(scope.saveSuccess).toEqual(true);
            timeout.flush();
            expect(scope.saveSuccess).toEqual(false);
        });

        it("should get organization unit level mapping", function() {
            scope.$apply();

            expect(mockOrgUnitLevelStore.getAll).toHaveBeenCalled();
            expect(scope.orgUnitLevelsMap).toEqual({
                1: 'Company',
                2: 'Operational Center',
                3: 'Country',
                4: 'Project',
                5: 'Operation Unit / Module',
                6: 'Module'
            });
        });

        it("should close new form and select the newly created orgunit", function() {
            var successMessage = "saved successfully";
            var expectedSelectedNode = expectedOrgUnitTree[0];
            expectedSelectedNode.collapsed = false;
            expectedSelectedNode.selected = true;
            scope.closeNewForm({
                "id": 1
            }, successMessage);
            scope.$apply();

            expect(scope.message).toEqual(successMessage);
            expect(scope.showMessage).toBe(true);
            expect(scope.state.currentNode).toEqual(expectedSelectedNode);
        });

        it("should show the selected organisation unit details", function() {
            var orgUnit = {
                'id': 1,
                'level': 1,
                "attributeValues": [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Company"
                }]
            };
            scope.$apply();
            scope.onOrgUnitSelect(orgUnit);

            expect(scope.orgUnit).toEqual(orgUnit);
        });

        it("should set the organization unit", function() {
            var orgUnit = {
                'id': 1,
                'level': 1,
                "attributeValues": [{
                    "attribute": {
                        "code": "Type"
                    },
                    "value": "Company"
                }]
            };
            spyOn(location, 'hash');
            scope.$apply();
            scope.onOrgUnitSelect(orgUnit);

            expect(location.hash).toHaveBeenCalled();
            expect(scope.orgUnit).toEqual(orgUnit);
            expect(anchorScroll).toHaveBeenCalled();
        });

        it("should set the template url to be displayed for New mode", function() {
            scope.openInNewMode('Country');

            expect(scope.templateUrl.split('?')[0]).toEqual('templates/partials/country-form.html');
            expect(scope.isNewMode).toEqual(true);
        });

        it("should set the template url for view mode", function() {
            scope.openInViewMode('Module');

            expect(scope.templateUrl.split('?')[0]).toEqual('templates/partials/module-form.html');
            expect(scope.isNewMode).toEqual(false);
        });
    });
});
