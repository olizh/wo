// generated on 2016-04-24 using generator-webapp 2.0.0
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

function getUrltoFile (urlSource, fileName) {
  var http = require('http');
  var url = require('url');
  var options = {
      host: url.parse(urlSource).hostname,
      path: url.parse(urlSource).pathname + unescape(url.parse(urlSource).search || '')
  }
  console.log (options.path);
  var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
          data += chunk;
      });
      //console.log (data);
      res.on('end', function () {
        var fs = require('fs');
        fs.writeFile(fileName, data, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(urlSource);
            console.log('writen to');
            console.log(fileName);
        });
      });
  });
  request.on('error', function (e) {
      console.log(e.message);
  });
  request.end();
}


function postDatatoFile (urlSource, postData, fileName) {
  var url = require('url');
  var querystring = require('querystring');
  var post_data = JSON.stringify(postData);
  var http = require('http');
  var options = {
      host: url.parse(urlSource).hostname,
      path: url.parse(urlSource).pathname + unescape(url.parse(urlSource).search),
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
      }
  }
  var request = http.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) {
          data += chunk;
      });
      res.on('end', function () {
        var fs = require('fs');
        fs.writeFile(fileName, data, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(urlSource);
            console.log('post data writen to');
            console.log('fileName');
        }); 
      });
  });
  request.on('error', function (e) {
      console.log(e.message);
  });
  request.write(post_data);
  request.end();
}

gulp.task('origami', function () {
  getUrltoFile('http://build.origami.ft.com/bundles/js?modules=o-ft-header@^2.5.15,o-table@^1.6.0', './bower_components/origami/build.js');
  getUrltoFile ('http://build.origami.ft.com/bundles/css?modules=o-ft-header@^2.5.15,o-ft-footer@^2.0.4,o-table@^1.6.0', './bower_components/origami/build.scss');
});


gulp.task('ea', function () {
  var message = {};
  message.head = {};
  message.head.transactiontype = '10001';
  message.head.source = 'web';
  message.body = {};
  message.body.ielement = {};
  message.body.ielement.num = 25;
  //http://app003.ftmailbox.com/index.php/jsapi/get_last_publish_story?day=2015-6-17&

  //postDatatoFile('http://m.ftchinese.com/eaclient/apijson.php', message, './app/api/ea001.json');
  //postDatatoFile('http://m.ftchinese.com/index.php/jsapi/get_last_publish_story?day=2016-1-8&', message, './app/api/ea001.json');
  postDatatoFile('http://app003.ftmailbox.com/index.php/jsapi/get_new_story?rows=25&', message, './app/api/ea001.json');
  message.head.transactiontype = '10003';
  postDatatoFile('http://m.ftchinese.com/eaclient/apijson.php', message, './app/api/ea003.json');
  message.head.transactiontype = '10007';
  postDatatoFile('http://m.ftchinese.com/eaclient/apijson.php', message, './app/api/ea007.json');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=nexthome', './app/api/homecontent.html');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=china', './app/api/channel.html');
  //getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=homecontentsource&date=20160108', './app/api/homecontent.html');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=nexthome&screentype=wide', './app/api/homecontentwide.html');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?', './app/api/home.tpl');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=homepagevideo&', './app/api/homepagevideo.tpl');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/phonetemplate.html?channel=skyZ&', './app/api/skyZ.tpl');
  getUrltoFile ('http://m.ftchinese.com/index.php/ft/channel/ipadvideo.html?', './app/api/ipadvideo.tpl');
  getUrltoFile ('http://m.ftchinese.com/index.php/jsapi/get_last_updatetime?', './app/api/get_last_updatetime.json');
  getUrltoFile ('http://m.ftchinese.com/index.php/jsapi/hotstory/1days?', './app/api/hotstory.json');
});

gulp.task('hp', () => {
  gulp.src('app/api/homecontent.html')
    .pipe(gulp.dest('../dev_www/frontend/tpl/phone'));
  gulp.src('app/api/homecontentwide.html')
    .pipe(gulp.dest('../dev_www/frontend/tpl/phone'));
});


gulp.task('phone', () => {
  return gulp.src('app/phone/**/*')
    .pipe(gulp.dest('dist/phone'));
});

gulp.task('api', () => {
  return gulp.src('app/api/**/*')
    .pipe(gulp.dest('dist/api'));
});

gulp.task('log', () => {
  return gulp.src('app/log/**/*')
    .pipe(gulp.dest('dist/log'));
});

