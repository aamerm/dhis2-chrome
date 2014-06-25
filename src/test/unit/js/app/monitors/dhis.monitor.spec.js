define(["dhisMonitor", "utils", "angularMocks", "chromeRuntime", "mockChrome"], function(DhisMonitor, utils, mocks, chromeRuntime, MockChrome) {
    describe("dhis.monitor", function() {
        var q, http, httpBackend;
        var callbacks = {};

        beforeEach(mocks.inject(function($injector, $q) {
            q = $q;
            http = $injector.get('$http');
            httpBackend = $injector.get('$httpBackend');
            mockChrome = new MockChrome();
            spyOn(chromeRuntime, "sendMessage").and.callFake(mockChrome.sendMessage);
            spyOn(chromeRuntime, "addListener").and.callFake(mockChrome.addListener);
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it("should go online", function() {
            var callback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            var dhisMonitor = new DhisMonitor(http);
            dhisMonitor.online(function() {
                callback();
            });

            dhisMonitor.start();

            httpBackend.flush();
            expect(dhisMonitor.isOnline()).toBe(true);
            expect(callback).toHaveBeenCalled();
        });

        it("should go offline", function() {
            var callback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            var dhisMonitor = new DhisMonitor(http);
            dhisMonitor.offline(function() {
                callback();
            });

            dhisMonitor.start();

            httpBackend.expect("HEAD").respond(0, utils.getPromise(q, {}));
            dhisMonitor.checkNow();

            httpBackend.flush();
            expect(dhisMonitor.isOnline()).toBe(false);
            expect(callback).toHaveBeenCalled();
        });

        it("should not raise online event if already online", function() {

            var callback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            var dhisMonitor = new DhisMonitor(http);

            dhisMonitor.online(function() {
                callback();
            });

            dhisMonitor.start();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            dhisMonitor.checkNow();

            httpBackend.flush();

            expect(dhisMonitor.isOnline()).toBe(true);
            expect(callback.calls.count()).toBe(1);
        });

        it("should not raise offline event if already offline", function() {

            var callback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            var dhisMonitor = new DhisMonitor(http);

            dhisMonitor.offline(function() {
                callback();
            });

            dhisMonitor.start();

            httpBackend.expect("HEAD").respond(0, utils.getPromise(q, {}));
            dhisMonitor.checkNow();

            httpBackend.expect("HEAD").respond(0, utils.getPromise(q, {}));
            dhisMonitor.checkNow();

            httpBackend.flush();

            expect(dhisMonitor.isOnline()).toBe(false);
            expect(callback.calls.count()).toBe(1);
        });


        it("should raise offline if offline on startup", function() {
            var onlineCallback = jasmine.createSpy();
            var offlineCallback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(0, utils.getPromise(q, {}));
            var dhisMonitor = new DhisMonitor(http);

            dhisMonitor.offline(function() {
                offlineCallback();
            });
            dhisMonitor.online(function() {
                onlineCallback();
            });

            dhisMonitor.start();
            httpBackend.flush();

            expect(onlineCallback.calls.count()).toBe(0);
            expect(offlineCallback.calls.count()).toBe(1);
        });

        it("should raise online if online on startup", function() {
            var onlineCallback = jasmine.createSpy();
            var offlineCallback = jasmine.createSpy();

            httpBackend.expect("HEAD").respond(200, utils.getPromise(q, "ok"));
            var dhisMonitor = new DhisMonitor(http);

            dhisMonitor.offline(function() {
                offlineCallback();
            });
            dhisMonitor.online(function() {
                onlineCallback();
            });

            dhisMonitor.start();
            httpBackend.flush();


            expect(onlineCallback.calls.count()).toBe(1);
            expect(offlineCallback.calls.count()).toBe(0);
        });
    });
});