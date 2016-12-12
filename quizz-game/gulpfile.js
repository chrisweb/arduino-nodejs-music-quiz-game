'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');

// documentation: https://github.com/gulpjs/gulp/blob/master/docs/API.md

// check the coding standards and programming errors
gulp.task('lint', () => {
    const tslint = require('gulp-tslint');
    // Built-in rules are at
    // https://github.com/palantir/tslint#supported-rules
    const tslintConfig = require('./tslint.json');
    return gulp
        .src([
            'server.ts',
            'server/**/*.ts',
            'client/**/*.ts',
            'isomorphic/**/*.ts'
        ])
        .pipe(
            tslint({
                tslint: require('tslint').default,
                configuration: tslintConfig,
                formatter: 'prose'
            })
        )
        .pipe(
            tslint.report({
                emitError: true
            })
        );
});

// gulp typescript build
gulp.task('build', ['copy:assets', 'copy:jquery'], () => {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    // merge the two output streams, this task is finished when the IO of both operations is done
    return merge([ 
        tsResult.dts.pipe(gulp.dest('build/definitions')),
        tsResult.js
            .pipe(sourcemaps.write('sourcemaps'))
            .pipe(gulp.dest('build'))
    ]);
});

// copy assets into the build directory
gulp.task('copy:assets', () => {
    return gulp
        .src('assets/**/*')
        .pipe(gulp.dest('build/assets'));
});

// copy jquery node modules package into the assets build directory
gulp.task('copy:jquery', () => {
    return gulp
        .src('node_modules/jquery/dist/jquery.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/jquery/'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch([
        'server.ts',
        'server/**/*.ts',
        'client/**/*.ts',
        'isomorphic/**/*.ts'
    ], ['build']);
});