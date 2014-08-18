var fs   = require('fs');
var exec = require('child_process').exec;

var path = __dirname + '/../node_modules/.bin/stylus';
var file = __dirname + '/test.styl';

module.exports = {
    prepare(css) {
        css = css.replace('@charset "UTF-8";', "@import 'nib';");
        css = css.replace(/\}/g, "}\n").replace(/(\w)\[[^\]]+\]/g, '$1');
        css = css.replace(/filter:[^;}]+;?/ig, '');
        css = css.replace(/(@keyframes[^\{]+)\{/ig, '$1 {');
        css = css.replace(/url\([^\)]+\)/ig, 'white');
        fs.writeFileSync(file, css);
    },

    run(callback) {
        exec(`${path} --use nib ${file}`, (error, stdout, stderr) => {
            fs.unlinkSync(__dirname + '/test.css');

            process.stderr.write(stderr);
            if ( error ) process.exit(1);

            callback();
        });
    },

    clean() {
        fs.unlinkSync(file);
    }
};
