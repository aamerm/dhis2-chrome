define(["systemSettingService", "angularMocks", "dhisUrl", "utils", "md5", "timecop", "lodash"], function(SystemSettingService, mocks, dhisUrl, utils, md5, timecop, _) {
    describe("systemSettingService", function() {

        var http, httpBackend, service, allSystemSettings, q;

        beforeEach(mocks.inject(function($httpBackend, $http, $q) {
            q = $q;
            http = $http;
            httpBackend = $httpBackend;
            service = new SystemSettingService(http);

            allSystemSettings = {
                "keyAccountRecovery": true,
                "exclude_a467559322b": JSON.stringify({
                    clientLastUpdated: "2014-05-30T12:43:54.972Z",
                    dataElements: ["de1", "de2"]
                }),
                "exclude_b567559322c": JSON.stringify({
                    clientLastUpdated: "2014-05-30T12:43:54.972Z",
                    dataElements: ["de3", "de1"]
                })
            };

            Timecop.install();
            Timecop.freeze(new Date("2014-05-30T12:43:54.972Z"));
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
            Timecop.returnToPresent();
            Timecop.uninstall();
        });

        it("should get all excluded data elements", function() {
            var result = {};
            httpBackend.expectGET(dhisUrl.systemSettings).respond(200, allSystemSettings);
            service.getAll().then(function(data) {
                result = data;
                expect(result).toEqual([{
                    key: "a467559322b",
                    value: {
                        clientLastUpdated: "2014-05-30T12:43:54.972Z",
                        dataElements: ["de1", "de2"]
                    }
                }, {
                    key: "b567559322c",
                    value: {
                        clientLastUpdated: "2014-05-30T12:43:54.972Z",
                        dataElements: ["de3", "de1"]
                    }
                }]);
            });
            httpBackend.flush();
        });

        it("should get moduleTemplates from systemSettings", function() {
            allSystemSettings.moduleTemplates = {
                "ds1": {
                    "temp1": [1, 2],
                    "temp2": [3, 4]
                },
                "ds2": {
                    "temp1": [1, 5],
                    "temp2": [8, 9]
                }
            };

            var result = {};
            httpBackend.expectGET(dhisUrl.systemSettings).respond(200, allSystemSettings);
            service.getAll().then(function(data) {
                result = data;
                expect(result).toEqual([{
                    key: "a467559322b",
                    value: {
                        clientLastUpdated: "2014-05-30T12:43:54.972Z",
                        dataElements: ["de1", "de2"]
                    }
                }, {
                    key: "b567559322c",
                    value: {
                        clientLastUpdated: "2014-05-30T12:43:54.972Z",
                        dataElements: ["de3", "de1"]
                    }
                }, {
                    key: "moduleTemplates",
                    value: {
                        "ds1": {
                            "temp1": [1, 2],
                            "temp2": [3, 4]
                        },
                        "ds2": {
                            "temp1": [1, 5],
                            "temp2": [8, 9]
                        }
                    }
                }]);
            });
            httpBackend.flush();
        });

        it("should post excluded data elements settings for a module", function() {
            var moduleId = "mod1";
            var args = {
                key: moduleId,
                value: {
                    clientLastUpdated: "2014-05-30T12:43:54.972Z",
                    dataElements: ["de1", "de2"]
                }
            };

            var key = "exclude_" + moduleId;
            var excludedDataElements = ["de1", "de2"];
            service.upsert(args);
            var expectedPayload = {
                clientLastUpdated: "2014-05-30T12:43:54.972Z",
                dataElements: ["de1", "de2"]
            };
            httpBackend.expectPOST(dhisUrl.systemSettings + "/" + key, expectedPayload).respond(200, "ok");
            httpBackend.flush();
        });

        describe("upsertReferralLocations", function() {
            it("should post referral locations for an op unit", function() {
                var opUnitId = "opUnit1";
                var payload = {
                    "id": opUnitId,
                    "Location 1": "Some alias"
                };

                var expectedKey = "referralLocations_" + opUnitId;
                var expectedPayload = {};
                expectedPayload[expectedKey] = payload;

                service.upsertReferralLocations(payload);

                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");
                httpBackend.flush();
            });
        });

        describe("getReferralLocations", function() {
            it("should download referral locations for the specified op units", function() {
                var opUnitIds = ['opUnit1', 'opUnit2'];
                var queryParams = "?key=referralLocations_opUnit1&key=referralLocations_opUnit2";
                var remoteReferralLocations = {
                    "referralLocations_opUnit1": {
                        "id": "opUnit1",
                        "facility 1": "some alias"
                    },
                    "referralLocations_opUnit2": {
                        "id": "opUnit2",
                        "facility 2": "some alias1"
                    }
                };
                var expectedResult = [{
                    "id": "opUnit1",
                    "facility 1": "some alias"
                }, {
                    "id": "opUnit2",
                    "facility 2": "some alias1"
                }];

                httpBackend.expectGET(dhisUrl.systemSettings + queryParams).respond(200, remoteReferralLocations);
                service.getReferralLocations(opUnitIds).then(function(result) {
                    expect(result).toEqual(expectedResult);
                });

                httpBackend.flush();
            });
        });

        it("should get system settings", function() {
            var systemSettingsFromDhis = {
                "moduleTemplates": {
                    "ds1": {}
                },
                "anotherSetting": "foo"
            };

            httpBackend.expectGET(dhisUrl.systemSettings + "?key=fieldAppSettings").respond(200, systemSettingsFromDhis);

            var actualResult;
            service.getSystemSettings().then(function(result) {
                actualResult = result;
            });
            httpBackend.flush();

            expect(actualResult).toEqual(systemSettingsFromDhis);
        });

        it("should get project settings", function() {
            var projectSettingsFromDhis = {
                "projectSettings_prj1": {
                    "excludedDataElements": [{
                        "id": "mod1",
                        "dataElements": ["de1", "de2"],
                        "clientLastUpdated": "2014-05-30T12:43:54.972Z"
                    }],
                    "patientOriginDetails": [{
                        "id": "opUnit1",
                        "origins": [{
                            "id": "origin1",
                            "name": "Origin 1",
                            "isDisabled": false
                        }],
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }],
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "facility 2": "some other alias",
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }]
                },
                "projectSettings_prj2": {
                    "excludedDataElements": [],
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }]
                }
            };

            var expectedResult = {
                "prj1": {
                    "excludedDataElements": [{
                        "id": "mod1",
                        "dataElements": ["de1", "de2"],
                        "clientLastUpdated": "2014-05-30T12:43:54.972Z"
                    }],
                    "patientOriginDetails": [{
                        "id": "opUnit1",
                        "origins": [{
                            "id": "origin1",
                            "name": "Origin 1",
                            "isDisabled": false
                        }],
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }],
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "facility 2": "some other alias",
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }]
                },
                "prj2": {
                    "excludedDataElements": [],
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "clientLastUpdated": "2015-07-17T07:00:00.000Z"
                    }]
                }
            };

            httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1&key=projectSettings_prj2").respond(200, projectSettingsFromDhis);

            var actualResult;
            service.getProjectSettings(["prj1", "prj2"]).then(function(result) {
                actualResult = result;
            });
            httpBackend.flush();

            expect(actualResult).toEqual(expectedResult);
        });

        describe("upsertExcludedDataElements", function() {
            it("should insert excludedDataElements when upserting", function() {
                var projectSettingsFromDhis = {};

                var excludedDataElementsToUpsert = {
                    "id": "mod1",
                    "dataElements": ["de1", "de2"],
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "excludedDataElements": [{
                            "id": "mod1",
                            "dataElements": ["de1", "de2"],
                            "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                        }]
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertExcludedDataElements("prj1", excludedDataElementsToUpsert);
                httpBackend.flush();
            });

            it("should append excludedDataElements when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "excludedDataElements": [{
                            "id": "mod1",
                            "dataElements": ["de1", "de2"],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                var excludedDataElementsToUpsert = {
                    "id": "mod2",
                    "dataElements": ["de3", "de4"],
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "excludedDataElements": [{
                            "id": "mod1",
                            "dataElements": ["de1", "de2"],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }, {
                            "id": "mod2",
                            "dataElements": ["de3", "de4"],
                            "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertExcludedDataElements("prj1", excludedDataElementsToUpsert);
                httpBackend.flush();
            });

            it("should update excludedDataElements when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "excludedDataElements": [{
                            "id": "mod1",
                            "dataElements": ["de1", "de2"],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                var excludedDataElementsToUpsert = {
                    "id": "mod1",
                    "dataElements": ["de1", "de2", "de3", "de4"],
                    "clientLastUpdated": "2015-01-10T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "excludedDataElements": [{
                            "id": "mod1",
                            "dataElements": ["de1", "de2", "de3", "de4"],
                            "clientLastUpdated": "2015-01-10T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertExcludedDataElements("prj1", excludedDataElementsToUpsert);
                httpBackend.flush();
            });
        });

        describe("upsertPatientOriginDetails", function() {
            it("should insert patientOriginDetails when upserting", function() {
                var projectSettingsFromDhis = {};

                var patientOriginDetailsToUpsert = {
                    "id": "opUnit1",
                    "origins": [{
                        "id": "origin1",
                        "name": "Origin 1",
                        "isDisabled": false
                    }],
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "patientOriginDetails": [{
                            "id": "opUnit1",
                            "origins": [{
                                "id": "origin1",
                                "name": "Origin 1",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                        }]
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertPatientOriginDetails("prj1", patientOriginDetailsToUpsert);
                httpBackend.flush();
            });

            it("should append patientOriginDetails when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "patientOriginDetails": [{
                            "id": "opUnit1",
                            "origins": [{
                                "id": "origin1",
                                "name": "Origin 1",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                var patientOriginDetailsToUpsert = {
                    "id": "opUnit2",
                    "origins": [{
                        "id": "origin2",
                        "name": "Origin 2",
                        "isDisabled": false
                    }],
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "patientOriginDetails": [{
                            "id": "opUnit1",
                            "origins": [{
                                "id": "origin1",
                                "name": "Origin 1",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }, {
                            "id": "opUnit2",
                            "origins": [{
                                "id": "origin2",
                                "name": "Origin 2",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertPatientOriginDetails("prj1", patientOriginDetailsToUpsert);
                httpBackend.flush();
            });

            it("should update patientOriginDetails when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "patientOriginDetails": [{
                            "id": "opUnit1",
                            "origins": [{
                                "id": "origin1",
                                "name": "Origin 1",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                var patientOriginDetailsToUpsert = {
                    "id": "opUnit1",
                    "origins": [{
                        "id": "origin2",
                        "name": "Origin 2",
                        "isDisabled": false
                    }],
                    "clientLastUpdated": "2014-01-10T12:00:00.000Z"
                };

                var expectedPayload = {
                    "projectSettings_prj1": {
                        "patientOriginDetails": [{
                            "id": "opUnit1",
                            "origins": [{
                                "id": "origin2",
                                "name": "Origin 2",
                                "isDisabled": false
                            }],
                            "clientLastUpdated": "2014-01-10T12:00:00.000Z"
                        }],
                        "otherSettings": "blah"
                    }
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings, expectedPayload).respond(200, "ok");

                service.upsertPatientOriginDetails("prj1", patientOriginDetailsToUpsert);
                httpBackend.flush();
            });
        });

        describe("upsertReferralLocations", function() {
            xit("should insert referralLocations when upserting", function() {
                var projectSettingsFromDhis = {};

                var referralLocationsToUpsert = {
                    "id": "opUnit1",
                    "facility 1": "some alias",
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                    }]
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings + "/projectSettings_prj1", expectedPayload).respond(200, "ok");

                service.upsertReferralLocations("prj1", referralLocationsToUpsert);
                httpBackend.flush();
            });

            xit("should append referralLocations when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "referralLocations": [{
                            "id": "opUnit1",
                            "facility 1": "some alias",
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }]
                    }
                };

                var referralLocationsToUpsert = {
                    "id": "opUnit2",
                    "facility 1": "some other alias",
                    "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                };

                var expectedPayload = {
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some alias",
                        "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                    }, {
                        "id": "opUnit2",
                        "facility 1": "some other alias",
                        "clientLastUpdated": "2014-05-30T12:00:00.000Z"
                    }]
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings + "/projectSettings_prj1", expectedPayload).respond(200, "ok");

                service.upsertReferralLocations("prj1", referralLocationsToUpsert);
                httpBackend.flush();
            });

            xit("should update referralLocations when upserting", function() {
                var projectSettingsFromDhis = {
                    "projectSettings_prj1": {
                        "referralLocations": [{
                            "id": "opUnit1",
                            "facility 1": "some alias",
                            "clientLastUpdated": "2014-01-01T12:00:00.000Z"
                        }]
                    }
                };

                var referralLocationsToUpsert = {
                    "id": "opUnit1",
                    "facility 1": "some other alias",
                    "clientLastUpdated": "2014-01-10T12:00:00.000Z"
                };

                var expectedPayload = {
                    "referralLocations": [{
                        "id": "opUnit1",
                        "facility 1": "some other alias",
                        "clientLastUpdated": "2014-01-10T12:00:00.000Z"
                    }]
                };

                httpBackend.expectGET(dhisUrl.systemSettings + "?key=projectSettings_prj1").respond(200, projectSettingsFromDhis);
                httpBackend.expectPOST(dhisUrl.systemSettings + "/projectSettings_prj1", expectedPayload).respond(200, "ok");

                service.upsertReferralLocations("prj1", referralLocationsToUpsert);
                httpBackend.flush();
            });
        });


    });
});
