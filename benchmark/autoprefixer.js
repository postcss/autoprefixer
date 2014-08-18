var fs   = require('fs');
var exec = require('child_process').exec;

var path = __dirname + '/../build/autoprefixer';
var file = __dirname + '/test.css';

module.exports = {
    prepare(css) {
        fs.writeFileSync(file, css);
    },

    run(callback) {
        exec(`${path} ${file} -o ${file}.out`, (error, stdout, stderr) => {
            fs.unlinkSync(file + '.out');

            process.stderr.write(stderr);
            if ( error ) process.exit(1);

            callback();
        });
    },

    clean() {
        fs.unlinkSync(file);
    }
};
