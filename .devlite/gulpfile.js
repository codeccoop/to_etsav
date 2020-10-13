// SYS
const path = require("path");
const fs = require("fs");

// VENDOR
const { src, dest, parallel, series, watch } = require('gulp');
const del = require('del');
const browserify = require('browserify');
const envify = require("envify/custom");
// const http = require("http");

// GULP PLUGINS
const htmlmin = require('gulp-html-minifier');
const babel = require('gulp-babel');
const stylus = require('gulp-stylus');
const image = require('gulp-image');
const vinylSource = require('vinyl-source-stream');
const vinylBuffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const replace = require('gulp-token-replace');
const connect = require('gulp-connect');
const rename = require('gulp-rename');


const rc = (function () {
  const template = {
    dist: "dist",
    src: "src",
    statics: "statics"
  }
  try {
    const user = require("../devliterc.js");
    Object.keys(template).map((k) => {
      user[k] = user[k] || template[k];
    });
    return user;
  } catch (e) {
    console.error(e);
    console.warn("Not devlite.rc file found");
    return template;
  }
})();

function globals () {
  let globals;
  try {
    globals = require(process.env.NODE_ENV === "pro" ?
      "../globals/global.pro.js" : process.env.NODE_ENV === "pre" ?
      "../globals/global.pre.js" : process.env.NODE_ENV === "dev" ?
      "../globals/global.dev.js" : "../globals/global.custom.js");

    
    for (let k in globals) {
      globals[k.toUpperCase()] = globals[k];
      delete globals[k.toLowerCase()];
      process.env[k.toUpperCase()] = process.env[k.toUpperCase()] || globals[k.toUpperCase()];
    }

  } catch (err) {
    console.log(err);
    throw new Error("No build folder found. Please define your build environment config files into a build folder on your root directory.");
  }
  
  try {
    globals.ENVIRON = require("../envs.js")[process.env.NODE_ENV];
    return globals;
  } catch (err) {
    console.log(err);
    throw new Error("Not envs.js found. Please define your client environment variables in a file and name it envs.js on your root directory.");
  }
}
globals.description = "Retrive object from global files."

function clean (done) {
  return del([
    path.join(rc.dist + "\*")
  ], {
    force: true
  });
}
clean.description = "Remove dist folder contents";
// exports.clean = clean;


function dist (done) {
  const statics = path.join(rc.dist, "statics");
  return src("*.*", {read: false})
    .pipe(dest(statics));
};
dist.description = "Create dist directory structure";
// exports.dist = dist;

function deploy (done) {
  console.log("[DEPLOY TASK]");
  console.log("FROM: ", rc.dist);
  console.log("TO: ", rc.deploy);
  return src(path.join(rc.dist, "\*"))
    .pipe(dest(path.join(rc.deploy)));
}
deploy.description = 'Deploy bundling to the server';
// exports.deploy;

function js (done) {
  const b = browserify({
      entries: path.join(rc.src, "index.js"),
      debug: true
  });

  b.transform(envify(globals()));

  var proc = b.bundle()
    .pipe(vinylSource('bundle.js'))
    .pipe(vinylBuffer());

  if (process.env.NODE_ENV === 'PRO') {
    proc = proc.pipe(sourcemaps.init({loadMaps: true}))
      .pipe(babel({presets: ['@babel/preset-env']}))
      .pipe(uglify())
      .on('error', console.error)
    .pipe(sourcemaps.write());
  } else {
    proc = proc.pipe(connect.reload());
  }

  return proc.pipe(dest(rc.dist));
}
js.description = 'Bundle js files, compile them with buble and uglify and move the output to the dist folder';
// exports.js = js;

function css (done) {
  return src(path.join(rc.src, "index.styl"))
    .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(stylus({
        compress: true,
        'include css': true,
        rawDefine: globals()
      }))
    .pipe(sourcemaps.write())
    .pipe(rename('bundle.css'))
    .pipe(connect.reload())
    .pipe(dest(rc.dist));
}
css.descriptions = "Bundle all styuls files, compile them and move the output to the dist folder";
// exports.css = css;

function statics (done) {
  return src(path.join(rc.statics, "\*\*/\*"))
    .pipe(image())
    .pipe(connect.reload())
    .pipe(dest(path.join(rc.dist, rc.statics)));
}
statics.description = "Move statics to dist folder";


function html (done) {
  return src(path.join(rc.src, "index.html"))
    .pipe(replace({global: globals()}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(connect.reload())
    .pipe(dest(rc.dist));
}
html.description = "Minify index.html and put it on the dist folder";
// exports.html = html;

const bundle = parallel(html, js, css, statics);
//  exports.bundle = bundle;

const pipeline = series(clean, dist, bundle);
// exports.pipeline = pipeline;


const serve = series(pipeline, function serve (done) {
  connect.server({
    livereload: true,
    port: 8050,
    root: rc.dist,
    debug: true,
    name: 'lite-dev',
    middleware: function (connect, opt) {
      return [function (req, res, next) {
        res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.setHeader("Pragme", "no-cache");
        res.setHeader("Expires", "-1");
        next();
      }];
    }
  });

  watch(path.join(rc.src, "index.html"), series(html));
  watch(path.join(rc.src, "\*\*/\*.js"), series(js));
  watch(path.join(rc.src, "\*\*/\*.styl|css"), series(css));
  watch(path.join(rc.statics, "\*\*/\*"), series(statics));
});
serve.description = "Setup a static server, start a livereload listener and put gulp watching for changes";
exports.serve = serve;

const build = series(pipeline, deploy, function (done) {
    return done();
});
build.description = "execute build rutine and deploy the result on the server";
exports.build = build;


function defaultTask () {
  serve();
}

exports.default = defaultTask;
