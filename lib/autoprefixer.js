const browserslist = require('browserslist');
const postcss      = require('postcss');

const Browsers = require('./browsers');
const Prefixes = require('./prefixes');

const isPlainObject = obj => Object.prototype.toString.apply(obj) === '[object Object]';

const cache = { };

const timeCapsule = function (result, prefixes) {
    if (prefixes.browsers.selected.length === 0) {
        return;
    }
    if (prefixes.add.selectors.length > 0) {
        return;
    }
    if (Object.keys(prefixes.add).length > 2) {
        return;
    }

    return result.warn(
    'Greetings, time traveller. ' +
    'We are in the golden age of prefix-less CSS, ' +
    'where Autoprefixer is no longer needed for your stylesheet.');
};

module.exports = postcss.plugin('autoprefixer', (...reqs) => {
    let options;
    if (reqs.length === 1 && isPlainObject(reqs[0])) {
        options = reqs[0];
        reqs    = undefined;
    } else if (reqs.length === 0 || reqs.length === 1 && reqs[0] == null) {
        reqs = undefined;
    } else if (reqs.length <= 2 && (reqs[0] instanceof Array || reqs[0] == null)) {
        options = reqs[1];
        reqs    = reqs[0];
    } else if (typeof reqs[reqs.length - 1] === 'object') {
        options = reqs.pop();
    }

    if (!options) {
        options = { };
    }

    if (options.browser) {
        throw new Error('Change `browser` option to `browsers` in Autoprefixer');
    }

    if (options.browsers != null) {
        reqs = options.browsers;
    }

    const loadPrefixes = function (opts) {
        const { stats }    = options;
        const browsers = new Browsers(module.exports.data.browsers, reqs, opts, stats);
        const key      = browsers.selected.join(', ') + JSON.stringify(options);
        return cache[key] || (cache[key] = new Prefixes(module.exports.data.prefixes, browsers, options));
    };

    const plugin = function (css, result) {
        const prefixes = loadPrefixes({ from: css.source != null ? css.source.input.file : undefined, env: options.env });
        timeCapsule(result, prefixes);
        if (options.remove !== false) {
            prefixes.processor.remove(css);
        }
        if (options.add !== false) {
            return prefixes.processor.add(css, result);
        }
    };

    plugin.options = options;

    plugin.info = opts => require('./info')(loadPrefixes(opts));

    return plugin;
});

// Autoprefixer data
module.exports.data = {
    browsers: require('caniuse-lite').agents,
    prefixes: require('../data/prefixes')
};

// Autoprefixer default browsers
module.exports.defaults = browserslist.defaults;

// Inspect with default Autoprefixer
module.exports.info = () => module.exports().info();
