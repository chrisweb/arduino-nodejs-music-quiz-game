
'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const merge = require('merge2');  // Requires separate installation 

// Check the coding standards and programming errors
gulp.task('lint', () => {
  const tslint = require('gulp-tslint');
  // Built-in rules are at
  // https://github.com/palantir/tslint#supported-rules
  const tslintConfig = require('./tslint.json');
  return gulp
      .src([
        'source/**/*.ts'
      ])
      .pipe(tslint({
        tslint: require('tslint').default,
        configuration: tslintConfig,
        formatter: 'prose',
      }))
      .pipe(tslint.report({emitError: true}));
});

gulp.task('build', () => {
    var tsResult = tsProject.src()
        .pipe(tsProject());
    
    return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
        tsResult.dts.pipe(gulp.dest('build/definitions')),
        tsResult.js.pipe(gulp.dest('build'))
    ]);
});

gulp.task('watch', ['build'], function () {
    gulp.watch('source/**/*.ts', ['build']);
});