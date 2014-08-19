var fs   = require('fs-extra');
var exec = require('child_process').exec;

var path = __dirname + '/compass';

var bundle = function (command, callback) {
    exec(`cd ${path}; bundle exec ${command}`, (error, stdout, stderr) => {
        process.stderr.write(stderr);
        if ( error ) process.exit(1);
        callback();
    });
};

module.exports = {
    prepare(css) {
        css = css.replace(/([^-])transform:([^;}]+)(;|})/g,
                          '$1@include transform($2)$3').
                  replace(/transition:([^;}]+)(;|})/g,
                          '@include transition($1)$2').
                  replace(/background(-image)?:((linear|radial)([^;}]+))(;|})/g,
                          '@include background($2)$5').
                  replace(/box-sizing:([^;}]+)(;|})/g,
                          '@include box-sizing($1)$2');
        css = "@import 'compass/css3';\n" + css;
        fs.writeFileSync(path + '/test.scss', css);
    },

    run(callback) {
        bundle('sass --compass --sourcemap=none test.scss:test.css', () => {
            fs.removeSync(path + '/.sass-cache');
            callback();
        });
    },

    clean() {
        fs.unlinkSync(path + '/test.scss');
        fs.unlinkSync(path + '/test.css');
    }
};
