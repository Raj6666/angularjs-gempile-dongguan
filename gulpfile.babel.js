import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import watch from 'gulp-watch';
import shell from 'gulp-shell';
import fs from 'fs-extra';
import zip from 'gulp-zip';

const BUILD_PATH = 'build';
const APP_PATH = 'app';

/**
 *  gulpfile.babel.js
 *
 *  Use `gulp dev` start dev-server and `gulp-build` to build project
 */
/* Task that cleans 'build' */
gulp.task('clean', () => del(BUILD_PATH));

/* Task that copies necessary files to 'build' */
gulp.task('copy', () => ['app/lib', 'app/index.html'].map(dir => fs.copySync(dir, dir.replace(APP_PATH, BUILD_PATH))));
gulp.task('copy-views', () => ['app/views', 'app/index.html'].map(dir => fs.copySync(dir, dir.replace(APP_PATH, BUILD_PATH))));
gulp.task('watch-views', () => watch(['app/views/**/*', 'app/*.html'], () => runSequence('copy-views')));
gulp.task('webpack-dev-server', shell.task('webpack-dev-server --progress --profile --colors --port 8081 --define CONFIG=\'"dev"\''));
gulp.task('webpack-dev-server-DG', shell.task('webpack-dev-server --progress --profile --colors --port 8081 --define CONFIG=\'"prodDG"\''));
gulp.task('webpack', shell.task('webpack --progress --profile --colors --define CONFIG=\'"devBuild"\''));
gulp.task('webpack-SIT', shell.task('webpack --progress --profile --colors --define CONFIG=\'"devBuildSIT"\''));
gulp.task('webpack-DG', shell.task('webpack --progress --profile --colors --define CONFIG=\'"prodDG"\''));
gulp.task('webpack-DGDEV', shell.task('webpack --progress --profile --colors --define CONFIG=\'"prodDGDEV"\''));
gulp.task('zip', () => gulp.src(['build/**']).pipe(zip('0.4.8-20180725.zip')).pipe(gulp.dest('export')));

// gulp process control
gulp.task('dev', () => runSequence('clean', 'copy', ['watch-views', 'webpack-dev-server']));//本地运行环境
gulp.task('build', () => runSequence('clean', 'copy', 'webpack', 'zip'));//本地环境打包
gulp.task('build-SIT', () => runSequence('clean', 'copy', 'webpack-SIT', 'zip')); // 本地测试环境打包
gulp.task('run-DG', () => runSequence('clean', 'copy', ['watch-views', 'webpack-dev-server-DG']));//东莞运行环境
gulp.task('build-DG', () => runSequence('clean', 'copy', 'webpack-DG', 'zip'));//东莞正式环境打包
gulp.task('build-DGDEV', () => runSequence('clean', 'copy', 'webpack-DGDEV'));//东莞测试环境打包