define(["projectsController", "angularMocks", "utils"], function(ProjectsController, mocks, utils) {
    describe("projects controller", function() {
        var q, db, scope, mockStore, allOrgUnits, projectsService, projectsController;
        var getOrgUnit = function(id, name, level, parent) {
            return {
                'id': id,
                'name': name,
                'level': level,
                'parent': parent
            };
        };
        var expectedOrgUnitTree = [{
            'id': 1,
            'name': 'msf',
            'level': 1,
            'parent': null,
            'children': [{
                'id': 2,
                'name': 'ocp',
                'level': 2,
                'parent': {
                    id: 1
                },
                'children': []
            }]
        }];

        beforeEach(mocks.inject(function($rootScope, $q) {
            q = $q;
            db = {
                objectStore: function() {}
            };
            allOrgUnits = [getOrgUnit(1, 'msf', 1, null), getOrgUnit(2, 'ocp', 2, {
                id: 1
            })];
            scope = $rootScope.$new();

            mockStore = {
                getAll: function() {}
            };

            projectsService = {
                "create": function() {}
            };
            spyOn(db, 'objectStore').and.returnValue(mockStore);
            spyOn(mockStore, 'getAll').and.returnValue(utils.getPromise(q, allOrgUnits));
            projectsController = new ProjectsController(scope, db, projectsService);
        }));

        it("should fetch and display all organisation units", function() {
            scope.$apply();

            expect(scope.organisationUnits).toEqual(expectedOrgUnitTree);
        });

        it("should show the selected organisation unit details", function() {
            var orgUnit = {
                'id': 1
            };

            scope.onOrgUnitSelect(orgUnit);
            scope.$apply();

            expect(scope.orgUnit).toEqual(orgUnit);
        });

        it("should save organization unit in dhis", function() {
            var orgUnit = {
                'id': 1
            };
            spyOn(projectsService, 'create').and.returnValue(utils.getPromise(q, {}));

            scope.save(orgUnit);
            scope.$apply();

            expect(projectsService.create).toHaveBeenCalledWith(orgUnit);
            expect(scope.saveSuccess).toEqual(true);
        });

        it("should display error if saving organization unit fails", function() {
            var orgUnit = {
                'id': 1
            };
            spyOn(projectsService, 'create').and.returnValue(utils.getRejectedPromise(q, {}));

            scope.save(orgUnit);
            scope.$apply();

            expect(projectsService.create).toHaveBeenCalledWith(orgUnit);
            expect(scope.saveSuccess).toEqual(false);
        });
    });
});