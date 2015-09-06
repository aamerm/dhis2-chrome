define(["dispatcher", "angularMocks", "utils"], function(Dispatcher, mocks, utils) {
    describe("dispatcher", function() {
        var uploadCompletionDataConsumer, uploadDataConsumer, downloadDataConsumer, uploadApprovalDataConsumer, dispatcher, message, q, log, scope,
            createUserConsumer, updateUserConsumer, uploadProgramConsumer, downloadProgramConsumer, downloadEventDataConsumer, uploadEventDataConsumer,
            deleteEventConsumer, downloadApprovalConsumer, downloadMetadataConsumer, deleteApprovalConsumer, downloadDatasetConsumer, uploadDatasetConsumer,
            downloadSystemSettingConsumer, uploadSystemSettingConsumer, uploadPatientOriginConsumer, uploadExcludedDataElementsConsumer, downloadChartConsumer,
            uploadReferralLocationsConsumer, downloadPivotTableConsumer;

        beforeEach(mocks.inject(function($q, $log, $rootScope) {
            uploadApprovalDataConsumer = {
                'run': jasmine.createSpy("uploadApprovalDataConsumer")
            };
            uploadCompletionDataConsumer = {
                'run': jasmine.createSpy("uploadCompletionDataConsumer")
            };
            uploadDataConsumer = {
                'run': jasmine.createSpy("uploadDataConsumer")
            };
            downloadDataConsumer = {
                'run': jasmine.createSpy("downloadDataConsumer")
            };
            downloadOrgUnitConsumer = {
                'run': jasmine.createSpy("downloadOrgUnitConsumer")
            };
            uploadOrgUnitConsumer = {
                'run': jasmine.createSpy("uploadOrgUnitConsumer")
            };
            uploadOrgUnitGroupConsumer = {
                'run': jasmine.createSpy("uploadOrgUnitGroupConsumer")
            };
            downloadOrgUnitGroupConsumer = {
                'run': jasmine.createSpy("downloadOrgUnitGroupConsumer")
            };
            downloadDatasetConsumer = {
                'run': jasmine.createSpy("downloadDatasetConsumer")
            };
            uploadDatasetConsumer = {
                'run': jasmine.createSpy("uploadDatasetConsumer")
            };
            createUserConsumer = {
                'run': jasmine.createSpy("createUserConsumer")
            };
            updateUserConsumer = {
                'run': jasmine.createSpy("updateUserConsumer")
            };
            downloadProgramConsumer = {
                'run': jasmine.createSpy("downloadProgramConsumer")
            };
            uploadProgramConsumer = {
                'run': jasmine.createSpy("uploadProgramConsumer")
            };
            downloadEventDataConsumer = {
                'run': jasmine.createSpy("downloadEventDataConsumer")
            };
            uploadEventDataConsumer = {
                'run': jasmine.createSpy("uploadEventDataConsumer")
            };
            deleteEventConsumer = {
                'run': jasmine.createSpy("deleteEventConsumer")
            };
            downloadApprovalConsumer = {
                'run': jasmine.createSpy("downloadApprovalConsumer")
            };
            deleteApprovalConsumer = {
                'run': jasmine.createSpy("deleteApprovalConsumer")
            };
            downloadMetadataConsumer = {
                'run': jasmine.createSpy("downloadMetadataConsumer")
            };
            downloadSystemSettingConsumer = {
                'run': jasmine.createSpy("downloadSystemSettingConsumer")
            };
            uploadSystemSettingConsumer = {
                'run': jasmine.createSpy("uploadSystemSettingConsumer")
            };
            uploadPatientOriginConsumer = {
                'run': jasmine.createSpy("uploadPatientOriginConsumer")
            };
            downloadChartConsumer = {
                'run': jasmine.createSpy("downloadChartConsumer")
            };
            uploadReferralLocationsConsumer = {
                'run': jasmine.createSpy("uploadReferralLocationsConsumer")
            };
            uploadExcludedDataElementsConsumer = {
                'run': jasmine.createSpy("uploadExcludedDataElementsConsumer")
            };
            downloadProjectSettingsConsumer = {
                'run': jasmine.createSpy("downloadProjectSettingsConsumer")
            };
            downloadPivotTableConsumer = {
                'run': jasmine.createSpy("downloadPivotTableConsumer")
            };
            message = {};
            q = $q;
            log = $log;
            scope = $rootScope.$new();

            downloadDataConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadEventDataConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadApprovalConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadOrgUnitConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadOrgUnitGroupConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadProgramConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadDatasetConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadSystemSettingConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadChartConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadProjectSettingsConsumer.run.and.returnValue(utils.getPromise(q, {}));
            downloadPivotTableConsumer.run.and.returnValue(utils.getPromise(q, {}));

            dispatcher = new Dispatcher(q, log, downloadOrgUnitConsumer, uploadOrgUnitConsumer, uploadOrgUnitGroupConsumer, downloadDatasetConsumer, uploadDatasetConsumer, createUserConsumer, updateUserConsumer,
                downloadDataConsumer, uploadDataConsumer, uploadCompletionDataConsumer, uploadApprovalDataConsumer, uploadProgramConsumer, downloadProgramConsumer,
                downloadEventDataConsumer, uploadEventDataConsumer, deleteEventConsumer, downloadApprovalConsumer, downloadMetadataConsumer, downloadOrgUnitGroupConsumer, deleteApprovalConsumer, downloadSystemSettingConsumer,
                uploadSystemSettingConsumer, uploadPatientOriginConsumer, downloadChartConsumer,
                uploadReferralLocationsConsumer, downloadPivotTableConsumer, downloadProjectSettingsConsumer, uploadExcludedDataElementsConsumer);
        }));

        it("should call upload data consumer for uploading data values", function() {
            message.data = {
                "data": {},
                "type": "uploadDataValues"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadDataConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadDataConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call download data consumer for downloading data values as a fire-and-forget", function() {
            var message = {};
            message.data = {
                "data": {},
                "type": "downloadData"
            };
            var returnValue = dispatcher.run(message);
            scope.$apply();

            expect(downloadDataConsumer.run).toHaveBeenCalledWith(message);
            expect(downloadApprovalConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call completion data consumer for uploading completion data", function() {
            message.data = {
                "data": {},
                "type": "uploadCompletionData"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadDataConsumer.run).toHaveBeenCalledWith(message);
            expect(downloadApprovalConsumer.run).toHaveBeenCalledWith(message, {});
            expect(uploadCompletionDataConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call approval data consumer for uploading approval data", function() {
            message.data = {
                "data": {},
                "type": "uploadApprovalData"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadDataConsumer.run).toHaveBeenCalledWith(message);
            expect(downloadApprovalConsumer.run).toHaveBeenCalledWith(message, {});
            expect(uploadApprovalDataConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call upload org units consumer", function() {
            message.data = {
                "data": {},
                "type": "upsertOrgUnit"
            };
            dispatcher.run(message);
            scope.$apply();

            expect(downloadOrgUnitConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadOrgUnitConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call download org units consumer", function() {
            message.data = {
                "data": [],
                "type": "downloadOrgUnit"
            };
            dispatcher.run(message);
            scope.$apply();
            expect(downloadOrgUnitConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadOrgUnitConsumer.run).not.toHaveBeenCalled();
        });

        it("should call dataset consumer", function() {
            message.data = {
                "data": {},
                "type": "associateOrgUnitToDataset"
            };
            dispatcher.run(message);
            scope.$apply();
            expect(downloadDatasetConsumer.run).toHaveBeenCalled();
            expect(uploadDatasetConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should fail if no hanlder found of payload type", function() {
            message.data = {
                "data": {},
                "type": "foo"
            };
            dispatcher.run(message).then(function() {
                expect(true).toBe(false);
            }, function() {
                expect(true).toBe(true);
            });
            scope.$apply();
        });

        it("should call create user consumer", function() {
            message.data = {
                "data": {},
                "type": "createUser"
            };
            dispatcher.run(message);
            expect(createUserConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call update user consumer", function() {
            message.data = {
                "data": {},
                "type": "updateUser"
            };
            dispatcher.run(message);
            expect(updateUserConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call upload program consumer", function() {
            message.data = {
                "data": {},
                "type": "uploadProgram"
            };
            dispatcher.run(message);
            scope.$apply();
            expect(downloadProgramConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadProgramConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call download program consumer", function() {
            message.data = {
                "data": {},
                "type": "downloadProgram"
            };
            dispatcher.run(message);
            scope.$apply();
            expect(downloadProgramConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call event download and upload consumer", function() {
            message.data = {
                "data": {},
                "type": "uploadProgramEvents"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadEventDataConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadEventDataConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call delete event consumer", function() {
            message.data = {
                "data": {},
                "type": "deleteEvent"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(deleteEventConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call download metadata consumer", function() {
            message.data = {
                "data": {},
                "type": "downloadMetadata"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadMetadataConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call uploadOrgUnitGroupConsumer", function() {
            message.data = {
                "data": {},
                "type": "upsertOrgUnitGroups"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadOrgUnitGroupConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadOrgUnitGroupConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should call downloadOrgUnitGroupConsumer", function() {
            message.data = {
                "data": {},
                "type": "downloadOrgUnitGroups"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadOrgUnitGroupConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call delete approval consumer", function() {
            message.data = {
                "data": {},
                "type": "deleteApprovals"
            };

            dispatcher.run(message);

            expect(deleteApprovalConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should download  system setting consumer", function() {
            message.data = {
                "data": {},
                "type": "downloadSystemSetting"
            };

            dispatcher.run(message);

            expect(downloadSystemSettingConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should upload system setting consumer", function() {
            message.data = {
                "data": {},
                "type": "uploadSystemSetting"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadSystemSettingConsumer.run).toHaveBeenCalledWith(message);
            expect(uploadSystemSettingConsumer.run).toHaveBeenCalledWith(message, {});
        });

        it("should upload patient origin consumer", function() {
            message.data = {
                "data": {},
                "type": "uploadPatientOriginDetails"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(uploadPatientOriginConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call download charts", function() {
            message.data = {
                "data": {},
                "type": "downloadCharts"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadChartConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call upload referral locations", function() {
            message.data = {
                "data": {},
                "type": "uploadReferralLocations"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(uploadReferralLocationsConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call upload excluded data elements", function() {
            message.data = {
                "data": {},
                "type": "uploadExcludedDataElements"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(uploadExcludedDataElementsConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call download project settings", function() {
            message.data = {
                "data": {},
                "type": "downloadProjectSettings"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadProjectSettingsConsumer.run).toHaveBeenCalledWith(message);
        });

        it("should call download pivot tables", function() {
            message.data = {
                "data": {},
                "type": "downloadPivotTables"
            };

            dispatcher.run(message);
            scope.$apply();

            expect(downloadPivotTableConsumer.run).toHaveBeenCalledWith(message);
        });
    });
});
