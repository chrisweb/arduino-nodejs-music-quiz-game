'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const merge = require('merge2');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');

// documentation: https://github.com/gulpjs/gulp/blob/master/docs/API.md

// check the coding standards and programming errors
gulp.task('lint', () => {
    const tslint = require('gulp-tslint');
    // Built-in rules are at
    // https://github.com/palantir/tslint#supported-rules
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
                configuration: './tslint.json',
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
    'copy:web-audio-api-player',
    'copy:systemjs',
    'copy:progressbarjs'
], () => {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    // merge the two output streams, this task is finished when the IO of both operations is done
    return merge([ 
        tsResult.dts.pipe(gulp.dest('build/definitions')),
        tsResult.js
            // inline source maps or add directory as sting as first parameter of write
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('build'))
    ]);
});

// gulp SASS build
gulp.task('build-css', [
    'copy:material-design-icons'
], function () {
    return gulp.src('assets/stylesheets/**/*.scss')
        .pipe(sourcemaps.init())  // Process the original sources
        //.pipe(sass({ includePaths: ['./node_modules'] })) // added include path for material design components
        .pipe(sass())
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(gulp.dest('build/assets/stylesheets'));
});

gulp.task('build-docs-css', function () {
    return gulp.src('docs/stylesheets/**/*.scss')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(sass())
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(gulp.dest('docs/stylesheets'));
});

gulp.task('build-docs-css-prod', function () {
    return gulp.src('docs/stylesheets/**/*.scss')
        .pipe(sourcemaps.init())  // Process the original sources
        .pipe(sass())
        .pipe(sourcemaps.write()) // Add the map to modified source.
        .pipe(cleanCSS({ compatibility: '*' }))
        .pipe(gulp.dest('docs/stylesheets'));
});

// copy assets into the build directory
gulp.task('copy:assets', () => {
    return gulp
        .src('assets/**/*')
        .pipe(gulp.dest('build/assets'));
});

// copy isomorphix-router from node modules package into the assets build directory
gulp.task('copy:isomorphix-router', ['copy:path-to-regexp'], () => {
    return gulp
        .src(['node_modules/isomorphix-router/build/**/*', '!node_modules/isomorphix-router/build/@types/**'])
        .pipe(gulp.dest('build/assets/javascripts/vendor/isomorphix-router/'));
});

// copy path-to-regexp from node modules into the assets build directory
gulp.task('copy:path-to-regexp', () => {
    return gulp
        .src('node_modules/path-to-regexp/index.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/path-to-regexp/'));
});

// copy jquery from node modules into the assets build directory
gulp.task('copy:jquery', () => {
    return gulp
        .src('node_modules/jquery/dist/jquery.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/jquery/'));
});

// copy socket.io-client from node modules into the assets build directory
gulp.task('copy:socketio-client', () => {
    return gulp
        .src(['node_modules/socket.io-client/dist/socket.io.js', 'node_modules/socket.io-client/dist/socket.io.js.map'])
        .pipe(gulp.dest('build/assets/javascripts/vendor/socket.io/'));
});

// copy webaudioapiplayer from node modules into the assets build directory
gulp.task('copy:web-audio-api-player', () => {
    return gulp
        .src(['node_modules/web-audio-api-player/build/**/*', '!node_modules/web-audio-api-player/build/@types/**'])
        .pipe(gulp.dest('build/assets/javascripts/vendor/web-audio-api-player/'));
});

// copy systemjs from node modules into the assets build directory
gulp.task('copy:systemjs', () => {
    return gulp
        .src(['node_modules/systemjs/dist/system.js', 'node_modules/systemjs/dist/system.js.map'])
        .pipe(gulp.dest('build/assets/javascripts/vendor/systemjs/'));
});

// copy progressbar.js from node modules into the assets build directory
gulp.task('copy:progressbarjs', () => {
    return gulp
        .src('node_modules/progressbar.js/dist/progressbar.js')
        .pipe(gulp.dest('build/assets/javascripts/vendor/progressbarjs/'));
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
gulp.task('build-docs', ['build-docs-css']);
gulp.task('build-docs-prod', ['build-docs-css-prod']);
