define([], function() {
    var add_object_stores = function(db, tx) {
        const syncable_types = ["categories", "categoryCombos", "categoryOptionCombos", "categoryOptions", "dataElements", "dataSets", "sections"];
        create_data_store(syncable_types, db);
    };

    var add_index_on_datasets_for_sections = function(db, tx) {
        var store = tx.objectStore("sections");
        store.createIndex("dataSet.id", "dataSet.id", {
            unique: false
        });
    };

    var change_log_stores = function(db, tx) {
        var type = "changeLog";
        db.createObjectStore(type, {
            keyPath: "type"
        });
    };

    var create_data_store = function(stores, db) {
        _.each(stores, function(type) {
            db.createObjectStore(type, {
                keyPath: "id"
            });
        });
    };

    var add_organisation_units_and_level_store = function(db, tx) {
        const syncable_types = ["organisationUnits", "organisationUnitLevels"];
        create_data_store(syncable_types, db);
    };

    return [add_object_stores, add_index_on_datasets_for_sections, change_log_stores, add_organisation_units_and_level_store];
});