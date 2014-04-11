'use strict';
module.exports = function(config) {
    config.set({
        basePath: '../../',
        files: [
            'test/test.main.js', {
                pattern: 'test/test.config.js',
                included: false
            }, {
                pattern: 'main/js/app/**/*.js',
                included: false
            }, {
                pattern: 'main/js/lib/**/*.js',
                included: false
            }, {
                pattern: 'test/js/app/**/*.js',
                included: false
            }, {
                pattern: 'test/js/data/**/*.js',
                included: false
            }, {
                pattern: 'main/db/*.js',
                included: false
            }, {
                pattern: 'test/db/*.js',
                included: false
            },
        ],
        exclude: [
            'main/js/lib/**/*spec.js',
            'main/js/app/background.js'
        ],
        autoWatch: true,
        frameworks: ['jasmine', 'requirejs'],
        reporters: ['dots', 'coverage'],
        preprocessors: {
            'main/js/app/**/*.js': 'coverage'
        },
        browsers: ['Chrome'],
        logLevel: config.LOG_INFO,
        junitReporter: {
            outputFile: 'test/coverage/test-results.xml'
        },
        coverageReporter: {
            dir: 'test/coverage',
        }
    });
};
