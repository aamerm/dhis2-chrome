define([], function() {
    var dataSets = [{
        name: 'OPD',
        id: 'DS_OPD'
    }, {
        name: 'Vaccination',
        id: 'Vacc'
    }];

    var categoryOptions = [{
        id: 'CO1',
        name: 'Resident'
    }, {
        id: 'CO2',
        name: 'Migrant'
    }, {
        id: 'CO3',
        name: 'LessThan5'
    }, {
        id: 'CO4',
        name: 'GreaterThan5'
    }];

    var categories = [{
        id: 'CT1',
        categoryOptions: [categoryOptions[0], categoryOptions[1]]
    }, {
        id: 'CT2',
        categoryOptions: [categoryOptions[2], categoryOptions[3]]
    }];

    var categoryCombos = [{
        id: 'CC1',
        categories: [categories[0], categories[1]]
    }, {
        id: 'CC2',
        categories: [categories[1]]
    }];

    var categoryOptionCombos = [{
        "id": 1,
        "categoryCombo": {
            "id": "CC1"
        },
        "name": "(CO1, CO3)",
        "categoryOptions": [{
            "id": "CO1",
            "name": "Resident"
        }, {
            "id": "CO3",
            "name": "LessThan5"
        }]
    }, {
        "id": 2,
        "categoryCombo": {
            "id": "CC1"
        },
        "name": "(CO1, CO4)",
        "categoryOptions": [{
            "id": "CO1",
            "name": "Resident"
        }, {
            "id": "CO4",
            "name": "GreaterThan5"
        }]
    }, {
        "id": 3,
        "categoryCombo": {
            "id": "CC1"
        },
        "name": "(CO2, CO3)",
        "categoryOptions": [{
            "id": "CO2",
            "name": "Migrant"
        }, {
            "id": "CO3",
            "name": "LessThan5"
        }]
    }, {
        "id": 4,
        "categoryCombo": {
            "id": "CC1"
        },
        "name": "(CO2, CO4)",
        "categoryOptions": [{
            "id": "CO2",
            "name": "Migrant"
        }, {
            "id": "CO4",
            "name": "GreaterThan5"
        }]
    }, {
        "id": 5,
        "categoryCombo": {
            "id": "CC2"
        },
        "name": "(CO4)",
        "categoryOptions": [{
            "id": "CO4",
            "name": "GreaterThan5"
        }]
    }, {
        "id": 6,
        "categoryCombo": {
            "id": "CC2"
        },
        "name": "(CO3)",
        "categoryOptions": [{
            "id": "CO3",
            "name": "LessThan5"
        }]
    }];

    var dataElements = [{
        id: 'DE1',
        categoryCombo: categoryCombos[0]
    }, {
        id: 'DE2',
        categoryCombo: categoryCombos[1]
    }, {
        id: 'DE3',
        categoryCombo: categoryCombos[1]
    }];

    var sections = [{
        id: 'Sec1',
        dataSet: dataSets[0],
        dataElements: [dataElements[0], dataElements[1]]
    }, {
        id: 'Sec2',
        dataSet: dataSets[0],
        dataElements: [dataElements[0]]
    }, {
        id: 'Sec3',
        dataSet: dataSets[1],
        dataElements: [dataElements[2]]
    }];

    return {
        'dataSets': dataSets,
        'sections': sections,
        'categories': categories,
        'categoryCombos': categoryCombos,
        'dataElements': dataElements,
        'categoryOptions': categoryOptions,
        'categoryOptionCombos': categoryOptionCombos
    };
})