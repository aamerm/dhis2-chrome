define([], function() {
    return function(db) {
        this.save = function(payload) {
            var store = db.objectStore("completeDataSets");
            return store.upsert(payload);
        };

        this.getCompleteDataValues = function(period, orgUnitId) {
            var filterSoftDeletedApprovals = function(d) {
                return d && d.isDeleted ? undefined : d;
            };

            var store = db.objectStore('completeDataSets');
            return store.find([period, orgUnitId]).then(filterSoftDeletedApprovals);
        };

        this.getLevelOneApprovalData = function(period, orgUnitId) {
            var store = db.objectStore('completeDataSets');
            return store.find([period, orgUnitId]);
        };

        this.unapproveLevelOneData = function(period, orgUnit) {
            var unapprove = function(data) {
                if (!data) return;
                data.isDeleted = true;
                var store = db.objectStore('completeDataSets');
                return store.upsert(data).then(function() {
                    return data;
                });
            };

            return this.getCompleteDataValues(period, orgUnit).then(unapprove);
        };

        this.getLevelOneApprovalDataForPeriodsOrgUnits = function(startPeriod, endPeriod, orgUnits) {
            var store = db.objectStore('completeDataSets');
            var query = db.queryBuilder().$between(startPeriod, endPeriod).$index("by_period").compile();
            return store.each(query).then(function(approvalData) {
                return _.filter(approvalData, function(ad) {
                    return _.contains(orgUnits, ad.orgUnit);
                });
            });
        };

    };
});