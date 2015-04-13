var path = require('path');

var escape = function (str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

var regexp = ['binary.js', 'test', 'benchmark'].map(function (i) {
    var str = path.join(__dirname, i);
    if ( i.indexOf('.js') === -1 ) str += path.sep;
    return '^' + escape(str);
}).join('|');

require('babel-core/register')({
    only:   new RegExp('(' + regexp + ')'),
    ignore: false,
    loose: 'all'
});
