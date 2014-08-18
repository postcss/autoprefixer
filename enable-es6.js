var es6tr = require('es6-transpiler');
var fs    = require('fs');

var origin = require.extensions['.js'];

require.extensions['.js'] = function(module, file) {
    var isLib   = file.indexOf(__dirname + '/binary.js') != -1;
    var isTest  = file.indexOf(__dirname + '/test')      != -1;
    var isBench = file.indexOf(__dirname + '/benchmark') != -1;

    if ( isLib || isTest || isBench ) {
        var opts = { filename: file, includePolyfills: true };
        if ( isTest ) {
            opts.disallowUnknownReferences = false;
        }

        var result = es6tr.run(opts);
        if ( result.errors.length ) {
            process.stderr.write("Can't compile " + file + ": \n\n");
            for ( var i = 0; i < result.errors.length; i++ ) {
                process.stderr.write(result.errors[i] + "\n");
            }
            process.exit(-1);
        }

        return module._compile(result.src, file);
    } else {
        return origin.apply(this, arguments);
    }
};