gulp.task('copy', ['build'], function () {
  var replace = require('gulp-replace');
  var rename = require("gulp-rename");
  var thedatestamp = new Date().getTime();
  gulp.src('dist/**/*')
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/index.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="iphone-2014.manifest">'))
    .pipe(replace(/=phone\//g, '=iphone-2014/'))
    .pipe(rename('iphone-2014.html'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/index.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="ipad-2014.manifest">'))
    .pipe(replace(/=phone\//g, '=ipad-2014/'))
    .pipe(rename("ipad-2014.html"))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/index.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="bb-2014.manifest">'))
    .pipe(replace(/=phone\//g, '=bb-2014/'))
    .pipe(rename("bb-2014.html"))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/index.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="phone-2014.manifest">'))
    .pipe(rename("phone.html"))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/index.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="phone-2014.manifest">'))
    .pipe(rename("phoneapp.html"))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/mba.html'])
    .pipe(replace(/\<html\>/g, '<html manifest="mba-2014.manifest">'))
    .pipe(replace(/=phone\//g, '=mba-2014/'))
    .pipe(rename("mba-2014.html"))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/phone/**/*'])
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/iphone-2014'));
  gulp.src(['dist/phone/**/*'])
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/ipad-2014'));
  gulp.src(['dist/phone/**/*'])
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/bb-2014'));
    gulp.src(['dist/phone/**/*'])
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/mba-2014'));
  gulp.src(['app/cache/phone.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(rename('phone-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['app/cache/phone.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(replace(/phone\//g, 'iphone-2014/'))
    .pipe(rename('iphone-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['app/cache/phone.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(replace(/phone\//g, 'ipad-2014/'))
    .pipe(rename('ipad-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['app/cache/phone.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(replace(/phone\//g, 'bb-2014/'))
    .pipe(rename('bb-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['app/cache/android.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(rename('android-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['app/cache/mba.manifest'])
    .pipe(replace(/#changelogdatestamp/g, '#datestamp' + thedatestamp))
    .pipe(replace(/phone\//g, 'mba-2014/'))
    .pipe(rename('mba-2014.manifest'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));
  gulp.src(['dist/images/**/*'])
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/images'));

  
  // android file;
  var fs = require('fs');
  var cssbundle = fs.readFileSync('dist/phone/s.css', 'utf8');
  var googleanalytics = fs.readFileSync('dist/log/ga.js', 'utf8');
  var fa = fs.readFileSync('dist/log/analytics.js', 'utf8');
  // use jquery.min.js directly
  // to avoid gulp compiling bug
  var jqueryM = fs.readFileSync('bower_components/jquery/dist/jquery.min.js', 'utf8');
  var html5storageM = fs.readFileSync('dist/phone/html5storage-m.js', 'utf8');
  var trackingM = fs.readFileSync('dist/phone/tracking-m.js', 'utf8');
  var fastclickM = fs.readFileSync('dist/phone/fastclick-m.js', 'utf8');
  var ftscrollerM = fs.readFileSync('dist/phone/ftscroller-m.js', 'utf8');
  var mainM = fs.readFileSync('dist/phone/main-m.js', 'utf8');
  var swipeM = fs.readFileSync('dist/phone/swipe-m.js', 'utf8');

  gulp.src(['app/android.html'])
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(replace('{{cssbundle}}', cssbundle))
    .pipe(replace('{{googleanalytics}}', googleanalytics))
    .pipe(replace('{{fa}}', fa))
    .pipe(replace('{{jquery-m}}', jqueryM))
    .pipe(replace('{{html5storage-m}}', html5storageM))
    .pipe(replace('{{tracking-m}}', trackingM))
    .pipe(replace('{{fastclick-m}}', fastclickM))
    .pipe(replace('{{ftscroller-m}}', ftscrollerM))
    .pipe(replace('{{main-m}}', mainM))
    .pipe(replace('<html>', '<html manifest="android-2014.manifest">'))
    .pipe(rename('androidapp.html'))
    .pipe(gulp.dest('../testing/dev_www/mobile_webroot/'));

  console.log ('files copied');
});


gulp.task('ga', function () {
    getUrltoFile('http://m.ftchinese.com/index.php/jsapi/analytics', './app/log/ga.js');
    getUrltoFile('http://m.ftchinese.com/index.php/jsapi/analytics', './dist/log/ga.js');
});


gulp.task('publish', function () {
  gulp.src('../testing/dev_www/mobile_webroot/phone/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/phone'));
  gulp.src('../testing/dev_www/mobile_webroot/ipad-2014/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/ipad-2014'));
  gulp.src('../testing/dev_www/mobile_webroot/iphone-2014/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/iphone-2014'));
  gulp.src('../testing/dev_www/mobile_webroot/bb-2014/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/bb-2014'));
  gulp.src('../testing/dev_www/mobile_webroot/mba-2014/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/mba-2014'));
  gulp.src('../testing/dev_www/mobile_webroot/log/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/log'));
  gulp.src('../testing/dev_www/mobile_webroot/assets/svg/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/assets/svg'));
  gulp.src('../testing/dev_www/mobile_webroot/*.manifest')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/phone.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/phoneapp.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/iphone-2014.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/bb-2014.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/ipad-2014.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/androidapp.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/mba-2014.html')
    .pipe(gulp.dest('../dev_www/mobile_webroot/'));
  gulp.src('../testing/dev_www/mobile_webroot/images/**/*')
    .pipe(gulp.dest('../dev_www/mobile_webroot/images'));
});



gulp.task('styles', () => {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
const testLintOptions = {
  env: {
    mocha: true
  }
};

gulp.task('lint', lint('app/scripts/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras', 'api', 'phone', 'log', 'ga'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
