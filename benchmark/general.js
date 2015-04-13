var path = require('path');
var fs   = require('fs-extra');

var css = fs.readFileSync(path.join(__dirname, 'cache/github.css')).toString();

var scss = css.replace(/([^-])transform:([^;}]+)(;|})/g,
                       '$1@include transform($2)$3').
               replace(/transition:([^;}]+)(;|})/g,
                       '@include transition($1)$2').
               replace(/background(-image)?:((linear|radial)([^;}]+))(;|})/g,
                       '@include background($2)$5').
               replace(/box-sizing:([^;}]+)(;|})/g,
                       '@include box-sizing($1)$2');
scss = "@import 'compass/css3';\n" + scss;
fs.writeFileSync(path.join(__dirname, 'cache/compass.scss'), scss);

var styl = css.replace('@charset "UTF-8";', "@import 'nib';")
              .replace(/\}/g, '}\n').replace(/(\w)\[[^\]]+\]/g, '$1')
              .replace(/filter:[^;}]+;?/ig, '')
              .replace(/(@keyframes[^\{]+)\{/ig, '$1 {')
              .replace(/url\([^\)]+\)/ig, 'white');
fs.writeFileSync(path.join(__dirname, 'cache/stylus.styl'), styl);

var exec = require('child_process').exec;
var run  = function (command, callback) {
    exec(command, function (error, stdout, stderr) {
        process.stderr.write(stderr);
        if ( error ) process.exit(1);
        callback();
    });
};
var bundle = function (command, callback) {
    var home = __dirname;
    run('cd ' + home + '; bundle exec ' + command, callback);
};

module.exports = {
    name:   'GitHub',
    maxTime: 15,
    tests: [
        {
            name: 'Autoprefixer',
            defer: true,
            fn: function (done) {
                var bin  = path.join(__dirname, '../build/autoprefixer');
                var file = path.join(__dirname, '/cache/github.css');
                run(bin + ' ' + file + ' -o ' + file + '.out', function () {
                    done.resolve();
                });
            }
        },
        {
            name: 'Compass',
            defer: true,
            fn: function (done) {
                var f = 'cache/compass.scss:cache/compass.scss.css';
                bundle('sass -C --compass --sourcemap=none ' + f, function () {
                    done.resolve();
                });
            }
        },
        {
            name: 'Stylus',
            defer: true,
            fn: function (done) {
                var bin  = path.join(__dirname, '../node_modules/.bin/stylus');
                var file = path.join(__dirname, 'cache/stylus.styl');
                run(bin + ' --use nib ' + file, function () {
                    done.resolve();
                });
            }
        }
    ]
};
