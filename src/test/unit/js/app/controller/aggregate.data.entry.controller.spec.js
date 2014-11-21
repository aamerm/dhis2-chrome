/*global Date:true*/
define(["aggregateDataEntryController", "testData", "angularMocks", "lodash", "utils", "orgUnitMapper", "moment", "dataRepository", "approvalDataRepository", "orgUnitRepository", "approvalHelper"],
    function(AggregateDataEntryController, testData, mocks, _, utils, orgUnitMapper, moment, DataRepository, ApprovalDataRepository, OrgUnitRepository, ApprovalHelper) {
        describe("aggregateDataEntryController ", function() {
            var scope, routeParams, db, q, location, anchorScroll, aggregateDataEntryController, rootScope, approvalStore,
                saveSuccessPromise, saveErrorPromise, dataEntryFormMock, parentProject, getLevelOneApprovalDataSpy, getLevelTwoApprovalDataSpy, getDataValuesSpy,
                orgUnits, window, approvalStoreSpy, getOrgUnitSpy, hustle, dataRepository, approvalDataRepository, timeout, orgUnitRepository, approvalHelper;

            beforeEach(module('hustle'));
            beforeEach(mocks.inject(function($rootScope, $q, $hustle, $anchorScroll, $location, $window, $timeout) {
                q = $q;
                hustle = $hustle;
                window = $window;
                timeout = $timeout;
                location = $location;
                anchorScroll = $anchorScroll;
                rootScope = $rootScope;
                routeParams = {};

                scope = $rootScope.$new();
                dataRepository = new DataRepository();
                approvalDataRepository = new ApprovalDataRepository();
                approvalHelper = new ApprovalHelper();

                scope.currentModule = {
                    id: 'mod2',
                    parent: {
                        id: 'parent'
                    }
                };
                scope.year = 2014;
                scope.week = {
                    "weekNumber": 14
                };

                orgUnitRepository = new OrgUnitRepository();
                parentProject = {
                    'id': 'parent',
                    'attributeValues': [{
                        'attribute': {
                            'code': 'Type',
                            'name': 'Type',
                        },
                        'value': 'Project'
                    }]
                };

                getOrgUnitSpy = spyOn(orgUnitRepository, "getOrgUnit");
                getOrgUnitSpy.and.returnValue(utils.getPromise(q, parentProject));
                spyOn(orgUnitRepository, "getAllModulesInProjects").and.returnValue(utils.getPromise(q, []));

                var queryBuilder = function() {
                    this.$index = function() {
                        return this;
                    };
                    this.$eq = function(v) {
                        return this;
                    };
                    this.compile = function() {
                        return "blah";
                    };
                    return this;
                };

                db = {
                    "objectStore": function() {},
                    "queryBuilder": queryBuilder
                };

                scope.dataentryForm = {
                    $setPristine: function() {}
                };

                scope.resourceBundle = {
                    "dataApprovalConfirmationMessage": ""
                };

                var getMockStore = function(data) {
                    var getAll = function() {
                        return utils.getPromise(q, data);
                    };
                    var upsert = function() {};
                    var find = function() {};
                    var each = function() {};

                    return {
                        getAll: getAll,
                        upsert: upsert,
                        find: find,
                        each: each,
                    };
                };
                approvalStore = getMockStore("approvals");

                spyOn(db, 'objectStore').and.callFake(function(storeName) {
                    if (storeName === "approvals")
                        return approvalStore;
                    return getMockStore(testData.get(storeName));
                });

                rootScope.currentUser = {
                    "firstName": "test1",
                    "lastName": "test1last",
                    "userCredentials": {
                        "username": "dataentryuser",
                        "userAuthorityGroups": [{
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

                spyOn(location, "hash");

                saveSuccessPromise = utils.getPromise(q, {
                    "ok": "ok"
                });

                saveErrorPromise = utils.getRejectedPromise(q, {
                    "ok": "ok"
                });

                approvalStoreSpy = spyOn(approvalStore, "each");
                approvalStoreSpy.and.returnValue(utils.getPromise(q, [{}]));


                getLevelOneApprovalDataSpy = spyOn(approvalDataRepository, "getLevelOneApprovalData");
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {}));

                getLevelTwoApprovalDataSpy = spyOn(approvalDataRepository, "getLevelTwoApprovalData");
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, {}));

                getDataValuesSpy = spyOn(dataRepository, "getDataValues");
                getDataValuesSpy.and.returnValue(utils.getPromise(q, undefined));

                fakeModal = {
                    close: function() {
                        this.result.confirmCallBack();
                    },
                    dismiss: function(type) {
                        this.result.cancelCallback(type);
                    },
                    open: function(object) {}
                };

                aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);
            }));

            it("should return the sum of the list ", function() {
                var list = {
                    "option1": {
                        "value": 1
                    },
                    "option2": {
                        "value": 2
                    },
                    "option3": {
                        "value": 3
                    },
                    "option4": {
                        "value": 4
                    }
                };

                expect(scope.sum(list)).toBe(10);
            });

            it("should return the sum of valid values ", function() {
                var list = {
                    "option1": {
                        "value": 1
                    },
                    "option2": {
                        "value": 2
                    },
                    "option3": {
                        "value": undefined
                    },
                    "option4": {
                        "value": 4
                    }
                };

                expect(scope.sum(list)).toBe(7);
            });

            it("should return the sum of valid expressions ", function() {
                var list = {
                    "option1": {
                        "formula": "1 + 3",
                        "value": 4
                    },
                    "option2": {
                        "value": 2
                    },
                    "option3": {
                        "value": 3
                    },
                    "option4": {
                        "value": 4
                    }
                };

                expect(scope.sum(list)).toBe(13);
            });

            it("should return the sum of the map ", function() {
                var list = {
                    "option1": {
                        "value": 1
                    },
                    "option2": {
                        "value": 2
                    },
                    "option3": {
                        "value": 3
                    },
                    "option4": {
                        "value": 4
                    }
                };
                expect(scope.sum(list)).toBe(10);
            });

            it("should evaluate expression on blur", function() {
                scope.dataValues = {
                    "blah": {
                        "some": {
                            "value": "1+9"
                        }
                    }
                };

                scope.evaluateExpression("blah", "some");

                expect(scope.dataValues.blah.some.value).toEqual(10);
            });

            it("should group sections based on datasets", function() {
                scope.$apply();

                var dataSetKeys = _.keys(scope.groupedSections);
                expect(dataSetKeys.length).toBe(2);
                expect(dataSetKeys).toContain("DS_OPD");
                expect(dataSetKeys).toContain("Vacc");

                expect(scope.groupedSections.DS_OPD.length).toBe(2);
                expect(scope.groupedSections.Vacc.length).toBe(1);
            });

            it("should return the data set name given the id", function() {
                scope.$apply();
                var datasetId = "DS_OPD";
                expect(scope.getDataSetName(datasetId)).toEqual("OPD");
            });

            it("should submit data values to indexeddb and dhis", function() {
                spyOn(approvalDataRepository, "unapproveLevelOneData").and.returnValue(utils.getPromise(q, undefined));
                spyOn(approvalDataRepository, "unapproveLevelTwoData").and.returnValue(utils.getPromise(q, undefined));
                spyOn(dataRepository, "save").and.returnValue(saveSuccessPromise);
                spyOn(hustle, "publish");
                spyOn(scope.dataentryForm, '$setPristine');

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);

                scope.submit();
                scope.$apply();

                expect(dataRepository.save).toHaveBeenCalled();
                expect(hustle.publish).toHaveBeenCalledWith({
                    data: {
                        ok: 'ok'
                    },
                    type: 'uploadDataValues'
                }, 'dataValues');

                expect(scope.submitSuccess).toBe(true);
                expect(scope.saveSuccess).toBe(false);
                expect(scope.submitError).toBe(false);
                expect(scope.saveError).toBe(false);
                expect(scope.dataentryForm.$setPristine).toHaveBeenCalled();
            });

            it("should save data values as draft to indexeddb", function() {

                spyOn(dataRepository, "saveAsDraft").and.returnValue(saveSuccessPromise);
                spyOn(hustle, "publish");
                spyOn(scope.dataentryForm, '$setPristine');

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);

                scope.saveAsDraft();
                scope.$apply();

                expect(dataRepository.saveAsDraft).toHaveBeenCalled();
                expect(hustle.publish).not.toHaveBeenCalled();
                expect(scope.submitSuccess).toBe(false);
                expect(scope.saveSuccess).toBe(true);
                expect(scope.submitError).toBe(false);
                expect(scope.saveError).toBe(false);
                expect(scope.dataentryForm.$setPristine).toHaveBeenCalled();
            });

            it("should warn the user when data will have to be reapproved", function() {
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    "blah": "moreBlah"
                }));
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, {}));

                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);


                scope.$apply();
                scope.submit();

                expect(fakeModal.open).toHaveBeenCalled();
            });

            it("should let the user know of failures when saving the data to indexedDB ", function() {

                spyOn(dataRepository, "save").and.returnValue(saveErrorPromise);
                spyOn(hustle, "publish");


                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);

                scope.submit();
                scope.$apply();

                expect(dataRepository.save).toHaveBeenCalled();
                expect(hustle.publish).not.toHaveBeenCalled();
                expect(scope.submitSuccess).toBe(false);
                expect(scope.saveSuccess).toBe(false);
                expect(scope.submitError).toBe(true);
                expect(scope.saveError).toBe(false);
            });

            it("should let the user know of failures when saving to queue ", function() {

                spyOn(approvalDataRepository, "unapproveLevelOneData").and.returnValue(utils.getPromise(q, {}));
                spyOn(approvalDataRepository, "unapproveLevelTwoData").and.returnValue(utils.getPromise(q, {}));
                spyOn(dataRepository, "save").and.returnValue(saveSuccessPromise);
                spyOn(hustle, "publish").and.returnValue(saveErrorPromise);

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);

                scope.submit();
                scope.$apply();

                expect(dataRepository.save).toHaveBeenCalled();
                expect(hustle.publish).toHaveBeenCalled();
                expect(scope.submitSuccess).toBe(false);
                expect(scope.saveSuccess).toBe(false);
                expect(scope.submitError).toBe(true);
                expect(scope.saveError).toBe(false);
            });

            it("should fetch max length to calculate col span for category options", function() {
                var maxCols = scope.maxcolumns([
                    [1, 2],
                    [4, 5, 4, 5]
                ]);

                expect(maxCols).toEqual(4);
            });

            it("safe get dataValues should initialize data value and option if not present", function() {
                var dataValues = {};
                var result = scope.safeGet(dataValues, "blah", "someOption");

                expect(dataValues).toEqual({
                    blah: {
                        someOption: {
                            formula: '',
                            value: ''
                        }
                    }
                });
                expect(result).toEqual({
                    formula: '',
                    value: ''
                });
            });

            it("safe get dataValues should return if already present", function() {
                var dataValues = {
                    "blah": {
                        "someOption": "test"
                    }
                };

                var result = scope.safeGet(dataValues, "blah", "someOption");

                expect(dataValues).toEqual({
                    blah: {
                        someOption: 'test'
                    }
                });
                expect(result).toEqual(dataValues.blah.someOption);
            });

            it("should fetch empty data if no data exists for the given period", function() {
                scope.year = 2014;
                scope.week = {
                    "weekNumber": 14
                };
                scope.currentModule = {
                    'id': 'Mod1',
                    'parent': {
                        'id': 'proj1'
                    }
                };
                scope.$apply();

                expect(dataRepository.getDataValues).toHaveBeenCalledWith('2014W14', 'Mod1');
                expect(scope.dataValues).toEqual({});
            });

            it("should display data for the given period", function() {
                scope.year = 2014;
                scope.week = {
                    "weekNumber": 14
                };
                scope.currentModule = {
                    id: 'mod2',
                    parent: {
                        id: 'parent'
                    }
                };
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {
                    "dataValues": [{
                        "dataElement": "DE_Oedema",
                        "categoryOptionCombo": "32",
                        "value": "3",
                        "dataset": "abbc"
                    }, {
                        "dataElement": "DE_Oedema",
                        "categoryOptionCombo": "33",
                        "value": "12",
                        "dataset": "abbc"
                    }],
                    "blah": "some"
                }));

                scope.$apply();

                expect(dataRepository.getDataValues).toHaveBeenCalledWith("2014W14", "mod2");
                expect(scope.dataValues).toEqual({
                    DE_Oedema: {
                        32: {
                            formula: '3',
                            value: '3'
                        },
                        33: {
                            formula: '12',
                            value: '12'
                        }
                    }
                });
            });

            it('should set dataset sections if module is selected', function() {
                spyOn(scope.dataentryForm, '$setPristine');

                scope.week = {
                    "weekNumber": 14
                };
                scope.currentModule = {
                    'id': 'mod1',
                    parent: {
                        id: 'parent'
                    }
                };

                scope.$apply();

                expect(_.keys(scope.currentGroupedSections)).toEqual(['DS_OPD']);
                expect(scope.dataentryForm.$setPristine).toHaveBeenCalled();
            });

            it("should display the correct submit option for auto approved projects", function() {
                getOrgUnitSpy.and.returnValue(utils.getPromise(q, {
                    "id": "proj1",
                    "attributeValues": [{
                        'attribute': {
                            'code': 'autoApprove',
                            'name': 'Auto Approve',
                            'id': 'e65afaec61d'
                        },
                        'value': 'true'
                    }, {
                        'attribute': {
                            'code': 'Type',
                            'name': 'Type',
                        },
                        'value': 'Project'
                    }]
                }));

                scope.week = {
                    "weekNumber": 14
                };
                scope.currentModule = {
                    'id': 'mod1',
                    parent: {
                        id: 'parent'
                    }
                };

                scope.$apply();

                expect(scope.projectIsAutoApproved).toBeTruthy();
            });

            it('should prevent navigation if data entry form is dirty', function() {
                scope.dataentryForm.$dirty = false;
                scope.dataentryForm.$dirty = true;
                scope.$apply();

                expect(scope.preventNavigation).toEqual(true);
            });

            it('should not prevent navigation if data entry form is not dirty', function() {
                scope.dataentryForm.$dirty = true;
                scope.dataentryForm.$dirty = false;
                scope.$apply();

                expect(scope.preventNavigation).toEqual(false);
            });

            it("should return true if current week is selected", function() {
                var selectedWeek = {
                    'weekNumber': 2,
                    'startOfWeek': moment().startOf("isoWeek").format("YYYY-MM-DD"),
                    'endOfWeek': moment().endOf("isoWeek").format("YYYY-MM-DD")
                };

                expect(scope.isCurrentWeekSelected(selectedWeek)).toEqual(true);
                scope.$apply();
            });

            it("should return false if current week is not selected", function() {
                var selectedWeek = {
                    'weekNumber': 21,
                    'startOfWeek': moment("2001-01-01", "YYYY-MM-DD").startOf("isoWeek").format("YYYY-MM-DD"),
                    'endOfWeek': moment("2001-01-01", "YYYY-MM-DD").endOf("isoWeek").format("YYYY-MM-DD")
                };

                expect(scope.isCurrentWeekSelected(selectedWeek)).toEqual(false);
                scope.$apply();
            });

            it("should expand the first dataset panel", function() {
                var id = "first_panel_id";
                var isDatasetOpen = scope.getDatasetState(id, true);
                expect(isDatasetOpen[id]).toBe(true);
            });

            it("should not expand the first dataset panel after the first time", function() {
                var id = "first_panel_id";
                scope.isDatasetOpen[id] = false;
                var isDatasetOpen = scope.getDatasetState(id, true);
                expect(isDatasetOpen[id]).toBe(false);
            });

            it("should not expand the other panels", function() {
                var id = "some_other_panel_id";
                var isDatasetOpen = scope.getDatasetState(id, false);
                expect(isDatasetOpen[id]).toBe(undefined);
            });

            it("should render all panels completely and print tally sheet in the next tick", function() {
                spyOn(window, "print");

                scope.printWindow();
                timeout.flush();

                expect(scope.printingTallySheet).toBeTruthy();
                expect(window.print).toHaveBeenCalled();
            });

            it("should show not-ready-for-approval message if no data has been saved or submitted", function() {
                scope.$apply();

                expect(scope.isSubmitted).toBe(false);
            });

            it("should show not-ready-for-approval message if data has been saved as draft", function() {
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {
                    "period": "2014W14",
                    "orgUnit": "mod2",
                    "isDraft": true,
                    "dataValues": [{
                        "dataElement": "b9634a78271",
                        "period": "2014W14",
                        "orgUnit": "mod2",
                        "categoryOptionCombo": "h48rgCOjDTg",
                        "value": "12",
                        "storedBy": "service.account",
                        "followUp": false
                    }, {
                        "dataElement": "b9634a78271",
                        "period": "2014W14",
                        "orgUnit": "mod2",
                        "categoryOptionCombo": "h48rgCOjDTg",
                        "value": "13",
                        "storedBy": "service.account",
                        "followUp": false
                    }]
                }));

                scope.$apply();

                expect(scope.isSubmitted).toBe(false);
            });

            it("should show ready-for-approval message if data has already been submitted for approval", function() {
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {
                    "period": "2014W14",
                    "orgUnit": "mod2",
                    "dataValues": [{
                        "dataElement": "b9634a78271",
                        "period": "2014W14",
                        "orgUnit": "mod2",
                        "categoryOptionCombo": "h48rgCOjDTg",
                        "value": "12",
                        "storedBy": "service.account",
                        "followUp": false
                    }, {
                        "dataElement": "b9634a78271",
                        "period": "2014W14",
                        "orgUnit": "mod2",
                        "categoryOptionCombo": "h48rgCOjDTg",
                        "value": "13",
                        "storedBy": "service.account",
                        "followUp": false
                    }]
                }));

                scope.$apply();

                expect(scope.isSubmitted).toBe(true);
            });

            it("should submit data for first level approval", function() {
                var levelOneApprovalDataSaved = false;
                getLevelOneApprovalDataSpy.and.callFake(function() {
                    if (levelOneApprovalDataSaved)
                        return utils.getPromise(q, {
                            "blah": "moreBlah"
                        });
                    return utils.getPromise(q, undefined);
                });
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, undefined));

                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));
                spyOn(approvalHelper, "markDataAsComplete").and.callFake(function() {
                    levelOneApprovalDataSaved = true;
                    return utils.getPromise(q, {});
                });

                var _Date = Date;
                spyOn(window, 'Date').and.returnValue(new _Date("2014-05-30T12:43:54.972Z"));

                var data = {
                    "dataSets": ['Vacc'],
                    "period": '2014W14',
                    "orgUnit": 'mod2',
                    "storedBy": 'dataentryuser'
                };
                scope.currentModule = {
                    id: 'mod2',
                    parent: {
                        id: 'parent'
                    }
                };
                scope.$apply();

                scope.firstLevelApproval();
                scope.$apply();

                expect(approvalHelper.markDataAsComplete).toHaveBeenCalledWith(data);
                expect(scope.approveSuccess).toBe(true);
                expect(scope.approveError).toBe(false);
                expect(scope.isCompleted).toEqual(true);
            });

            it("should submit data for auto approval", function() {
                var levelOneApprovalDataSaved = false;
                getLevelOneApprovalDataSpy.and.callFake(function() {
                    if (levelOneApprovalDataSaved)
                        return utils.getPromise(q, {
                            "blah": "moreBlah"
                        });
                    return utils.getPromise(q, undefined);
                });
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, undefined));

                spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));
                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));

                spyOn(dataRepository, "save").and.returnValue(saveSuccessPromise);

                var l1ApprovalPayload = {
                    "dataSets": ['Vacc'],
                    "period": '2014W14',
                    "orgUnit": 'mod2',
                    "storedBy": 'dataentryuser'
                };

                spyOn(approvalHelper, "markDataAsComplete").and.callFake(function() {
                    levelOneApprovalDataSaved = true;
                    return utils.getPromise(q, l1ApprovalPayload);
                });

                spyOn(approvalHelper, "markDataAsApproved").and.callFake(function() {
                    levelTwoApprovalDataSaved = true;
                    return utils.getPromise(q, {
                        "blah": "moreBlah"
                    });
                });

                var _Date = Date;
                spyOn(window, 'Date').and.returnValue(new _Date("2014-05-30T12:43:54.972Z"));

                getOrgUnitSpy.and.returnValue(utils.getPromise(q, {
                    "id": "proj1",
                    "attributeValues": [{
                        'attribute': {
                            'code': 'autoApprove',
                            'name': 'Auto Approve',
                            'id': 'e65afaec61d'
                        },
                        'value': 'true'
                    }, {
                        'attribute': {
                            'code': 'Type',
                            'name': 'Type',
                        },
                        'value': 'Project'
                    }]
                }));

                scope.currentModule = {
                    id: 'mod2',
                    parent: {
                        id: 'parent'
                    }
                };
                scope.$apply();

                scope.submitAndApprove();
                scope.$apply();

                expect(approvalHelper.markDataAsComplete).toHaveBeenCalledWith(l1ApprovalPayload);


                var l2ApprovalPayload = {
                    "dataSets": ['Vacc'],
                    "period": '2014W14',
                    "orgUnit": 'mod2',
                    "storedBy": 'dataentryuser'
                };

                expect(approvalHelper.markDataAsApproved).toHaveBeenCalledWith(l2ApprovalPayload);

                expect(scope.submitAndApprovalSuccess).toBe(true);
            });

            it("should not submit data for approval", function() {


                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));
                spyOn(approvalHelper, "markDataAsComplete").and.returnValue(utils.getRejectedPromise(q, {}));

                var _Date = Date;
                spyOn(window, 'Date').and.returnValue(new _Date("2014-05-30T12:43:54.972Z"));
                scope.firstLevelApproval();
                scope.$apply();

                expect(scope.approveSuccess).toBe(false);
                expect(scope.approveError).toBe(true);
                expect(scope.isCompleted).toEqual(false);
            });

            it("should mark data as complete if proccessed", function() {

                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));

                var _Date = Date;
                spyOn(window, 'Date').and.returnValue(new _Date("2014-05-30T12:43:54.972Z"));

                scope.$apply();

                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });
                spyOn(approvalHelper, "markDataAsComplete").and.returnValue(utils.getPromise(q, {}));

                scope.firstLevelApproval();
                scope.$apply();

                expect(scope.approveSuccess).toBe(true);
                expect(scope.approveError).toBe(false);
            });

            it("should show a message if data is already complete", function() {
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    'blah': 'moreBlah'
                }));
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, {}));
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));


                scope.$apply();

                expect(scope.isCompleted).toBeTruthy();
            });

            it("should mark data as approved if proccessed", function() {
                var levelTwoApprovalDataSaved = false;
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    "blah": "moreBlah"
                }));
                getLevelTwoApprovalDataSpy.and.callFake(function() {
                    if (levelTwoApprovalDataSaved)
                        return utils.getPromise(q, {
                            "isApproved": true
                        });
                    return utils.getPromise(q, undefined);
                });

                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));

                var _Date = Date;
                spyOn(window, 'Date').and.returnValue(new _Date("2014-05-30T12:43:54.972Z"));

                scope.$apply();

                spyOn(fakeModal, "open").and.returnValue({
                    result: utils.getPromise(q, {})
                });

                spyOn(approvalHelper, "markDataAsApproved").and.callFake(function() {
                    levelTwoApprovalDataSaved = true;
                    return utils.getPromise(q, {
                        "blah": "moreBlah"
                    });
                });

                scope.secondLevelApproval();
                scope.$apply();

                expect(scope.approveSuccess).toBe(true);
                expect(scope.approveError).toBe(false);
                expect(scope.isCompleted).toEqual(true);
                expect(scope.isApproved).toEqual(true);
            });

            it("should show a message if data is already approved", function() {
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    'blah': 'moreBlah'
                }));
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    'isApproved': true
                }));
                getDataValuesSpy.and.returnValue(utils.getPromise(q, {}));


                scope.$apply();

                expect(scope.isApproved).toBeTruthy();
            });

            it("should mark as incomplete if data edited after completion", function() {
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    "foo": "bar"
                }));
                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, undefined));
                spyOn(approvalDataRepository, "unapproveLevelOneData").and.returnValue(utils.getPromise(q, {
                    "foo": "bar"
                }));
                spyOn(approvalDataRepository, "unapproveLevelTwoData").and.returnValue(utils.getPromise(q, undefined));
                spyOn(dataRepository, "save").and.returnValue(saveSuccessPromise);
                spyOn(hustle, "publish");

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);


                scope.submit();
                scope.$apply();

                expect(dataRepository.save).toHaveBeenCalled();
                expect(approvalDataRepository.unapproveLevelOneData).toHaveBeenCalledWith('2014W14', 'mod2');
                expect(hustle.publish.calls.argsFor(0)).toEqual([{
                    data: {
                        "foo": "bar"
                    },
                    type: 'uploadCompletionData'
                }, 'dataValues']);
                expect(hustle.publish.calls.argsFor(1)).toEqual([{
                    data: {
                        ok: 'ok'
                    },
                    type: 'uploadDataValues'
                }, 'dataValues']);
            });

            it("should mark as unapproved and incomplete if data edited after approval", function() {
                getLevelOneApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    "foo": "bar"
                }));

                getLevelTwoApprovalDataSpy.and.returnValue(utils.getPromise(q, {
                    "blah": "moreBlah"
                }));

                spyOn(approvalDataRepository, "unapproveLevelOneData").and.returnValue(utils.getPromise(q, {
                    "foo": "bar"
                }));

                spyOn(approvalDataRepository, "unapproveLevelTwoData").and.returnValue(utils.getPromise(q, {
                    "blah": "moreBlah"
                }));

                spyOn(dataRepository, "save").and.returnValue(saveSuccessPromise);
                spyOn(hustle, "publish");

                var aggregateDataEntryController = new AggregateDataEntryController(scope, routeParams, q, hustle, db, dataRepository, anchorScroll, location, fakeModal, rootScope, window, approvalDataRepository, timeout, orgUnitRepository, approvalHelper);


                scope.submit();
                scope.$apply();

                expect(dataRepository.save).toHaveBeenCalled();
                expect(approvalDataRepository.unapproveLevelOneData).toHaveBeenCalledWith('2014W14', 'mod2');
                expect(approvalDataRepository.unapproveLevelTwoData).toHaveBeenCalledWith('2014W14', 'mod2');

                expect(hustle.publish.calls.argsFor(0)).toEqual([{
                    data: {
                        "blah": "moreBlah"
                    },
                    type: 'uploadApprovalData'
                }, 'dataValues']);

                expect(hustle.publish.calls.argsFor(1)).toEqual([{
                    data: {
                        "foo": "bar"
                    },
                    type: 'uploadCompletionData'
                }, 'dataValues']);

                expect(hustle.publish.calls.argsFor(2)).toEqual([{
                    data: {
                        ok: 'ok'
                    },
                    type: 'uploadDataValues'
                }, 'dataValues']);
            });
        });
    });