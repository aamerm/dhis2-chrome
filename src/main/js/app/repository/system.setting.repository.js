define(["lodash", "cipherUtils"], function(_, cipherUtils) {
    return function(db, $q, $rootScope) {
        var decryptProductKey = function(productKey) {
            return cipherUtils.decrypt(productKey);
        };

        var upsert = function(systemSettings) {
            var store = db.objectStore("systemSettings");
            return store.upsert(systemSettings).then(function() {
                return systemSettings;
            });
        };

        var cacheProductKeyDetails = function(productKey) {
            var decryptedProductKey = JSON.parse(decryptProductKey(productKey));
            $rootScope.authHeader = decryptedProductKey.authHeader;
            $rootScope.dhisUrl = decryptedProductKey.dhisUrl;
            $rootScope.allowedOrgUnits = decryptedProductKey.allowedOrgUnits;
        };

        var loadProductKey = function() {
            return get("productKey").then(function(productKey) {
                return cacheProductKeyDetails(productKey);
            });
        };

        var upsertProductKey = function(productKeyJson) {
            cacheProductKeyDetails(productKeyJson.value);

            var store = db.objectStore("systemSettings");
            return store.upsert(productKeyJson).then(function() {
                return productKeyJson;
            });
        };

        var get = function(key) {
            var store = db.objectStore("systemSettings");
            return store.find(key).then(function(setting) {
                if (setting)
                    return setting.value;
                return $q.reject();
            });
        };

        var getDhisUrl = function() {
            if (!_.isUndefined($rootScope.dhisUrl))
                return $rootScope.dhisUrl;
        };

        var getAuthHeader = function() {
            if (!_.isUndefined($rootScope.authHeader))
                return $rootScope.authHeader;
        };


        var getAllowedOrgUnits = function() {
            if (!_.isUndefined($rootScope.allowedOrgUnits))
                return $rootScope.allowedOrgUnits;
        };

        var isProductKeySet = function() {
            return get("productKey").then(function(productKey) {
                return productKey !== undefined;
            }, function() {
                return false;
            });
        };

        return {
            "upsert": upsert,
            "upsertProductKey": upsertProductKey,
            "get": get,
            "getDhisUrl": getDhisUrl,
            "getAuthHeader": getAuthHeader,
            "getAllowedOrgUnits": getAllowedOrgUnits,
            "isProductKeySet": isProductKeySet,
            "loadProductKey": loadProductKey
        };
    };
});
