var gulp = require('gulp');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var fs = require('fs');
var _ = require('lodash');
var jasmine = require('gulp-jasmine');
var del = require('del');

var scripts = require('./app.scripts.json');

var source = {
    js: {
        main: [
            'src/Fizzbuzz.js'
            ],
        src: [
            'spec/FizbuzzSpec.js'
        ],
        build: [
            'build/katas.js',
            'build/specs.js'
        ]
    }
};

var destinations = {
    js: 'build',
    styles: 'build'
};

gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del(['build']);
});

function build(){
    gulp.src(source.js.main)
        .pipe(concat('katas.js'))
        .pipe(gulp.dest(destinations.js));

    return gulp.src(source.js.src)
        .pipe(concat('specs.js'))
        .pipe(gulp.dest(destinations.js));
}

gulp.task('build', function(){
    build(); //.pipe(connect.reload());
});

gulp.task('watch', function(){
    gulp.watch(source.js.main, ['js']);
});

gulp.task('connect', function() {
    connect.server({
        port: 8888,
        livereload: true
    });
});

gulp.task('stop', function () {
    connect.serverClose(); 
});

gulp.task('vendor', function(){
    _.forIn(scripts.chunks, function(chunkScripts, chunkName){
        var paths = [];
        chunkScripts.forEach(function(script){
            var scriptFileName = scripts.paths[script];

            if (!fs.existsSync(__dirname + '/' + scriptFileName)) {

                throw console.error('Required path doesn\'t exist: ' + __dirname + '/' + scriptFileName, script)
            }
            paths.push(scriptFileName);
        });
        gulp.src(paths)
            .pipe(concat(chunkName + '.js')).pipe(uglify())
            //.on('error', swallowError)
            .pipe(gulp.dest(destinations.js))
    });

    _.forIn(scripts.styles, function(chunkScripts, chunkName){
        var paths = [];
        chunkScripts.forEach(function(script){
            var scriptFileName = scripts.paths[script];

            if (!fs.existsSync(__dirname + '/' + scriptFileName)) {

                throw console.error('Required path doesn\'t exist: ' + __dirname + '/' + scriptFileName, script)
            }
            paths.push(scriptFileName);
        });
        gulp.src(paths)
            .pipe(concat(chunkName + '.css'))
            .pipe(concat('styles.css'))
            .pipe(gulp.dest(destinations.styles))
    })
});

gulp.task('test', function() {
    build().on('end', function () {
        gulp.src(source.js.build)
            .pipe(concat('test.js'))
            .pipe(gulp.dest(destinations.js))
            // gulp-jasmine works on filepaths so you can't have any plugins before it 
            .pipe(jasmine())   
    });
});

gulp.task('prod', ['vendor', 'build']);
gulp.task('dev', ['vendor', 'build', 'watch', 'connect']);
gulp.task('default', ['dev']);
