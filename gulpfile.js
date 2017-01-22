'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');

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
gulp.task('build-js', [
    'copy:assets',
    'copy:jquery',
    'copy:socketio-client',
    'copy:isomorphix-router',
    'copy:systemjs'
], () => {
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

// gulp SASS build
gulp.task('build-css', [
    'copy:material-design-icons'
], function () {
    return gulp.src('assets/stylesheets/**/*.scss')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(sass({ includePaths: ['./node_modules'] })) // added include path for material design components
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(gulp.dest('build/assets/stylesheets'));
});

// copy assets into the build directory
gulp.task('copy:assets', () => {
    return gulp
        .src('assets/**/*')
        .pipe(gulp.dest('build/assets'));
});

// copy isomorphix-router node modules package into the assets build directory
gulp.task('copy:isomorphix-router', ['copy:path-to-regexp'], () => {
    return gulp
        .src('node_modules/isomorphix-router/build/**/*')
        .pipe(gulp.dest('build/assets/javascripts/vendor/isomorphix-router/'));
});

// copy isomorphix-router path-to-regex dependency into the assets build directory
gulp.task('copy:path-to-regexp', () => {
    return gulp
        .src('node_modules/path-to-regexp/index.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/path-to-regexp/'));
});

// copy jquery node modules package into the assets build directory
gulp.task('copy:jquery', () => {
    return gulp
        .src('node_modules/jquery/dist/jquery.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/jquery/'));
});

// copy socket.io-client node modules package into the assets build directory
gulp.task('copy:socketio-client', () => {
    return gulp
        .src('node_modules/socket.io-client/dist/socket.io.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/socket.io/'));
});

// copy socket.io-client node modules package into the assets build directory
gulp.task('copy:systemjs', () => {
    return gulp
        .src('node_modules/systemjs/dist/system.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/systemjs/'));
});

// copy material design icons
gulp.task('copy:material-design-icons', () => {
    return gulp
        .src('node_modules/material-design-icons/iconfont/*')
        .pipe(gulp.dest('build/assets/fonts/vendor/material-design-icons/'));
});

gulp.task('watch', ['build'], function () {
    gulp.watch([
        'server.ts',
        'server/**/*.ts',
        'client/**/*.ts',
        'isomorphic/**/*.ts'
    ], ['build-js']);
    gulp.watch([
        'source/scss/**/*.scss'
    ], ['build-css']);
});

gulp.task('default', ['watch']);
gulp.task('build', ['build-js', 'build-css']);
